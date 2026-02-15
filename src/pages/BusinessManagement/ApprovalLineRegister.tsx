import React, { useState, useEffect, useMemo } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import { Tag } from "@/components/common/base/Badge"
import { DataRow } from "@/components/common/tables/DataTable"
import { ChevronRight, X } from "lucide-react"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type ApprovalLineRegisterModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<DataRow>) => void
  editData: DataRow | null
}

const STEP_OPTIONS = [
  { value: "2단계", label: "2단계" },
  { value: "3단계", label: "3단계" },
  { value: "4단계", label: "4단계" },
  { value: "5단계", label: "5단계" },
]

const APPROVER_OPTIONS = [
  { value: "안전보건관리책임자", label: "안전보건관리책임자" },
  { value: "안전관리자", label: "안전관리자" },
  { value: "보건관리자", label: "보건관리자" },
  { value: "관리감독자", label: "관리감독자" },
  { value: "경영책임자", label: "경영책임자" },
]

const initialFormData: { [key: string]: string } = {
  name: "",
  steps: "2단계",
  approver1: "",
  approver2: "",
  approver3: "",
  approver4: "",
  approver5: "",
}

export default function ApprovalLineRegisterModal({ isOpen, onClose, onSave, editData }: ApprovalLineRegisterModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>(initialFormData)

  const getStepCount = () => parseInt(formData.steps) || 2

  const validationRules = useMemo<ValidationRules>(() => {
    const stepCount = getStepCount()
    const rules: ValidationRules = {
      name: { required: true },
      steps: { required: true },
    }
    for (let i = 1; i <= stepCount; i++) {
      rules[`approver${i}`] = { required: true }
    }
    return rules
  }, [formData.steps])

  const { validateForm, isFieldInvalid, clearErrors } = useForm(validationRules)

  useEffect(() => {
    if (isOpen) {
      clearErrors()
      if (editData) {
        const approverList = ((editData.approvers as string) || "").split(" → ")
        setFormData({
          name: (editData.name as string) || "",
          steps: (editData.steps as string) || "2단계",
          approver1: approverList[0] || "",
          approver2: approverList[1] || "",
          approver3: approverList[2] || "",
          approver4: approverList[3] || "",
          approver5: approverList[4] || "",
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [isOpen, editData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getApprovers = () => {
    const stepCount = getStepCount()
    const approvers: string[] = []
    for (let i = 1; i <= stepCount; i++) {
      if (formData[`approver${i}`]) {
        approvers.push(formData[`approver${i}`])
      }
    }
    return approvers
  }

  const handleSave = () => {
    if (!validateForm(formData)) return

    const stepCount = getStepCount()
    const approvers: string[] = []
    for (let i = 1; i <= stepCount; i++) {
      approvers.push(formData[`approver${i}`] || "")
    }
    const approversString = approvers.join(" → ")
    onSave({
      name: formData.name,
      steps: formData.steps,
      approvers: approversString,
    })
  }

  const stepCount = getStepCount()
  const selectedApprovers = getApprovers()

  const fields: Field[] = [
    { label: "결재선명", name: "name", type: "text", placeholder: "결재선명 입력", required: true, hasError: isFieldInvalid("name") },
    { label: "결재단계", name: "steps", type: "select", options: STEP_OPTIONS, required: true, hasError: isFieldInvalid("steps") },
    ...Array.from({ length: stepCount }, (_, i) => ({
      label: `${i + 1}단계 결재자`,
      name: `approver${i + 1}`,
      type: "select" as const,
      options: APPROVER_OPTIONS,
      required: true,
      hasError: isFieldInvalid(`approver${i + 1}`),
    })),
    ...(selectedApprovers.length > 0
      ? [
          {
            label: "결재선",
            name: "preview",
            type: "custom" as const,
            customRender: (
              <div className="flex items-center flex-wrap gap-1">
                {selectedApprovers.map((approver, idx) => (
                  <span key={idx} className="flex items-center">
                    <Tag>{approver}</Tag>
                    {idx < selectedApprovers.length - 1 && <ChevronRight size={14} className="text-gray-400 mx-1.5" />}
                  </span>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ]

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>{editData ? "결재선 수정" : "결재선 추가"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen fields={fields} values={formData} onChange={handleChange} onClose={onClose} onSave={handleSave} isModal={true} />
        </div>
        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editData ? "수정하기" : "저장하기"}
          </Button>
        </div>
      </div>
    </div>
  )
}
