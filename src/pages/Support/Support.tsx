import React, { useState, useMemo } from "react"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import PageTitle from "@/components/common/base/PageTitle"
import Button from "@/components/common/base/Button"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { registSupport } from "@/api/12_Support/support.api"
import { useLoadingStore } from "@/stores/loadingStore"

export default function Support() {
  const { setLoading } = useLoadingStore()
  const [values, setValues] = useState({ type: "", title: "", contents: "", writer: "최문의", emailId: "", emailDomain: "", emailDomainSelect: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "writer") return
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailDomainSelect = (domain: string) => {
    setValues(prev => ({ ...prev, emailDomain: domain, emailDomainSelect: domain }))
  }

  const validationRules = useMemo<ValidationRules>(
    () => ({
      type: { required: true },
      title: { required: true },
      emailId: { required: true },
      emailDomain: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleSubmit = async () => {
    if (!validateForm(values)) return
    if (!window.confirm("제출하시겠습니까?")) return

    const email = `${values.emailId}@${values.emailDomain}`
    setLoading(true)
    try {
      const response = await registSupport({
        category: Number(values.type),
        title: values.title,
        contents: values.contents,
        email,
      })
      if (response.code === 200) {
        alert("문의가 등록되었습니다.")
        setValues({ type: "", title: "", contents: "", writer: "최문의", emailId: "", emailDomain: "", emailDomainSelect: "" })
      } else {
        alert(response.msg || "등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("1:1 지원 등록 실패:", error)
      alert("등록에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const fields: Field[] = [
    {
      label: "문의유형",
      name: "type",
      type: "select",
      placeholder: "문의유형 선택",
      required: true,
      hasError: isFieldInvalid("type"),
      options: [
        { value: "0", label: "기술문의" },
        { value: "1", label: "서비스문의" },
        { value: "2", label: "기타문의" },
      ],
    },
    { label: "제목", name: "title", type: "text", placeholder: "제목 입력", required: true, hasError: isFieldInvalid("title") },
    { label: "내용", name: "contents", type: "textarea", placeholder: "내용 입력", required: false },
    { label: "작성자 이름", name: "writer", type: "readonly", required: false },
    { label: "답변 받을 이메일", name: "email", type: "email", placeholder: "이메일 입력", required: true, hasError: isFieldInvalid("emailId") || isFieldInvalid("emailDomain") },
  ]

  return (
    <section className="w-full bg-white">
      <PageTitle>1:1 지원</PageTitle>
      <FormScreen fields={fields} values={values} onChange={handleChange} onEmailDomainSelect={handleEmailDomainSelect} onSubmit={handleSubmit} onClose={() => {}} onSave={() => {}} />
      <div className="flex justify-end mt-5">
        <Button variant="primary" onClick={handleSubmit}>
          제출하기
        </Button>
      </div>
    </section>
  )
}
