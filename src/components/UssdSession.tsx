import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AT_SERVICE_CODE, USSD_MERCHANT_CODE, ussdPhoneKey, type UssdNetwork } from '../lib/ussd'

function gatewayScreen(raw: string) {
  if (raw.startsWith('CON ')) return { ended: false, paid: false, text: raw.slice(4) }
  if (raw.startsWith('END ')) return { ended: true, paid: raw.includes('Payment received'), text: raw.slice(4) }
  return { ended: true, paid: false, text: raw || 'USSD session failed' }
}

export function UssdSession({
  network,
  phone,
  invoice,
  amountLabel,
  appointmentId,
  busy,
  onComplete,
  onExit,
}: {
  network: UssdNetwork
  phone: string
  invoice: string
  amountLabel: string
  appointmentId: string
  busy: boolean
  onComplete: () => void
  onExit: () => void
}) {
  const { t } = useTranslation()
  const sessionId = useRef(`ATUid_${crypto.randomUUID()}`)
  const chain = useRef('')
  const [screen, setScreen] = useState(t('ui.pleaseWait'))
  const [input, setInput] = useState('')
  const [ended, setEnded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [askingPin, setAskingPin] = useState(false)
  const paid = useRef(false)

  const postSession = async (text: string) => {
    const body = new URLSearchParams({
      sessionId: sessionId.current,
      serviceCode: AT_SERVICE_CODE,
      phoneNumber: `+${ussdPhoneKey(phone)}`,
      text,
    })
    const response = await fetch('/api/ussd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const next = gatewayScreen(await response.text())
    setScreen(next.text)
    setEnded(next.ended)
    setAskingPin(!next.ended && next.text.startsWith('Enter PIN'))
    if (next.paid && !paid.current) {
      paid.current = true
      onComplete()
    }
  }

  useEffect(() => {
    let cancel = false
    void (async () => {
      const opened = await fetch('/api/ussd-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, invoice, amountLabel, appointmentId }),
      })
      if (!opened.ok) {
        if (!cancel) setScreen('No invoice is open for this number.')
        return
      }
      if (!cancel) await postSession('')
    })()
    return () => {
      cancel = true
    }
    // The session starts once for this invoice and number.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, phone, invoice, amountLabel])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = input.trim()
    if (!value || ended || busy) return
    setInput('')
    chain.current = chain.current ? `${chain.current}*${value}` : value
    void postSession(chain.current)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(AT_SERVICE_CODE)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ussd-wrap">
      <div className="ussd-dial">
        <div>
          <p className="eyebrow">{t('ui.dialOn', { phone })}</p>
          <strong>{AT_SERVICE_CODE}</strong>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => void copyCode()}>
          {copied ? t('ui.copied') : t('ui.copyCode')}
        </button>
      </div>
      <div className="ussd-phone" aria-label="Africa's Talking USSD session">
        <p className="ussd-carrier">{network === 'mtn' ? 'MTN Rwanda' : 'Airtel Rwanda'} · Africa's Talking</p>
        <div className="ussd-screen">
          <p>{screen}</p>
        </div>
        {ended ? (
          <button className="btn btn-outline ussd-back" type="button" onClick={onExit} disabled={busy}>
            {t('ui.back')}
          </button>
        ) : (
          <form className="ussd-reply" onSubmit={onSubmit}>
            <input
              aria-label="USSD reply"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, '').slice(0, askingPin ? 4 : 8))}
              inputMode="numeric"
              placeholder={askingPin ? t('ui.walletPin') : t('ui.ussdReply')}
              disabled={busy}
              autoComplete="off"
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>
              {t('ui.send')}
            </button>
          </form>
        )}
      </div>
      <p className="field-hint">{t('ui.atDial', { code: AT_SERVICE_CODE, merchant: USSD_MERCHANT_CODE })}</p>
    </div>
  )
}
