import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { UssdSession } from '../components/UssdSession'
import { WalletPrompt } from '../components/WalletPrompt'
import { EmptyState, StatusBadge } from '../components/dashboard/Shell'
import { useAuth } from '../context/AuthContext'
import { useAppText } from '../context/ContentContext'
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
} from '../lib/reports'
import { AT_SERVICE_CODE, phonePrefixMismatch, USSD_MERCHANT_CODE } from '../lib/ussd'

const methods: Array<{ id: PaymentMethod; labelKey: string; hintKey: string }> = [
  { id: 'momo', labelKey: 'payments.momo', hintKey: 'ui.momoHint' },
  { id: 'airtel', labelKey: 'payments.airtel', hintKey: 'ui.airtelHint' },
  { id: 'card', labelKey: 'ui.cardMethod', hintKey: 'ui.cardHint' },
  { id: 'cash', labelKey: 'ui.cashMethod', hintKey: 'ui.cashHint' },
]

const STEPS = [
  { id: 'review', labelKey: 'ui.stepInvoice' },
  { id: 'method', labelKey: 'ui.stepMethod' },
  { id: 'details', labelKey: 'ui.stepDetails' },
  { id: 'confirm', labelKey: 'ui.stepPay' },
  { id: 'done', labelKey: 'ui.stepReceipt' },
] as const

type Step = (typeof STEPS)[number]['id']

function payMethodName(method: PaymentMethod | undefined, translate: (key: string) => string) {
  if (method === 'momo') return translate('payments.momo')
  if (method === 'airtel') return translate('payments.airtel')
  if (method === 'card') return translate('payments.card')
  if (method === 'cash') return translate('payments.cash')
  if (method === 'ussd') return translate('payments.ussd')
  return ''
}

function CheckoutSteps({ current }: { current: Step }) {
  const { t } = useAppText()
  const index = STEPS.findIndex((item) => item.id === current)
  return (
    <ol className="pay-steps" aria-label="Payment steps">
      {STEPS.map((item, i) => (
        <li
          key={item.id}
          className={`pay-step${i === index ? ' current' : ''}${i < index ? ' done' : ''}`}
        >
          <span>{i + 1}</span>
          {t(item.labelKey)}
        </li>
      ))}
    </ol>
  )
}

