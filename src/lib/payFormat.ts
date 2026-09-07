export function formatRwandanPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  if (digits.startsWith('250')) {
    const rest = digits.slice(3)
    return `+250 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`.trim()
  }
  if (digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`.trim()
  }
  return digits
}

export function isValidRwandanPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return /^(2507\d{8}|07\d{8})$/.test(digits)
}

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function isValidExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  const exp = new Date(year, month, 0)
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1)
}

export function isValidCvc(value: string) {
  return /^\d{3,4}$/.test(value)
}

export function maskCard(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 4) return 'Card'
  return `•••• ${digits.slice(-4)}`
}

export function invoiceRef(appointmentId: string) {
  return `INV-${appointmentId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8)}`
}
