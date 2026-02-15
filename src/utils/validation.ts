/**
 * 폼 검증 유틸리티
 * 중복된 검증 로직을 통합하여 재사용
 */

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * 이메일 검증
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: '이메일을 입력해주세요',
    }
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: '올바른 이메일 형식이 아닙니다',
    }
  }

  return { isValid: true }
}

/**
 * 전화번호 검증
 * 형식: 010-1234-5678, 01012345678, 02-1234-5678 등
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      message: '전화번호를 입력해주세요',
    }
  }

  // 숫자만 추출
  const numbersOnly = phone.replace(/[^0-9]/g, '')

  // 길이 검증 (최소 9자리, 최대 11자리)
  if (numbersOnly.length < 9 || numbersOnly.length > 11) {
    return {
      isValid: false,
      message: '올바른 전화번호 형식이 아닙니다',
    }
  }

  // 휴대폰 번호 (010, 011 등)
  if (numbersOnly.startsWith('01')) {
    if (numbersOnly.length !== 10 && numbersOnly.length !== 11) {
      return {
        isValid: false,
        message: '올바른 휴대폰 번호가 아닙니다',
      }
    }
  }

  return { isValid: true }
}

/**
 * 전화번호 포맷팅
 * 숫자만 입력된 전화번호를 하이픈 포함 형식으로 변환
 */
export const formatPhone = (phone: string): string => {
  const numbersOnly = phone.replace(/[^0-9]/g, '')

  // 휴대폰 (010-1234-5678)
  if (numbersOnly.length === 11 && numbersOnly.startsWith('01')) {
    return numbersOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  // 휴대폰 (010-123-4567)
  if (numbersOnly.length === 10 && numbersOnly.startsWith('01')) {
    return numbersOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  // 지역번호 (02-1234-5678)
  if (numbersOnly.length === 10 && numbersOnly.startsWith('02')) {
    return numbersOnly.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  // 지역번호 (031-123-4567)
  if (numbersOnly.length === 10) {
    return numbersOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  // 기타
  return phone
}

/**
 * 필수 필드 검증
 */
export const validateRequired = (value: any, fieldName: string = '필드'): ValidationResult => {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      message: `${fieldName}은(는) 필수 입력 항목입니다`,
    }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName}을(를) 입력해주세요`,
    }
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName}을(를) 선택해주세요`,
    }
  }

  return { isValid: true }
}

/**
 * 최소 길이 검증
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = '입력값'
): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다`,
    }
  }

  return { isValid: true }
}

/**
 * 최대 길이 검증
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = '입력값'
): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다`,
    }
  }

  return { isValid: true }
}

/**
 * 비밀번호 검증
 * 규칙: 최소 8자, 영문/숫자 포함
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: '비밀번호를 입력해주세요',
    }
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: '비밀번호는 최소 8자 이상이어야 합니다',
    }
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: '비밀번호는 영문과 숫자를 포함해야 합니다',
    }
  }

  return { isValid: true }
}

/**
 * 비밀번호 확인 검증
 */
export const validatePasswordConfirm = (
  password: string,
  passwordConfirm: string
): ValidationResult => {
  if (password !== passwordConfirm) {
    return {
      isValid: false,
      message: '비밀번호가 일치하지 않습니다',
    }
  }

  return { isValid: true }
}

/**
 * 숫자 검증
 */
export const validateNumber = (
  value: string | number,
  fieldName: string = '숫자'
): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldName}은(는) 숫자여야 합니다`,
    }
  }

  return { isValid: true }
}

/**
 * 숫자 범위 검증
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = '값'
): ValidationResult => {
  if (value < min || value > max) {
    return {
      isValid: false,
      message: `${fieldName}은(는) ${min}에서 ${max} 사이여야 합니다`,
    }
  }

  return { isValid: true }
}

/**
 * URL 검증
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      message: 'URL을 입력해주세요',
    }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      message: '올바른 URL 형식이 아닙니다',
    }
  }
}

/**
 * 날짜 검증
 */
export const validateDate = (date: string): ValidationResult => {
  if (!date || date.trim() === '') {
    return {
      isValid: false,
      message: '날짜를 입력해주세요',
    }
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      message: '올바른 날짜 형식이 아닙니다',
    }
  }

  return { isValid: true }
}

/**
 * 날짜 범위 검증
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): ValidationResult => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      message: '올바른 날짜 형식이 아닙니다',
    }
  }

  if (start > end) {
    return {
      isValid: false,
      message: '시작일은 종료일보다 이전이어야 합니다',
    }
  }

  return { isValid: true }
}

/**
 * 파일 확장자 검증
 */
export const validateFileExtension = (
  filename: string,
  allowedExtensions: string[]
): ValidationResult => {
  const extension = filename.split('.').pop()?.toLowerCase()

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      message: `허용된 파일 형식: ${allowedExtensions.join(', ')}`,
    }
  }

  return { isValid: true }
}

/**
 * 파일 크기 검증
 */
export const validateFileSize = (
  fileSize: number,
  maxSizeMB: number
): ValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      message: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`,
    }
  }

  return { isValid: true }
}

/**
 * 여러 검증 규칙을 순차적으로 실행
 */
export const validateAll = (
  ...validations: ValidationResult[]
): ValidationResult => {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation
    }
  }

  return { isValid: true }
}

/**
 * 폼 필드 검증 헬퍼
 */
export const createValidator = <T extends Record<string, any>>(
  rules: {
    [K in keyof T]?: (value: T[K]) => ValidationResult
  }
) => {
  return (data: T): Record<keyof T, string | null> => {
    const errors = {} as Record<keyof T, string | null>

    for (const key in rules) {
      const rule = rules[key]
      if (rule) {
        const result = rule(data[key])
        errors[key] = result.isValid ? null : (result.message || '유효하지 않습니다')
      }
    }

    return errors
  }
}