function InvoiceSummary({ apt }: { apt: Appointment }) {
  const { t } = useAppText()
  return (
    <div className="pay-invoice">
      <div className="pay-invoice-head">
        <div>
          <p className="eyebrow">Ubuzima Bwiza</p>
          <h3>{t('ui.consultationInvoice')}</h3>
        </div>
        <strong>{invoiceRef(apt.id)}</strong>
      </div>
      <dl className="pay-lines">
        <div>
          <dt>{t('ui.patient')}</dt>
          <dd>{apt.patientName}</dd>
        </div>
        <div>
          <dt>{t('ui.clinician')}</dt>
          <dd>
            {apt.doctorName}
            <span>
              {t(`specialties.${apt.specialty}`, { defaultValue: apt.specialty })} · {apt.type === 'video' ? t('ui.videoShort') : t('ui.inPersonShort')}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t('ui.schedule')}</dt>
          <dd>
            {apt.date} {t('ui.at')} {apt.time}
          </dd>
        </div>
        <div>
          <dt>{t('ui.consultation')}</dt>
          <dd>{formatRwf(apt.amount)}</dd>
        </div>
        <div>
          <dt>{t('ui.serviceFee')}</dt>
          <dd>0 RWF</dd>
        </div>
        <div className="total">
          <dt>{t('ui.amountDue')}</dt>
          <dd>{formatRwf(apt.amount)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function PaymentsPage() {
  const { t } = useAppText()
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
          <h2>{t('payments.title')}</h2>
          <p className="lead" style={{ marginBottom: 0 }}>
            {t('ui.paymentsLead')}
          </p>
        </div>
      </div>

      <div className="pay-summary">
        <article>
          <span>{t('ui.amountDue')}</span>
          <strong>{formatRwf(dueTotal)}</strong>
        </article>
        <article>
          <span>{t('ui.paid')}</span>
          <strong>{formatRwf(paidTotal)}</strong>
        </article>
        <article>
          <span>{t('ui.receipts')}</span>
          <strong>{paid.length}</strong>
        </article>
      </div>

      <h3>{t('ui.invoicesDue')}</h3>
      <div className="table">
        {unpaid.length === 0 ? (
          <EmptyState text={t('ui.noUnpaid')} />
        ) : (
          unpaid.map((apt) => (
            <div className={`table-row${focusId === apt.id ? ' highlight-row' : ''}`} key={apt.id}>
              <div>
                <strong>
                  {invoiceRef(apt.id)} · {formatRwf(apt.amount)}
                </strong>
                <p>
                  {apt.doctorName} · {apt.date} {t('ui.at')} {apt.time} · {t(`specialties.${apt.specialty}`, { defaultValue: apt.specialty })}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.paymentStatus} />
                <Link to={`/pay/${apt.id}`} className="btn btn-primary">
                  {t('ui.payInvoice')}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <h3>{t('ui.paid')}</h3>
      <div className="table">
        {paid.length === 0 ? (
          <EmptyState text={t('ui.noReceipts')} />
        ) : (
          paid.map((apt) => (
            <div className="table-row" key={apt.id}>
              <div>
                <strong>
                  {apt.receiptId} · {formatRwf(apt.amount)}
                </strong>
                <p>
                  {apt.doctorName} · {payMethodName(apt.paymentMethod, t)}
                  {apt.paidAt ? ` · ${new Date(apt.paidAt).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status="paid" />
                <Link to={`/pay/${apt.id}`} className="btn btn-outline">
                  {t('ui.viewReceipt')}
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    downloadPrintableReport({
                      title: t('ui.receiptTitle'),
                      subtitle: t('ui.receiptSubtitle'),
                      htmlBody: appointmentReceiptHtml(apt),
                    })
                  }
                >
                  {t('ui.download')}
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
  const { t } = useAppText()
  const { id } = useParams()
  const { appointments, payAppointment, user } = useAuth()
  const apt = appointments.find((a) => a.id === id)
  const [step, setStep] = useState<Step>(apt?.paymentStatus === 'paid' ? 'done' : 'review')
  const [method, setMethod] = useState<PaymentMethod>('momo')
  const [phone, setPhone] = useState(user?.phone ?? '0781 011 343')
  const [showUssd, setShowUssd] = useState(false)
  const [payChannel, setPayChannel] = useState<'prompt' | 'ussd' | null>(null)
  const [cardName, setCardName] = useState(user?.name ?? '')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(apt?.receiptId ?? '')

  if (!apt) return <EmptyState text={t('ui.invoiceNotFound')} />

  const latest = appointments.find((a) => a.id === apt.id) ?? apt
  const paid = latest.paymentStatus === 'paid'

  const validateDetails = () => {
    if (method === 'momo' || method === 'airtel') {
      if (!isValidRwandanPhone(phone)) {
        setError(t('ui.phoneInvalid'))
        return false
      }
    }
    if (method === 'card') {
      if (cardNumber.replace(/\D/g, '').length !== 16) {
        setError(t('ui.cardInvalid'))
        return false
      }
      if (cardName.trim().length < 3) {
        setError(t('ui.cardNameInvalid'))
        return false
      }
      if (!isValidExpiry(expiry)) {
        setError(t('ui.expiryInvalid'))
        return false
      }
      if (!isValidCvc(cvc)) {
        setError(t('ui.cvcInvalid'))
        return false
      }
    }
    setError('')
    return true
  }

  const processPayment = (channel?: 'prompt' | 'ussd') => {
    if (paid) {
      setStep('done')
      return
    }
    if (channel) setPayChannel(channel)
    setLoading(true)
    setError('')
    const delay = method === 'cash' ? 600 : channel === 'ussd' ? 800 : 1400
    window.setTimeout(() => {
      void payAppointment(latest.id, method).then((result) => {
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        setStep('details')
        return
      }
      setReceipt(result.receiptId ?? '')
      setStep('done')
      })
    }, delay)
  }

  const onDetailsNext = (event: FormEvent) => {
    event.preventDefault()
    if (!validateDetails()) return
    setShowUssd(false)
    setStep('confirm')
  }

  const walletNetwork = method === 'airtel' ? 'airtel' : 'mtn'
  const formattedPhone = formatRwandanPhone(phone)
  const walletName = method === 'airtel' ? t('payments.airtel') : t('payments.momo')
  const prefixWarning =
    (method === 'momo' || method === 'airtel') && phonePrefixMismatch(walletNetwork, phone)
      ? t(walletNetwork === 'mtn' ? 'ui.prefixMtn' : 'ui.prefixAirtel')
      : ''
  const methodHint =
    method === 'momo' || method === 'airtel'
      ? showUssd
        ? t('ui.atDial', { code: AT_SERVICE_CODE, merchant: USSD_MERCHANT_CODE })
        : t('ui.momoPrompt', { phone: formattedPhone })
      : method === 'card'
        ? t('ui.cardCharge', { card: maskCard(cardNumber), amount: formatRwf(latest.amount) })
        : t('ui.cashHintLong')

  return (
    <div className="stack pay-checkout">
      <div>
        <p className="pill">{t('ui.secureCheckout')}</p>
        <h2>{paid ? t('ui.paymentReceipt') : t('ui.payConsultation')}</h2>
      </div>
      <CheckoutSteps current={paid ? 'done' : step} />

      {step === 'review' && !paid ? (
        <>
          <InvoiceSummary apt={latest} />
          <div className="row-actions">
            <Link to="/my-appointments" className="btn btn-outline">
              {t('ui.back')}
            </Link>
            <button className="btn btn-primary" type="button" onClick={() => setStep('method')}>
              {t('ui.continuePayment')}
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
                <strong>{t(item.labelKey)}</strong>
                <span>{t(item.hintKey)}</span>
              </button>
            ))}
          </div>
          <div className="row-actions">
            <button className="btn btn-outline" type="button" onClick={() => setStep('review')}>
              {t('ui.back')}
            </button>
            <button className="btn btn-primary" type="button" onClick={() => setStep('details')}>
              {t('ui.continue')}
            </button>
          </div>
        </>
      ) : null}

      {step === 'details' && !paid ? (
        <form className="search-card auth-form" onSubmit={onDetailsNext}>
          {method === 'momo' || method === 'airtel' ? (
            <div className="field">
              <label htmlFor="phone">{t('ui.mmNumber')}</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatRwandanPhone(e.target.value))}
                placeholder="0781 011 343"
                inputMode="tel"
                required
              />
              <p className="field-hint">{t('ui.numberFor', { method: walletName })}</p>
              {prefixWarning ? <p className="pay-warn">{prefixWarning}</p> : null}
            </div>
          ) : null}

          {method === 'card' ? (
            <>
              <div className="field">
                <label htmlFor="cardName">{t('ui.nameOnCard')}</label>
                <input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  autoComplete="cc-name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="card">{t('ui.cardNumber')}</label>
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
                  <label htmlFor="exp">{t('ui.expiry')}</label>
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
                  <label htmlFor="cvc">{t('ui.cvc')}</label>
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
              {t('ui.cashVoucher', { invoice: invoiceRef(latest.id), amount: formatRwf(latest.amount) })}
            </p>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
          <div className="row-actions">
            <button className="btn btn-outline" type="button" onClick={() => setStep('method')}>
              {t('ui.back')}
            </button>
            <button className="btn btn-primary" type="submit">
              {t('ui.reviewPay')}
            </button>
          </div>
        </form>
      ) : null}

      {step === 'confirm' && !paid ? (
        <div className="search-card auth-form">
          <InvoiceSummary apt={latest} />
          <p className="lead">{methodHint}</p>
          {method === 'momo' || method === 'airtel' ? (
            showUssd ? (
              <UssdSession
                network={walletNetwork}
                phone={formattedPhone}
                invoice={invoiceRef(latest.id)}
                amountLabel={formatRwf(latest.amount)}
                appointmentId={latest.id}
                busy={loading}
                onExit={() => setShowUssd(false)}
                onComplete={() => processPayment('ussd')}
              />
            ) : (
              <WalletPrompt
                network={walletNetwork}
                phone={formattedPhone}
                invoice={invoiceRef(latest.id)}
                amountLabel={formatRwf(latest.amount)}
                busy={loading}
                onApproved={() => processPayment('prompt')}
                onUseUssd={() => setShowUssd(true)}
              />
            )
          ) : null}
          {error ? <p className="error">{error}</p> : null}
          {loading ? (
            <p className="success">
              {method === 'card'
                ? t('ui.authorising')
                : method === 'cash'
                  ? t('ui.recordingCash')
                  : payChannel === 'ussd'
                    ? t('ui.confirmingUssd')
                    : t('ui.waitingPhone')}
            </p>
          ) : null}
          <div className="row-actions">
            <button
              className="btn btn-outline"
              type="button"
              disabled={loading}
              onClick={() => {
                setShowUssd(false)
                setStep('details')
              }}
            >
              {t('ui.back')}
            </button>
            {method === 'momo' || method === 'airtel' ? null : (
              <button className="btn btn-primary" type="button" disabled={loading} onClick={() => processPayment()}>
                {loading ? t('ui.processing') : t('ui.payAmount', { amount: formatRwf(latest.amount) })}
              </button>
            )}
          </div>
          <p className="field-hint">{t('ui.encrypted')}</p>
        </div>
      ) : null}

      {step === 'done' || paid ? (
        <div className="search-card auth-form">
          <p className="success">{t('ui.paymentComplete')}</p>
          <InvoiceSummary apt={appointments.find((a) => a.id === latest.id) ?? latest} />
          <p className="lead">
            {t('ui.receipt')} {receipt || latest.receiptId || invoiceRef(latest.id)} · {payMethodName(latest.paymentMethod ?? method, t)}
            {payChannel === 'ussd' ? ` · ${t('ui.viaUssd')}` : payChannel === 'prompt' ? ` · ${t('ui.viaPrompt')}` : ''}
          </p>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                downloadPrintableReport({
                  title: t('ui.receiptTitle'),
                  subtitle: t('ui.receiptSubtitle'),
                  htmlBody: appointmentReceiptHtml(appointments.find((a) => a.id === latest.id) ?? latest),
                })
              }
            >
              {t('ui.downloadReceipt')}
            </button>
            {latest.type === 'video' && latest.status === 'approved' ? (
              <Link to={`/visit/${latest.id}`} className="btn btn-outline">
                {t('ui.openConsult')}
              </Link>
            ) : (
              <Link to="/my-appointments" className="btn btn-outline">
                {t('patient.appointments')}
              </Link>
            )}
            <Link to="/payments" className="btn btn-outline">
              {t('ui.allPayments')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
