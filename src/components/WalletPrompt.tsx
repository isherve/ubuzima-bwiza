import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { UssdNetwork } from '../lib/ussd'

export function WalletPrompt({
  network,
  phone,
  invoice,
  amountLabel,
  busy,
  onApproved,
  onUseUssd,
}: {
  network: UssdNetwork
  phone: string
  invoice: string
  amountLabel: string
  busy: boolean
  onApproved: () => void
  onUseUssd: () => void
}) {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [pin, setPin] = useState('')
  const [notice, setNotice] = useState('')
  const wallet = network === 'mtn' ? 'MTN MoMo' : 'Airtel Money'
  const locked = busy

  const approve = (event: FormEvent) => {
    event.preventDefault()
    if (locked) return
    if (!/^\d{4}$/.test(pin)) {
      setNotice(t('ui.pinPhone'))
      return
    }
    setNotice('')
    onApproved()
  }

  return (
    <div className="ussd-wrap">
      <div className="ussd-phone" aria-label={`${wallet} payment prompt`}>
        <p className="ussd-carrier">{network === 'mtn' ? 'MTN Rwanda' : 'Airtel Rwanda'}</p>
        <div className="wallet-screen">
          {sent ? (
            <form className="wallet-popup" onSubmit={approve}>
              <p className="wallet-popup-kicker">{wallet}</p>
              <strong>{t('ui.approvePayment')}</strong>
              <p>
                {invoice}
                <br />
                Ubuzima Bwiza
              </p>
              <p className="wallet-amount">{amountLabel}</p>
              <p>{t('ui.to')} {phone}</p>
              <label htmlFor="wallet-pin">{t('ui.walletPin')}</label>
              <input
                id="wallet-pin"
                value={locked ? '••••' : pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="PIN"
                disabled={locked}
              />
              {notice ? <p className="ussd-notice">{notice}</p> : null}
              <button className="btn btn-primary" type="submit" disabled={locked}>
                {locked ? t('ui.waiting') : t('ui.approve')}
              </button>
            </form>
          ) : (
            <div className="wallet-idle">
              <strong>{wallet}</strong>
              <p>{t('ui.promptIdle', { phone })}</p>
            </div>
          )}
        </div>
      </div>
      {sent ? null : (
        <button className="btn btn-primary" type="button" disabled={locked} onClick={() => setSent(true)}>
          {t('ui.sendPrompt', { phone })}
        </button>
      )}
      <button className="btn btn-outline" type="button" disabled={locked} onClick={onUseUssd}>
        {t('ui.useUssd')}
      </button>
      <p className="field-hint">{t('ui.promptHint', { wallet })}</p>
    </div>
  )
}
