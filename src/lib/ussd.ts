export const USSD_MERCHANT_CODE = '550120'
export const AT_SERVICE_CODE = '*384*550120#'

export type UssdNetwork = 'mtn' | 'airtel'

export function ussdDialCode(network: UssdNetwork) {
  return network === 'mtn' ? '*182#' : '*185#'
}

export function networkFromPhone(phone: string): UssdNetwork {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('250') ? `0${digits.slice(3)}` : digits
  if (local.startsWith('072') || local.startsWith('073')) return 'airtel'
  return 'mtn'
}

export function ussdPhoneKey(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `250${digits.slice(1)}`
  return digits
}

export function phonePrefixMismatch(network: UssdNetwork, phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return false
  return networkFromPhone(phone) !== network
}
