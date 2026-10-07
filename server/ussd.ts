import { getSql } from './db.js'

export const USSD_MERCHANT_CODE = '550120'

export function atServiceCode() {
  return (process.env.AT_SERVICE_CODE || '*384*550120#').trim()
}

type OpenInvoice = {
  invoice: string
  amountLabel: string
  appointmentId: string
}

const openInvoices = new Map<string, OpenInvoice>()

export function ussdPhoneKey(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `250${digits.slice(1)}`
  return digits
}

async function ensureUssdTable() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS ussd_checkouts (
      phone TEXT PRIMARY KEY,
      invoice TEXT NOT NULL,
      amount_label TEXT NOT NULL,
      appointment_id TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function rememberUssdInvoice(input: { phone?: string; invoice?: string; amountLabel?: string; appointmentId?: string }) {
  const phone = ussdPhoneKey(input.phone || '')
  const invoice = (input.invoice || '').trim().slice(0, 40)
  const amountLabel = (input.amountLabel || '').trim().slice(0, 40)
  const appointmentId = (input.appointmentId || '').trim().slice(0, 80)
  if (!phone || !invoice || !amountLabel || !appointmentId) {
    return { ok: false as const, message: 'Missing invoice for this USSD session.' }
  }
  const bill = { invoice, amountLabel, appointmentId }
  openInvoices.set(phone, bill)
  await ensureUssdTable()
  const sql = getSql()
  await sql`
    INSERT INTO ussd_checkouts (phone, invoice, amount_label, appointment_id)
    VALUES (${phone}, ${invoice}, ${amountLabel}, ${appointmentId})
    ON CONFLICT (phone) DO UPDATE SET
      invoice = EXCLUDED.invoice,
      amount_label = EXCLUDED.amount_label,
      appointment_id = EXCLUDED.appointment_id,
      updated_at = NOW()
  `
  return { ok: true as const, serviceCode: atServiceCode() }
}

async function openInvoiceFor(phoneNumber: string) {
  const phone = ussdPhoneKey(phoneNumber)
  const cached = openInvoices.get(phone)
  if (cached) return cached
  await ensureUssdTable()
  const sql = getSql()
  const rows = await sql<{ invoice: string; amount_label: string; appointment_id: string }[]>`
    SELECT invoice, amount_label, appointment_id
    FROM ussd_checkouts
    WHERE phone = ${phone}
  `
  const row = rows[0]
  if (!row) return undefined
  const bill = { invoice: row.invoice, amountLabel: row.amount_label, appointmentId: row.appointment_id }
  openInvoices.set(phone, bill)
  return bill
}

export function ussdFieldsFrom(body: unknown) {
  const source =
    typeof body === 'string'
      ? Object.fromEntries(new URLSearchParams(body))
      : body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {}
  return {
    sessionId: String(source.sessionId || ''),
    serviceCode: String(source.serviceCode || atServiceCode()),
    phoneNumber: String(source.phoneNumber || ''),
    text: source.text == null ? '' : String(source.text),
  }
}

function con(body: string) {
  return `CON ${body}`
}

function end(body: string) {
  return `END ${body}`
}

function rootMenu() {
  return `Ubuzima Bwiza
1. Send money
2. Pay bill
3. Pay merchant
4. My account
0. Exit`
}

export async function africastalkingUssd(input: { text?: string; phoneNumber?: string }) {
  const steps = input.text ? input.text.split('*') : []
  const invoice = await openInvoiceFor(input.phoneNumber || '')

  if (steps.length === 0) return con(rootMenu())
  if (steps[0] === '0') return end('Thank you for using Ubuzima Bwiza.')
  if (steps[0] !== '3') return con(`Invalid choice.\n${rootMenu()}`)
  if (steps.length === 1) return con('Pay merchant\nEnter merchant code')
  if (steps[1] !== USSD_MERCHANT_CODE) return con(`Merchant not found. Use ${USSD_MERCHANT_CODE}.\nEnter merchant code`)
  if (!invoice) return end('No invoice is open for this number. Start checkout in Ubuzima Bwiza and dial again.')
  if (steps.length === 2) {
    return con(`Ubuzima Bwiza\n${invoice.invoice}\n${invoice.amountLabel}\n1. Accept\n2. Decline`)
  }
  if (steps[2] === '2') return end('Payment cancelled.')
  if (steps[2] !== '1') {
    return con(`Invalid choice.\n${invoice.invoice}\n${invoice.amountLabel}\n1. Accept\n2. Decline`)
  }
  if (steps.length === 3) return con(`Enter PIN to pay ${invoice.amountLabel}`)
  if (!/^\d{4}$/.test(steps[3] || '')) return con('Enter the 4-digit PIN. It is not stored.')
  return end(`Payment received\n${invoice.invoice}\n${invoice.amountLabel}\nUbuzima Bwiza`)
}
