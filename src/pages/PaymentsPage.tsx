import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, StatusBadge } from '../components/dashboard/Shell'
import { useAuth } from '../context/AuthContext'
import type { PaymentMethod } from '../data'
import {
  appointmentReceiptHtml,
  downloadPrintableReport,
  formatRwf,
  methodLabel,
} from '../lib/reports'

const methods: Array<{ id: PaymentMethod; label: string; hint: string }> = [
  { id: 'momo', label: 'MTN MoMo', hint: 'Pay with MTN Mobile Money' },
  { id: 'airtel', label: 'Airtel Money', hint: 'Pay with Airtel Money' },
  { id: 'card', label: 'Card', hint: 'Visa / Mastercard' },
  { id: 'cash', label: 'Cash', hint: 'Pay at the facility desk' },
]

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

  return (
    <div className="stack">
      <div className="toolbar">
        <div>
          <h2>Payments</h2>
          <p className="lead" style={{ marginBottom: 0 }}>
            Pay consultation fees and download receipts anytime.
          </p>
        </div>
      </div>

      <h3>Due now</h3>
      <div className="table">
        {unpaid.length === 0 ? (
          <EmptyState text="No unpaid appointments." />
        ) : (
          unpaid.map((apt) => (
            <div className={`table-row${focusId === apt.id ? ' highlight-row' : ''}`} key={apt.id}>
              <div>
                <strong>
                  {apt.doctorName} · {formatRwf(apt.amount)}
                </strong>
                <p>
                  {apt.date} at {apt.time} · {apt.specialty}
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status={apt.paymentStatus} />
                <Link to={`/pay/${apt.id}`} className="btn btn-primary">
                  Pay now
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
                </p>
              </div>
              <div className="row-actions">
                <StatusBadge status="paid" />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    downloadPrintableReport({
                      title: 'Payment receipt',
                      subtitle: 'Ubuzima Bwiza consultation payment',
                      htmlBody: appointmentReceiptHtml(apt),
                    })
                  }
                >
                  Download receipt
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
  const navigate = useNavigate()
  const { appointments, payAppointment, user } = useAuth()
  const apt = appointments.find((a) => a.id === id)
  const [method, setMethod] = useState<PaymentMethod>('momo')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!apt) return <EmptyState text="Appointment not found." />
  if (apt.paymentStatus === 'paid') {
    return (
      <div className="stack">
        <h2>Already paid</h2>
        <p className="lead">
          Receipt {apt.receiptId} · {formatRwf(apt.amount)}
        </p>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              downloadPrintableReport({
                title: 'Payment receipt',
                subtitle: 'Ubuzima Bwiza consultation payment',
                htmlBody: appointmentReceiptHtml(apt),
              })
            }
          >
            Download receipt
          </button>
          <Link to="/payments" className="btn btn-outline">
            Back to payments
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if ((method === 'momo' || method === 'airtel') && phone.trim().length < 9) {
      setError('Enter a valid mobile money number.')
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      const result = payAppointment(apt.id, method)
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setSuccess(`Payment successful. Receipt ${result.receiptId}`)
      window.setTimeout(() => navigate(`/payments?apt=${apt.id}`), 800)
    }, 700)
  }

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h2>Pay consultation</h2>
      <p className="lead">
        {apt.doctorName} · {apt.date} {apt.time} · <strong>{formatRwf(apt.amount)}</strong>
      </p>

      <form className="search-card auth-form" onSubmit={onSubmit}>
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

        {method === 'momo' || method === 'airtel' ? (
          <div className="field">
            <label htmlFor="phone">Mobile money number</label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 7XX XXX XXX"
              required
            />
          </div>
        ) : null}

        {method === 'card' ? (
          <>
            <div className="field">
              <label htmlFor="card">Card number</label>
              <input id="card" placeholder="4111 1111 1111 1111" required />
            </div>
            <div className="field">
              <label htmlFor="exp">Expiry / CVC</label>
              <input id="exp" placeholder="12/28 · 123" required />
            </div>
          </>
        ) : null}

        {method === 'cash' ? (
          <p className="lead">
            Choose cash if you will pay at the hospital desk. Your appointment stays marked unpaid
            until reception confirms — for this demo, confirming marks it paid.
          </p>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? 'Processing…' : `Pay ${formatRwf(apt.amount)}`}
        </button>
      </form>
    </div>
  )
}
