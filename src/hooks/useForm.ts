import { useState, useCallback, useMemo } from "react"

export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  message?: string
  noSpaces?: boolean
  matchField?: string
  matchFieldMessage?: string
  notMatchField?: string
  notMatchFieldMessage?: string
  phoneMinDigits?: number
  phoneMessage?: string
}

export type ValidationRules = {
  [fieldName: string]: ValidationRule
}

export type ValidationErrors = {
  [fieldName: string]: string
}

export type SuccessFields = {
  [fieldName: string]: string
}

export type UseFormValidationReturn = {
  errors: ValidationErrors
  touched: { [fieldName: string]: boolean }
  validateField: (name: string, value: string) => string
  validateForm: (values: { [key: string]: string }) => boolean
  setFieldTouched: (name: string) => void
  setFieldError: (name: string, message: string) => void
  clearErrors: () => void
  clearFieldError: (name: string) => void
  isFieldInvalid: (name: string) => boolean
  getFieldError: (name: string) => string
  removeSpaces: (value: string) => string
  realtimeErrors: ValidationErrors
  isValid: boolean
  successFields: SuccessFields
  setFieldSuccess: (name: string, message: string) => void
  clearFieldSuccess: (name: string) => void
  getFieldSuccess: (name: string) => string
  validatePhone: (value: string, fieldName?: string) => boolean
  validateVerificationCode: (value: string, expectedCode: string, fieldName?: string) => boolean
}

const defaultMessages = {
  required: "필수입력 항목입니다.",
  minLength: (min: number) => `${min}자 이상 입력해주세요.`,
  maxLength: (max: number) => `최대 ${max}자까지 입력 가능합니다.`,
  pattern: "올바른 형식으로 입력해주세요.",
  custom: "입력값이 올바르지 않습니다.",
  matchField: "입력값이 일치하지 않습니다.",
  notMatchField: "이전 값과 다른 값을 입력해주세요.",
  phone: "휴대전화번호를 입력해주세요.",
  verificationCodeEmpty: "인증번호를 입력해주세요.",
  verificationCodeMismatch: "인증번호가 일치하지 않습니다.",
  verificationCodeSuccess: "인증이 완료되었습니다",
}

export default function useForm(rules: ValidationRules, values?: { [key: string]: string }): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{ [fieldName: string]: boolean }>({})
  const [successFields, setSuccessFields] = useState<SuccessFields>({})

  const removeSpaces = useCallback((value: string): string => {
    return value.replace(/\s/g, "")
  }, [])

  const validateField = useCallback(
    (name: string, value: string, allValues?: { [key: string]: string }): string => {
      const rule = rules[name]
      if (!rule) return ""

      const trimmedValue = value?.trim() || ""

      if (rule.required && !trimmedValue) {
        return rule.message || defaultMessages.required
      }

      if (rule.minLength && trimmedValue.length > 0 && trimmedValue.length < rule.minLength) {
        return rule.message || defaultMessages.minLength(rule.minLength)
      }

      if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        return rule.message || defaultMessages.maxLength(rule.maxLength)
      }

      if (rule.pattern && !rule.pattern.test(trimmedValue)) {
        return rule.message || defaultMessages.pattern
      }

      if (rule.custom && !rule.custom(trimmedValue)) {
        return rule.message || defaultMessages.custom
      }

      if (rule.matchField && allValues && trimmedValue) {
        const matchValue = allValues[rule.matchField] || ""
        if (trimmedValue !== matchValue) {
          return rule.matchFieldMessage || defaultMessages.matchField
        }
      }

      if (rule.notMatchField && allValues && trimmedValue) {
        const notMatchValue = allValues[rule.notMatchField] || ""
        if (notMatchValue && trimmedValue === notMatchValue) {
          return rule.notMatchFieldMessage || defaultMessages.notMatchField
        }
      }

      if (rule.phoneMinDigits && trimmedValue) {
        const digitsOnly = trimmedValue.replace(/[^\d]/g, "")
        if (digitsOnly.length < rule.phoneMinDigits) {
          return rule.phoneMessage || defaultMessages.phone
        }
      }

      return ""
    },
    [rules]
  )

  const realtimeErrors = useMemo(() => {
    if (!values) return {}

    const result: ValidationErrors = {}
    Object.keys(rules).forEach(fieldName => {
      const value = values[fieldName] || ""
      if (value) {
        const error = validateField(fieldName, value, values)
        if (error) {
          result[fieldName] = error
        }
      }
    })
    return result
  }, [rules, values, validateField])

  const isValid = useMemo(() => {
    return Object.keys(realtimeErrors).length === 0
  }, [realtimeErrors])

  const validateForm = useCallback(
    (formValues: { [key: string]: string }): boolean => {
      const newErrors: ValidationErrors = {}
      const newTouched: { [fieldName: string]: boolean } = {}
      let valid = true

      Object.keys(rules).forEach(fieldName => {
        const error = validateField(fieldName, formValues[fieldName] || "", formValues)
        newTouched[fieldName] = true
        if (error) {
          newErrors[fieldName] = error
          valid = false
        }
      })

      setErrors(newErrors)
      setTouched(newTouched)
      return valid
    },
    [rules, validateField]
  )

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const setFieldError = useCallback((name: string, message: string) => {
    setErrors(prev => ({ ...prev, [name]: message }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])

  const setFieldSuccess = useCallback(
    (name: string, message: string) => {
      setSuccessFields(prev => ({ ...prev, [name]: message }))
      clearFieldError(name)
    },
    [clearFieldError]
  )

  const clearFieldSuccess = useCallback((name: string) => {
    setSuccessFields(prev => {
      const newSuccess = { ...prev }
      delete newSuccess[name]
      return newSuccess
    })
  }, [])

  const getFieldSuccess = useCallback(
    (name: string): string => {
      return successFields[name] || ""
    },
    [successFields]
  )

  const validatePhone = useCallback(
    (value: string, fieldName: string = "phone"): boolean => {
      const digitsOnly = value?.replace(/[^\d]/g, "") || ""
      if (!value || digitsOnly.length < 10) {
        setFieldError(fieldName, defaultMessages.phone)
        clearFieldSuccess(fieldName)
        return false
      }
      clearFieldError(fieldName)
      return true
    },
    [setFieldError, clearFieldError, clearFieldSuccess]
  )

  const validateVerificationCode = useCallback(
    (value: string, expectedCode: string, fieldName: string = "verificationCode"): boolean => {
      if (!value || value.trim() === "") {
        setFieldError(fieldName, defaultMessages.verificationCodeEmpty)
        clearFieldSuccess(fieldName)
        return false
      }
      if (value !== expectedCode) {
        setFieldError(fieldName, defaultMessages.verificationCodeMismatch)
        clearFieldSuccess(fieldName)
        return false
      }
      clearFieldError(fieldName)
      setFieldSuccess(fieldName, defaultMessages.verificationCodeSuccess)
      return true
    },
    [setFieldError, clearFieldError, setFieldSuccess, clearFieldSuccess]
  )

  const isFieldInvalid = (name: string): boolean => {
    return touched[name] && !!errors[name]
  }

  const getFieldError = (name: string): string => {
    return touched[name] ? errors[name] || "" : ""
  }

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    setFieldError,
    clearErrors,
    clearFieldError,
    isFieldInvalid,
    getFieldError,
    removeSpaces,
    realtimeErrors,
    isValid,
    successFields,
    setFieldSuccess,
    clearFieldSuccess,
    getFieldSuccess,
    validatePhone,
    validateVerificationCode,
  }
}
