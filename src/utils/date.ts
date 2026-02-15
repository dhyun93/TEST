const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"]

const DATE_WITH_DAY_REGEX = /^(\d{4})-(\d{2})-(\d{2})\(([일월화수목금토])\)$/
const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

// YYYY-MM-DD(요일명)
export const formatDateWithDay = (dateStr: string): string => {
  if (!dateStr) return ""
  if (DATE_WITH_DAY_REGEX.test(dateStr)) return dateStr

  const match = dateStr.match(DATE_ONLY_REGEX)
  if (!match) return dateStr

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) return dateStr

  const dayLabel = KOREAN_DAYS[date.getDay()]
  return `${match[1]}-${match[2]}-${match[3]}(${dayLabel})`
}

export const formatDateYMD = (dateStr: string): string => {
  if (!dateStr) return ""
  const match = dateStr.match(DATE_ONLY_REGEX)
  if (!match) return dateStr
  return `${match[1]}-${match[2]}-${match[3]}`
}

/**
 * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 포맷
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 날짜를 YYYY-MM-DD HH:mm 형식으로 포맷
 */
export const formatDateTimeShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getToday = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 현재 시간을 HH:mm 형식으로 반환
 */
export const getCurrentTime = (): string => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

/**
 * 날짜에 일수를 더함
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * 날짜에 개월수를 더함
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * 날짜에 년수를 더함
 */
export const addYears = (date: Date | string, years: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()

  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

/**
 * 날짜가 과거인지 확인
 */
export const isPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * 날짜가 미래인지 확인
 */
export const isFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}

/**
 * 상대적 시간 표시 (방금 전, 3분 전, 2시간 전 등)
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}주 전`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}개월 전`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}년 전`
  }
}

/**
 * 월의 첫 날짜 가져오기
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month - 1, 1)
}

/**
 * 월의 마지막 날짜 가져오기
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 0)
}

/**
 * 해당 날짜가 포함된 주의 시작일(월요일) 가져오기
 */
export const getStartOfWeek = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 일요일이면 -6, 아니면 1
  return new Date(d.setDate(diff))
}

/**
 * 해당 날짜가 포함된 주의 마지막일(일요일) 가져오기
 */
export const getEndOfWeek = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  const startOfWeek = getStartOfWeek(d)
  return addDays(startOfWeek, 6)
}
