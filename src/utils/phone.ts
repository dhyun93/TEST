export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, "")
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

export const formatPhoneNumberFlexible = (value: string): string => {
  let digits = value.replace(/[^0-9]/g, "")
  if (!digits) return ""

  if (digits.startsWith("02")) {
    digits = digits.slice(0, 10)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`
  }

  if (/^01[16789]/.test(digits)) {
    digits = digits.slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  digits = digits.slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

export const isValidPhoneNumber = (value: string): boolean => {
  const digits = value.replace(/[^0-9]/g, "")
  if (!digits.startsWith("0")) return false
  if (digits.startsWith("02")) return digits.length === 9 || digits.length === 10
  if (/^01[16789]/.test(digits)) return digits.length === 10
  return digits.length === 10 || digits.length === 11
}
