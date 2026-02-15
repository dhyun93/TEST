import { useState, useCallback } from "react"
import { ValidationRules } from "./useForm"
import { findId, findPassword } from "@/api/00_Auth/find.api"

type MockUser = { id: string; name: string; position: string; phone: string; pw: string }

const mockUsers: MockUser[] = [
  { id: "admin", name: "박대표", position: "경영책임자", phone: "010-1234-5678", pw: "123" },
  { id: "manager", name: "홍길동", position: "안전관리자", phone: "010-9876-5432", pw: "123" },
]

const loginMessages = {
  loginIdRequired: "아이디를 입력해주세요",
  loginPwRequired: "비밀번호를 입력해주세요",
  loginFailed: "아이디 또는 비밀번호를 확인해주세요",
  loginSuccess: "로그인되었습니다",
  nameRequired: "이름을 입력해주세요",
  phoneRequired: "휴대전화번호를 입력해주세요",
  phoneInvalid: "휴대전화번호를 정확히 입력해주세요",
  idRequired: "아이디를 입력해주세요",
  userNotFound: "일치하는 사용자 정보가 없습니다",
  idSentToPhone: "아이디가 휴대전화번호로 전송되었습니다",
  tempPwSentToPhone: "임시 비밀번호가 휴대전화번호로 전송되었습니다",
}

export const loginValidationRules: ValidationRules = {
  id: { required: true, message: loginMessages.loginIdRequired },
  pw: { required: true, message: loginMessages.loginPwRequired },
}

export const findIdValidationRules: ValidationRules = {
  findIdName: { required: true, message: loginMessages.nameRequired },
  findIdPhone: { required: true, message: loginMessages.phoneRequired, phoneMinDigits: 10, phoneMessage: loginMessages.phoneInvalid },
}

export const findPwValidationRules: ValidationRules = {
  findPwId: { required: true, message: loginMessages.idRequired },
  findPwPhone: { required: true, message: loginMessages.phoneRequired, phoneMinDigits: 10, phoneMessage: loginMessages.phoneInvalid },
}

export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

export const validateLogin = (id: string, pw: string): { success: boolean; user?: { name: string; position: string }; error?: string; successMessage?: string } => {
  const userById = mockUsers.find(u => u.id === id)
  if (!userById || userById.pw !== pw) {
    return { success: false, error: loginMessages.loginFailed }
  }
  return { success: true, user: { name: userById.name, position: userById.position }, successMessage: loginMessages.loginSuccess }
}

type FindIdErrors = { name: string; phone: string }

export const useFindId = () => {
  const [form, setForm] = useState({ name: "", phone: "" })
  const [errors, setErrors] = useState<FindIdErrors>({ name: "", phone: "" })
  const [result, setResult] = useState("")

  const setName = useCallback((value: string) => {
    setForm(s => ({ ...s, name: value }))
    setErrors(s => ({ ...s, name: "" }))
  }, [])

  const setPhone = useCallback((value: string) => {
    setForm(s => ({ ...s, phone: formatPhoneNumber(value) }))
    setErrors(s => ({ ...s, phone: "" }))
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: FindIdErrors = { name: "", phone: "" }
    let isValid = true

    if (!form.name.trim()) {
      newErrors.name = loginMessages.nameRequired
      isValid = false
    }

    const phoneDigits = form.phone.replace(/[^\d]/g, "")
    if (!form.phone.trim()) {
      newErrors.phone = loginMessages.phoneRequired
      isValid = false
    } else if (phoneDigits.length < 10) {
      newErrors.phone = loginMessages.phoneInvalid
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }, [form])

  const submit = useCallback(async () => {
    setResult("")
    if (!validate()) return

    try {
      const phoneDigits = form.phone.replace(/[^\d]/g, "")
      const response = await findId({ name: form.name.trim(), phone: phoneDigits })
      setResult(response.msg)
    } catch (error: any) {
      const message = error?.response?.data?.msg || loginMessages.userNotFound
      setResult(message)
    }
  }, [form.name, form.phone, validate])

  const reset = useCallback(() => {
    setForm({ name: "", phone: "" })
    setErrors({ name: "", phone: "" })
    setResult("")
  }, [])

  return { form, errors, result, setName, setPhone, submit, reset }
}

type FindPwErrors = { id: string; phone: string }

export const useFindPw = () => {
  const [form, setForm] = useState({ id: "", phone: "" })
  const [errors, setErrors] = useState<FindPwErrors>({ id: "", phone: "" })
  const [result, setResult] = useState("")

  const setId = useCallback((value: string) => {
    setForm(s => ({ ...s, id: value }))
    setErrors(s => ({ ...s, id: "" }))
  }, [])

  const setPhone = useCallback((value: string) => {
    setForm(s => ({ ...s, phone: formatPhoneNumber(value) }))
    setErrors(s => ({ ...s, phone: "" }))
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: FindPwErrors = { id: "", phone: "" }
    let isValid = true

    if (!form.id.trim()) {
      newErrors.id = loginMessages.idRequired
      isValid = false
    }

    const phoneDigits = form.phone.replace(/[^\d]/g, "")
    if (!form.phone.trim()) {
      newErrors.phone = loginMessages.phoneRequired
      isValid = false
    } else if (phoneDigits.length < 10) {
      newErrors.phone = loginMessages.phoneInvalid
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }, [form])

  const submit = useCallback(async () => {
    setResult("")
    if (!validate()) return

    try {
      const phoneDigits = form.phone.replace(/[^\d]/g, "")
      const response = await findPassword({ phone: phoneDigits, username: form.id.trim() })
      setResult(response.msg)
    } catch (error: any) {
      const message = error?.response?.data?.msg || loginMessages.userNotFound
      setResult(message)
    }
  }, [form.id, form.phone, validate])

  const reset = useCallback(() => {
    setForm({ id: "", phone: "" })
    setErrors({ id: "", phone: "" })
    setResult("")
  }, [])

  return { form, errors, result, setId, setPhone, submit, reset }
}
