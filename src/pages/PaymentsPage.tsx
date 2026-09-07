import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, StatusBadge } from '../components/dashboard/Shell'
import { useAuth } from '../context/AuthContext'
import type { Appointment, PaymentMethod } from '../data'
import {
  formatCardNumber,
  formatExpiry,
  formatRwandanPhone,
  invoiceRef,
  isValidCvc,
  isValidExpiry,
  isValidRwandanPhone,
  maskCard,
} from '../lib/payFormat'
import {
  appointmentReceiptHtml,
  downloadPrintableReport,
  formatRwf,
  methodLabel,
} from '../lib/reports'

const methods: Array<{ id: PaymentMethod; label: string; hint: string }> = [
  { id: 'momo', label: 'MTN MoMo', hint: 'Approve the prompt on your MTN number' },
  { id: 'airtel', label: 'Airtel Money', hint: 'Approve the prompt on your Airtel number' },
  { id: 'card', label: 'Visa / Mastercard', hint: 'Pay securely by card' },
  { id: 'cash', label: 'Pay at facility', hint: 'Settle at hospital reception' },
]

const STEPS = [
  { id: 'review', label: 'Invoice' },
  { id: 'method', label: 'Method' },
  { id: 'details', label: 'Details' },
  { id: 'confirm', label: 'Pay' },
  { id: 'done', label: 'Receipt' },
] as const

type Step = (typeof STEPS)[number]['id']

function CheckoutSteps({ current }: { current: Step }) {
  const index = STEPS.findIndex((item) => item.id === current)
  return (
    <ol className="pay-steps" aria-label="Payment steps">
      {STEPS.map((item, i) => (
        <li
          key={item.id}
          className={`pay-step${i === index ? ' current' : ''}${i < index ? ' done' : ''}`}
        >
          <span>{i + 1}</span>
          {item.label}
        </li>
      ))}
    </ol>
  )
}

