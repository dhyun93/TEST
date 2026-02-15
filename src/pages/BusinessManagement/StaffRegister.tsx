import React, { useState, useEffect, useMemo } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { DataRow } from "@/components/common/tables/DataTable"
import { AlertCircle, X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type Staff = {
  name: string
  safetyPosition: string
  subject: string
  rank: string
  phone: string
  employment_date: string
  designated_date: string
  appointmentCertificate?: string
}

type StaffRegisterModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (staff: Staff) => void
  existingStaffs?: DataRow[]
  editData?: DataRow | null
  isEdit?: boolean
}

const initialFormData = {
  name: "",
  safetyPosition: "해당없음",
  subject: "",
  rank: "",
  phone: "",
  phonePrefix: "010",
  phoneMiddle: "",
  phoneLast: "",
  employment_date: "",
  designated_date: "",
  appointmentCertificate: "",
}

export default function StaffRegisterModal({ isOpen, onClose, onSave, existingStaffs = [], editData, isEdit }: StaffRegisterModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>(initialFormData)
  const [warningMessage, setWarningMessage] = useState<string>("")

  // 수정 시 본인을 제외하고 직위 중복 체크
  const filteredStaffs = isEdit && editData ? existingStaffs.filter(s => s.id !== editData.id) : existingStaffs
  const hasCeo = filteredStaffs.some(s => s.safetyPosition === "경영책임자")
  const hasSafetyOfficer = filteredStaffs.some(s => s.safetyPosition === "안전보건관리책임자")
  const safetyManagerCount = filteredStaffs.filter(s => s.safetyPosition === "안전관리자").length
  const healthManagerCount = filteredStaffs.filter(s => s.safetyPosition === "보건관리자").length

  const safetyPositionOptions = useMemo(
    () => [
      { value: "해당없음", label: "해당없음" },
      { value: "안전보건관리책임자", label: "안전보건관리책임자" },
      { value: "안전관리자", label: "안전관리자" },
      { value: "보건관리자", label: "보건관리자" },
      { value: "관리감독자", label: "관리감독자" },
      { value: "경영책임자", label: "경영책임자" },
    ],
    []
  )

  useEffect(() => {
    if (!isOpen) return
    setWarningMessage("")

    if (isEdit && editData) {
      const phoneStr = String(editData.phone || "").replace(/-/g, "")
      setFormData({
        name: String(editData.name || ""),
        safetyPosition: String(editData.safetyPosition || "해당없음"),
        subject: String(editData.subject || ""),
        rank: String(editData.rank || ""),
        phone: String(editData.phone || ""),
        phonePrefix: phoneStr.slice(0, 3) || "010",
        phoneMiddle: phoneStr.slice(3, 7) || "",
        phoneLast: phoneStr.slice(7) || "",
        employment_date: String(editData.employment_date || ""),
        designated_date: String(editData.designated_date || ""),
        appointmentCertificate: "",
      })
    } else {
      setFormData(initialFormData)
    }
  }, [isOpen, editData?.id, isEdit])

  const isDesignatedDateDisabled = formData.safetyPosition === "해당없음"
  const isEmploymentDateDisabled = formData.safetyPosition === "경영책임자"

  const validationRules = useMemo<ValidationRules>(
    () => ({
      name: { required: true },
      phone: { required: true },
      safetyPosition: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleSave = () => {
    if (!validateForm(formData)) return

    if (formData.safetyPosition === "경영책임자" && hasCeo) {
      setWarningMessage("목록 내 지정된 인원이 있습니다. 경영책임자는 1명만 지정 가능합니다.")
      return
    }

    if (formData.safetyPosition === "안전보건관리책임자" && hasSafetyOfficer) {
      setWarningMessage("목록 내 지정된 인원이 있습니다. 안전보건관리책임자는 1명만 지정 가능합니다.")
      return
    }

    if (formData.safetyPosition === "안전관리자" && safetyManagerCount >= 10) {
      setWarningMessage("안전관리자 지정인원이 초과되었습니다. (최대 10명)")
      return
    }

    if (formData.safetyPosition === "보건관리자" && healthManagerCount >= 10) {
      setWarningMessage("보건관리자 지정인원이 초과되었습니다. (최대 10명)")
      return
    }

    onSave(formData as Staff)
  }

  const fields: Field[] = [
    { label: "이름", name: "name", type: "text", placeholder: "이름 입력", required: true, hasError: isFieldInvalid("name") },
    { label: "연락처", name: "phone", type: "phone", placeholder: "연락처 입력", required: true, hasError: isFieldInvalid("phone") },
    { label: "안전직위", name: "safetyPosition", type: "select", options: safetyPositionOptions, required: true, hasError: isFieldInvalid("safetyPosition") },
    { label: "안전직위 지정일", name: "designated_date", type: "date", required: false, disabled: isDesignatedDateDisabled },
    // TODO: 백엔드 선임신고서 파일 필드 추가 대기
    { label: "선임(신고서)", name: "appointmentCertificate", type: "fileUpload", required: false, disabled: isDesignatedDateDisabled },
    { label: "부서", name: "subject", type: "text", placeholder: "부서 입력", required: false },
    { label: "직급", name: "rank", type: "text", placeholder: "직급 입력", required: false },
    { label: "입사일", name: "employment_date", type: "date", required: false, disabled: isEmploymentDateDisabled },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setWarningMessage("")

    if (name === "safetyPosition") {
      if (value === "해당없음") {
        setFormData(prev => ({ ...prev, [name]: value, designated_date: "", appointmentCertificate: "" }))
      } else if (value === "경영책임자") {
        setFormData(prev => ({ ...prev, [name]: value, employment_date: "" }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>인력 {isEdit ? "수정" : "추가"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          {warningMessage && (
            <div className="mb-4 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs md:text-sm">
              <AlertCircle size={16} className="md:w-[18px] md:h-[18px] shrink-0" />
              {warningMessage}
            </div>
          )}
          <FormScreen fields={fields} values={formData} onChange={handleChange} onClose={onClose} onSave={handleSave} isModal={true} />
        </div>
        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? "수정하기" : "저장하기"}
          </Button>
        </div>
      </div>
    </div>
  )
}
