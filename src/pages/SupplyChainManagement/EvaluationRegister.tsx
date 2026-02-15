import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { SafetyAssessmentFile } from "@/api/09_SupplyChainManagement/evaluation.api"

type FormDataState = {
  company: string
  evaluationName: string
  evaluationType: string
  startDate: string
  endDate: string
  externalEvaluator: string
  evaluationFile: string
  fileUpload: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    name: string
    title: string
    type: number
    startDate: string
    endDate: string
    external: string
    newSheetFiles: File[]
    keepSheetIds: number[]
    newAttachFiles: File[]
    keepAttachIds: number[]
  }) => void
  isEdit?: boolean
  initialData?: {
    id?: number | string
    name?: string
    title?: string
    type?: number
    startDate?: string
    endDate?: string
    external?: string
    sheetFiles?: SafetyAssessmentFile[]
    attachFiles?: SafetyAssessmentFile[]
  }
}

export default function PartnerEvaluationRegister({ isOpen, onClose, onSave, isEdit, initialData }: Props) {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<FormDataState>({
    company: "",
    evaluationName: "",
    evaluationType: "",
    startDate: "",
    endDate: "",
    externalEvaluator: "",
    evaluationFile: "",
    fileUpload: "",
  })
  const [newSheetFiles, setNewSheetFiles] = useState<File[]>([])
  const [newAttachFiles, setNewAttachFiles] = useState<File[]>([])
  const [existingSheetFiles, setExistingSheetFiles] = useState<SafetyAssessmentFile[]>([])
  const [existingAttachFiles, setExistingAttachFiles] = useState<SafetyAssessmentFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({
    company: "",
    evaluationName: "",
    evaluationType: "",
    startDate: "",
    endDate: "",
    externalEvaluator: "",
    sheetFileIds: [] as number[],
    attachFileIds: [] as number[],
  })

  useEffect(() => {
    if (!isOpen) return
    const sheetFiles = initialData?.sheetFiles || []
    const attachFiles = initialData?.attachFiles || []

    setFormData({
      company: initialData?.name || "",
      evaluationName: initialData?.title || "",
      evaluationType: initialData?.type != null ? String(initialData.type) : "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      externalEvaluator: initialData?.external || "",
      evaluationFile: sheetFiles.map(f => getFileNameFromUrl(f.url)).join(","),
      fileUpload: attachFiles.map(f => getFileNameFromUrl(f.url)).join(","),
    })
    setNewSheetFiles([])
    setNewAttachFiles([])
    setExistingSheetFiles(sheetFiles)
    setExistingAttachFiles(attachFiles)
    setInitialSnapshot({
      company: (initialData?.name || "").trim(),
      evaluationName: (initialData?.title || "").trim(),
      evaluationType: initialData?.type != null ? String(initialData.type) : "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      externalEvaluator: (initialData?.external || "").trim(),
      sheetFileIds: sheetFiles.map(f => f.id),
      attachFileIds: attachFiles.map(f => f.id),
    })
  }, [initialData?.id, isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      company: { required: true },
      evaluationName: { required: true },
      evaluationType: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name === "evaluationFile") {
      setNewSheetFiles(prev => [...prev, ...files])
    } else if (name === "fileUpload") {
      setNewAttachFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "evaluationFile") {
      setNewSheetFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "fileUpload") {
      setNewAttachFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    if (existingSheetFiles.some(f => f.url === url)) {
      setExistingSheetFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
    } else {
      setExistingAttachFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
    }
  }

  const sortedIds = (ids: number[]) => ids.slice().sort((a, b) => a - b).join(",")

  const hasChanges =
    formData.company.trim() !== initialSnapshot.company ||
    formData.evaluationName.trim() !== initialSnapshot.evaluationName ||
    formData.evaluationType !== initialSnapshot.evaluationType ||
    formData.startDate !== initialSnapshot.startDate ||
    formData.endDate !== initialSnapshot.endDate ||
    formData.externalEvaluator.trim() !== initialSnapshot.externalEvaluator ||
    newSheetFiles.length > 0 ||
    newAttachFiles.length > 0 ||
    sortedIds(existingSheetFiles.map(f => f.id)) !== sortedIds(initialSnapshot.sheetFileIds) ||
    sortedIds(existingAttachFiles.map(f => f.id)) !== sortedIds(initialSnapshot.attachFileIds)

  const editedFields: Record<string, boolean> = {
    company: formData.company.trim() !== initialSnapshot.company,
    evaluationName: formData.evaluationName.trim() !== initialSnapshot.evaluationName,
    evaluationType: formData.evaluationType !== initialSnapshot.evaluationType,
    contractPeriod: formData.startDate !== initialSnapshot.startDate || formData.endDate !== initialSnapshot.endDate,
    externalEvaluator: formData.externalEvaluator.trim() !== initialSnapshot.externalEvaluator,
    evaluationFile:
      newSheetFiles.length > 0 ||
      sortedIds(existingSheetFiles.map(f => f.id)) !== sortedIds(initialSnapshot.sheetFileIds),
    fileUpload:
      newAttachFiles.length > 0 ||
      sortedIds(existingAttachFiles.map(f => f.id)) !== sortedIds(initialSnapshot.attachFileIds),
  }

  const valuesForForm: { [key: string]: string } = {
    company: formData.company,
    evaluationName: formData.evaluationName,
    evaluationType: formData.evaluationType,
    startDate: formData.startDate,
    endDate: formData.endDate,
    externalEvaluator: formData.externalEvaluator,
    evaluationFile: formData.evaluationFile,
    fileUpload: formData.fileUpload,
  }

  const fields: Field[] = [
    { label: "업체명", name: "company", type: "text", placeholder: "업체명 입력", required: true, hasError: isFieldInvalid("company") },
    { label: "평가명", name: "evaluationName", type: "text", placeholder: "평가명 입력", required: true, hasError: isFieldInvalid("evaluationName") },
    {
      label: "평가종류",
      name: "evaluationType",
      type: "select",
      // TODO: 백엔드 type 매핑 확인 필요 (0=선정평가, 1=정기평가, 2=재평가, 3=수시평가, 4=기타)
      options: [
        { value: "0", label: "선정평가" },
        { value: "1", label: "정기평가" },
        { value: "2", label: "재평가" },
        { value: "3", label: "수시평가" },
        { value: "4", label: "기타" },
      ],
      required: true,
      hasError: isFieldInvalid("evaluationType"),
    },
    { label: "평가기간", name: "contractPeriod", type: "daterange", placeholder: "평가기간 입력", required: false },
    { label: "외부 평가업체", name: "externalEvaluator", type: "text", placeholder: "외부 평가업체 입력", required: false },
    { label: "평가지", name: "evaluationFile", type: "fileUpload", placeholder: "파일명 입력", required: false },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
  ]

  const handleSave = () => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(valuesForForm)) return
    onSave?.({
      name: formData.company,
      title: formData.evaluationName,
      type: Number(formData.evaluationType),
      startDate: formData.startDate,
      endDate: formData.endDate,
      external: formData.externalEvaluator,
      newSheetFiles,
      keepSheetIds: existingSheetFiles.map(f => f.id),
      newAttachFiles,
      keepAttachIds: existingAttachFiles.map(f => f.id),
    })
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>안전보건수준 평가 {isEdit ? "편집" : "등록"}</h2>
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
              evaluationFile: existingSheetFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
              fileUpload: existingAttachFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
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
