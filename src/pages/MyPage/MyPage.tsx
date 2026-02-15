import React, { useState, useMemo, useEffect } from "react"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import SignaturePadDialog from "@/components/dialog/SignaturePadDialog"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { useApprovalStore } from "@/stores/approvalStore"

export default function MyPage() {
  const { currentUser } = useApprovalStore()

  const [values, setValues] = useState<Record<string, string>>({
    userId: currentUser.name === "박대표" ? "admin" : "manager",
    name: currentUser.name,
    safetyRole: currentUser.position,
    phonePrefix: "010",
    phoneMiddle: "",
    phoneLast: "",
    emailId: "",
    emailDomain: "",
    emailDomainSelect: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    signature: "/images/sample-signature.png",
    verificationCode: "",
  })

  const [showVerificationCode, setShowVerificationCode] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)

  useEffect(() => {
    setValues(prev => ({
      ...prev,
      userId: currentUser.name === "박대표" ? "admin" : "manager",
      name: currentUser.name,
      safetyRole: currentUser.position,
    }))
  }, [currentUser])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      currentPassword: { required: true },
      phone: { required: true },
      newPassword: {
        minLength: 3,
        notMatchField: "currentPassword",
        notMatchFieldMessage: "현재 비밀번호와 다른 비밀번호를 입력해주세요.",
      },
      confirmPassword: {
        matchField: "newPassword",
        matchFieldMessage: "새 비밀번호와 일치하지 않습니다.",
      },
    }),
    []
  )

  const { validateForm, isFieldInvalid, clearFieldError, getFieldError, removeSpaces, realtimeErrors, isValid, getFieldSuccess, validatePhone, validateVerificationCode } = useForm(
    validationRules,
    values
  )

  const handleVerifyPhone = () => {
    if (validatePhone(values.phone)) {
      setShowVerificationCode(true)
    }
  }

  const handleVerifyCode = () => {
    const mockValidCode = "123456"
    validateVerificationCode(values.verificationCode, mockValidCode)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const passwordFields = ["currentPassword", "newPassword", "confirmPassword"]

    if (getFieldError(name)) {
      clearFieldError(name)
    }

    if (passwordFields.includes(name)) {
      setValues(prev => ({ ...prev, [name]: removeSpaces(value) }))
    } else {
      setValues(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleDomainSelect = (domain: string) => {
    setValues(prev => ({ ...prev, emailDomain: domain, emailDomainSelect: domain }))
  }

  const handleSignatureEdit = () => {
    setShowSignaturePad(true)
  }

  const handleSignaturePadSave = (dataUrl: string) => {
    setValues(prev => ({ ...prev, signature: dataUrl }))
    setShowSignaturePad(false)
    console.log("서명 저장:", dataUrl)
  }

  const handleSubmit = () => {
    if (!validateForm(values)) return
    if (!isValid) {
      alert("입력값을 확인해주세요.")
      return
    }
    console.log("폼 제출", values)
  }

  const isNewPasswordValid = values.newPassword && values.newPassword.length >= 3 && !realtimeErrors.newPassword

  const fields: Field[] = [
    { label: "아이디", name: "userId", type: "readonly", required: false },
    { label: "이름", name: "name", type: "readonly", required: false },
    { label: "안전직위", name: "safetyRole", type: "readonly", required: false },

    { label: "현재 비밀번호", name: "currentPassword", type: "password", required: true, hasError: isFieldInvalid("currentPassword"), error: getFieldError("currentPassword") },

    { label: "새 비밀번호", name: "newPassword", type: "password", required: false, error: realtimeErrors.newPassword },
    { label: "비밀번호 확인", name: "confirmPassword", type: "password", required: false, error: realtimeErrors.confirmPassword, disabled: !isNewPasswordValid },

    {
      label: "휴대전화번호",
      name: "phone",
      type: "phone",
      required: true,
      hasError: isFieldInvalid("phone"),
      error: getFieldError("phone"),
      buttonRender: (
        <Button variant="action" onClick={handleVerifyPhone}>
          인증하기
        </Button>
      ),
    },

    ...(showVerificationCode
      ? [
          {
            label: "인증번호",
            name: "verificationCode",
            type: "text" as const,
            required: true,
            placeholder: "인증번호 입력",
            hasError: isFieldInvalid("verificationCode"),
            error: getFieldError("verificationCode"),
            successMessage: getFieldSuccess("verificationCode") || undefined,
            buttonRender: (
              <Button variant="action" onClick={handleVerifyCode}>
                인증번호 확인
              </Button>
            ),
          },
        ]
      : []),

    { label: "이메일", name: "email", type: "email", required: false },

    { label: "서명", name: "signature", type: "signature", required: false, signatureEditable: true, onSignatureEdit: handleSignatureEdit },
  ]

  return (
    <>
      <section className="mypage-content w-full">
        <PageTitle>마이페이지</PageTitle>

        <FormScreen fields={fields} values={values} onChange={handleChange} onEmailDomainSelect={handleDomainSelect} onSubmit={handleSubmit} onClose={() => {}} onSave={() => {}} />

        <div className="flex justify-end mt-5">
          <Button variant="primary" onClick={handleSubmit}>
            저장하기
          </Button>
        </div>
      </section>

      <SignaturePadDialog isOpen={showSignaturePad} title="서명하기" onSave={handleSignaturePadSave} onClose={() => setShowSignaturePad(false)} />
    </>
  )
}