function InvoiceSummary({ apt }: { apt: Appointment }) {
  return (
    <div className="pay-invoice">
      <div className="pay-invoice-head">
        <div>
          <p className="eyebrow">Ubuzima Bwiza</p>
          <h3>Consultation invoice</h3>
        </div>
        <strong>{invoiceRef(apt.id)}</strong>
      </div>
      <dl className="pay-lines">
        <div>
          <dt>Patient</dt>
          <dd>{apt.patientName}</dd>
        </div>
        <div>
          <dt>Clinician</dt>
          <dd>
            {apt.doctorName}
            <span>
              {apt.specialty} · {apt.type === 'video' ? 'Video visit' : 'In-person'}
            </span>
          </dd>
        </div>
        <div>
          <dt>Schedule</dt>
          <dd>
            {apt.date} at {apt.time}
          </dd>
        </div>
        <div>
          <dt>Consultation</dt>
          <dd>{formatRwf(apt.amount)}</dd>
        </div>
        <div>
          <dt>Service fee</dt>
          <dd>0 RWF</dd>
        </div>
        <div className="total">
          <dt>Amount due</dt>
          <dd>{formatRwf(apt.amount)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function PaymentsPage() {
  const { user, appointments } = useAuth()
  const [params] = useSearchParams()
  const focusId = params.get('apt')
  const mine = useMemo(
    () => appointments.filter((a) => a.patientName === user?.name),
    [appointments, user],
  )
  const unpaid = mine.filter((a) => a.paymentStatus !== 'paid')
  const paid = mine.filter((a) => a.paymentStatus === 'paid')
  const dueTotal = unpaid.reduce((sum, apt) => sum + (apt.amount || 0), 0)
  const paidTotal = paid.reduce((sum, apt) => sum + (apt.amount || 0), 0)

  return (
    <div className="stack">
      <div className="toolbar">
        <div>
          <h2>Payments</h2>
          <p className="lead" style={{ marginBottom: 0 }}>
            Secure checkout for consultations. Receipts stay in your account.
          </p>
        </div>
      </div>

      <div className="pay-summary">
        <article>
          <span>Amount due</span>
          <strong>{formatRwf(dueTotal)}</strong>
        </article>
        <article>
          <span>Paid</span>
          <strong>{formatRwf(paidTotal)}</strong>
        </article>
        <article>
          <span>Receipts</span>
          <strong>{paid.length}</strong>
        </article>
      </div>

      <h3>Invoices due</h3>
      <div className="table">
        {unpaid.length === 0 ? (
          <EmptyState text="No unpaid invoices." />
        ) : (
          unpaid.map((apt) => (
            <div className={`table-row${focusId === apt.id ? ' highlight-row' : ''}`} key={apt.id}>
              <div>
                <strong>
                  {invoiceRef(apt.id)} · {formatRwf(apt.amount)}
                </strong>
                <p>
                  {apt.doctorName} · {apt.date} at {apt.time} · {apt.specialty}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.paymentStatus} />
                <Link to={`/pay/${apt.id}`} className="btn btn-primary">
                  Pay invoice
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <h3>Paid receipts</h3>
      <div className="table">
        {paid.length === 0 ? (
          <EmptyState text="No paid receipts yet." />
        ) : (
          paid.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>
                  {apt.receiptId} · {formatRwf(apt.amount)}
                </strong>
                <p>
                  {apt.doctorName} · {methodLabel(apt.paymentMethod)}
                  {apt.paidAt ? ` · ${new Date(apt.paidAt).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status="paid" />
                <Link to={`/pay/${apt.id}`} className="btn btn-outline">
                  View receipt
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    downloadPrintableReport({
                      title: 'Official payment receipt',
                      subtitle: 'Ubuzima Bwiza · Digital health services',
                      htmlBody: appointmentReceiptHtml(apt),
                    })
                  }
                >
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function PayAppointmentPage() {
  const { id } = useParams()
  const { appointments, payAppointment, user } = useAuth()
  const apt = appointments.find((a) => a.id === id)
  const [step, setStep] = useState<Step>(apt?.paymentStatus === 'paid' ? 'done' : 'review')
  const [method, setMethod] = useState<PaymentMethod>('momo')
  const [phone, setPhone] = useState(user?.phone ?? '0781 011 343')
  const [cardName, setCardName] = useState(user?.name ?? '')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(apt?.receiptId ?? '')

  if (!apt) return <EmptyState text="Invoice not found." />

  const latest = appointments.find((a) => a.id === apt.id) ?? apt
  const paid = latest.paymentStatus === 'paid'

  const validateDetails = () => {
    if (method === 'momo' || method === 'airtel') {
      if (!isValidRwandanPhone(phone)) {
        setError('Enter a valid Rwandan mobile money number, for example 0781 011 343.')
        return false
      }
    }
    if (method === 'card') {
      if (cardNumber.replace(/\D/g, '').length !== 16) {
        setError('Enter a 16-digit card number.')
        return false
      }
      if (cardName.trim().length < 3) {
        setError('Enter the name on the card.')
        return false
      }
      if (!isValidExpiry(expiry)) {
        setError('Enter a valid expiry date (MM/YY).')
        return false
      }
      if (!isValidCvc(cvc)) {
        setError('Enter a valid CVC.')
        return false
      }
    }
    setError('')
    return true
  }

  const processPayment = () => {
    if (paid) {
      setStep('done')
      return
    }
    setLoading(true)
    setError('')
    const delay = method === 'cash' ? 600 : 1600
    window.setTimeout(() => {
      const result = payAppointment(latest.id, method)
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        setStep('details')
        return
      }
      setReceipt(result.receiptId ?? '')
      setStep('done')
    }, delay)
  }

  const onDetailsNext = (event: FormEvent) => {
    event.preventDefault()
    if (!validateDetails()) return
    setStep('confirm')
  }

  const methodHint =
    method === 'momo'
      ? `A collection request will be sent to ${formatRwandanPhone(phone)}.`
      : method === 'airtel'
        ? `An Airtel Money prompt will be sent to ${formatRwandanPhone(phone)}.`
        : method === 'card'
          ? `Card ${maskCard(cardNumber)} will be charged ${formatRwf(latest.amount)}.`
          : 'Pay this invoice at hospital reception before your visit.'

  return (
    <div className="stack pay-checkout">
      <div>
        <p className="pill">Secure checkout</p>
        <h2>{paid ? 'Payment receipt' : 'Pay consultation'}</h2>
      </div>
      <CheckoutSteps current={paid ? 'done' : step} />

      {step === 'review' && !paid ? (
        <>
          <InvoiceSummary apt={latest} />
          <div className="row-actions">
            <Link to="/my-appointments" className="btn btn-outline">
              Back
            </Link>
            <button className="btn btn-primary" type="button" onClick={() => setStep('method')}>
              Continue to payment
            </button>
          </div>
        </>
      ) : null}

      {step === 'method' && !paid ? (
        <>
          <div className="pay-methods">
            {methods.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pay-method${method === item.id ? ' active' : ''}`}
                onClick={() => setMethod(item.id)}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </button>
            ))}
          </div>
          <div className="row-actions">
            <button className="btn btn-outline" type="button" onClick={() => setStep('review')}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={() => setStep('details')}>
              Continue
            </button>
          </div>
        </>
      ) : null}

      {step === 'details' && !paid ? (
        <form className="search-card auth-form" onSubmit={onDetailsNext}>
          {method === 'momo' || method === 'airtel' ? (
            <div className="field">
              <label htmlFor="phone">Mobile money number</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatRwandanPhone(e.target.value))}
                placeholder="0781 011 343"
                inputMode="tel"
                required
              />
              <p className="field-hint">Use the number registered for {methodLabel(method)}.</p>
            </div>
          ) : null}

          {method === 'card' ? (
            <>
              <div className="field">
                <label htmlFor="cardName">Name on card</label>
                <input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  autoComplete="cc-name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="card">Card number</label>
                <input
                  id="card"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="ACCT-000015"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  required
                />
              </div>
              <div className="pay-card-row">
                <div className="field">
                  <label htmlFor="exp">Expiry</label>
                  <input
                    id="exp"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="12/28"
                    autoComplete="cc-exp"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="cvc">CVC</label>
                  <input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    required
                  />
                </div>
              </div>
            </>
          ) : null}

          {method === 'cash' ? (
            <p className="lead">
              A payment voucher will be created. Present invoice {invoiceRef(latest.id)} at reception
              with {formatRwf(latest.amount)}.
            </p>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
          <div className="row-actions">
            <button className="btn btn-outline" type="button" onClick={() => setStep('method')}>
              Back
            </button>
            <button className="btn btn-primary" type="submit">
              Review and pay
            </button>
          </div>
        </form>
      ) : null}

      {step === 'confirm' && !paid ? (
        <div className="search-card auth-form">
          <InvoiceSummary apt={latest} />
          <p className="lead">{methodHint}</p>
          {error ? <p className="error">{error}</p> : null}
          {loading ? (
            <p className="success">
              {method === 'card'
                ? 'Authorising card payment…'
                : method === 'cash'
                  ? 'Recording facility payment…'
                  : 'Waiting for mobile money approval…'}
            </p>
          ) : null}
          <div className="row-actions">
            <button className="btn btn-outline" type="button" disabled={loading} onClick={() => setStep('details')}>
              Back
            </button>
            <button className="btn btn-primary" type="button" disabled={loading} onClick={processPayment}>
              {loading ? 'Processing…' : `Pay ${formatRwf(latest.amount)}`}
            </button>
          </div>
          <p className="field-hint">Encrypted connection · Amounts in RWF · Receipt issued immediately</p>
        </div>
      ) : null}

      {step === 'done' || paid ? (
        <div className="search-card auth-form">
          <p className="success">Payment complete. Keep this receipt for your records.</p>
          <InvoiceSummary apt={appointments.find((a) => a.id === latest.id) ?? latest} />
          <p className="lead">
            Receipt {receipt || latest.receiptId || invoiceRef(latest.id)} · {methodLabel(latest.paymentMethod ?? method)}
          </p>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                downloadPrintableReport({
                  title: 'Official payment receipt',
                  subtitle: 'Ubuzima Bwiza · Digital health services',
                  htmlBody: appointmentReceiptHtml(appointments.find((a) => a.id === latest.id) ?? latest),
                })
              }
            >
              Download receipt
            </button>
            {latest.type === 'video' && latest.status === 'approved' ? (
              <Link to={`/visit/${latest.id}`} className="btn btn-outline">
                Open consultation
              </Link>
            ) : (
              <Link to="/my-appointments" className="btn btn-outline">
                Appointments
              </Link>
            )}
            <Link to="/payments" className="btn btn-outline">
              All payments
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
