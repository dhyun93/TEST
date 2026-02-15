export const formatBusinessNumber = (value: string): string => {
  let digits = value.replace(/[^0-9]/g, "")
  if (!digits) return ""
  digits = digits.slice(0, 10)

  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}
