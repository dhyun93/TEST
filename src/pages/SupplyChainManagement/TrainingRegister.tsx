import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import ToggleSwitch from "@/components/common/base/ToggleSwitch"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { TrainingFile } from "@/api/09_SupplyChainManagement/training.api"

type TrainingFormData = {
  name: string
  riskAssessment: boolean
  hazardousMaterial: boolean
  responseManual: boolean
  allSigned: boolean
  updatedAt: string
  fileUpload: string
  remarks: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    name: string
    isDanger: number
    isHazardous: number
    isManual: number
    updatedAt: string
    memo: string
    newFiles: File[]
    keepFileIds: number[]
  }) => void
  isEdit?: boolean
  initialData?: {
    id?: number | string
    name?: string
    isDanger?: number
    isHazardous?: number
    isManual?: number
    updatedAt?: string
    memo?: string
    files?: TrainingFile[]
  }
}

export default function PartnerTrainingRegister({ isOpen, onClose, onSave, isEdit, initialData }: Props) {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<TrainingFormData>({
    name: "",
    riskAssessment: false,
    hazardousMaterial: false,
    responseManual: false,
    allSigned: false,
    updatedAt: "",
    fileUpload: "",
    remarks: "",
  })
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<TrainingFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({
    name: "",
    riskAssessment: false,
    hazardousMaterial: false,
    responseManual: false,
    allSigned: false,
    updatedAt: "",
    remarks: "",
    fileIds: [] as number[],
  })

  useEffect(() => {
    if (!isOpen) return
    const files = initialData?.files || []
    const isDanger = initialData?.isDanger === 1
    const isHazardous = initialData?.isHazardous === 1
    const isManual = initialData?.isManual === 1
    const allSigned = isDanger && isHazardous && isManual

    setFormData({
      name: initialData?.name || "",
      riskAssessment: isDanger,
      hazardousMaterial: isHazardous,
      responseManual: isManual,
      allSigned,
      updatedAt: initialData?.updatedAt || "",
      fileUpload: files.map(f => getFileNameFromUrl(f.url)).join(","),
      remarks: initialData?.memo || "",
    })
    setNewFiles([])
    setExistingFiles(files)
    setInitialSnapshot({
      name: (initialData?.name || "").trim(),
      riskAssessment: isDanger,
      hazardousMaterial: isHazardous,
      responseManual: isManual,
      allSigned,
      updatedAt: initialData?.updatedAt || "",
      remarks: (initialData?.memo || "").trim(),
      fileIds: files.map(f => f.id),
    })
  }, [initialData?.id, isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      name: { required: true },
      updatedAt: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, type, checked, value } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name !== "fileUpload") return
    setNewFiles(prev => [...prev, ...files])
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name !== "fileUpload") return
    setNewFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const sortedIds = (ids: number[]) => ids.slice().sort((a, b) => a - b).join(",")

  const hasChanges =
    formData.name.trim() !== initialSnapshot.name ||
    formData.riskAssessment !== initialSnapshot.riskAssessment ||
    formData.hazardousMaterial !== initialSnapshot.hazardousMaterial ||
    formData.responseManual !== initialSnapshot.responseManual ||
    formData.updatedAt !== initialSnapshot.updatedAt ||
    formData.remarks.trim() !== initialSnapshot.remarks ||
    newFiles.length > 0 ||
    sortedIds(existingFiles.map(f => f.id)) !== sortedIds(initialSnapshot.fileIds)

  const editedFields: Record<string, boolean> = {
    name: formData.name.trim() !== initialSnapshot.name,
    updatedAt: formData.updatedAt !== initialSnapshot.updatedAt,
    remarks: formData.remarks.trim() !== initialSnapshot.remarks,
    fileUpload:
      newFiles.length > 0 ||
      sortedIds(existingFiles.map(f => f.id)) !== sortedIds(initialSnapshot.fileIds),
  }

  const renderToggle = (fieldName: keyof Pick<TrainingFormData, "riskAssessment" | "hazardousMaterial" | "responseManual" | "allSigned">): React.ReactNode => {
    return (
      <div className="flex flex-col gap-1">
        <ToggleSwitch checked={formData[fieldName]} onChange={checked => setFormData(prev => ({ ...prev, [fieldName]: checked }))} />
      </div>
    )
  }

  const valuesForForm: { [key: string]: string } = {
    name: formData.name,
    riskAssessment: formData.riskAssessment ? "true" : "false",
    hazardousMaterial: formData.hazardousMaterial ? "true" : "false",
    responseManual: formData.responseManual ? "true" : "false",
    allSigned: formData.allSigned ? "true" : "false",
    updatedAt: formData.updatedAt,
    fileUpload: formData.fileUpload,
    remarks: formData.remarks,
  }

  const fields: Field[] = [
    { label: "도급협의체명", name: "name", type: "text", placeholder: "도급협의체명을 입력하세요", required: true, hasError: isFieldInvalid("name") },
    { label: "위험성평가 확인", name: "riskAssessment", type: "custom", customRender: renderToggle("riskAssessment"), required: false },
    { label: "유해물질 확인", name: "hazardousMaterial", type: "custom", customRender: renderToggle("hazardousMaterial"), required: false },
    { label: "대응매뉴얼 확인", name: "responseManual", type: "custom", customRender: renderToggle("responseManual"), required: false },
    { label: "전체서류 서명", name: "allSigned", type: "custom", customRender: renderToggle("allSigned"), required: false },
    { label: "최종 등록일", name: "updatedAt", type: "date", required: true, hasError: isFieldInvalid("updatedAt") },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
    { label: "비고", name: "remarks", type: "textarea", placeholder: "비고를 입력하세요", required: false },
  ]

  const handleSave = (): void => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(valuesForForm)) return
    onSave?.({
      name: formData.name,
      isDanger: formData.riskAssessment ? 1 : 0,
      isHazardous: formData.hazardousMaterial ? 1 : 0,
      isManual: formData.responseManual ? 1 : 0,
      updatedAt: formData.updatedAt,
      memo: formData.remarks,
      newFiles,
      keepFileIds: existingFiles.map(f => f.id),
    })
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>안전보건 교육/훈련 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={valuesForForm}
            editedFields={editedFields}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            existingFileMap={{
              fileUpload: existingFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onClose={onClose}
            onSave={handleSave}
            isModal
          />
        </div>
        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave} disabledStyleOnly={!hasChanges}>
            저장하기
          </Button>
        </div>
      </div>
    </div>
  )
}
