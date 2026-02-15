import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { ContractSafetyFile } from "@/api/09_SupplyChainManagement/committee.api"

type ContractFormData = {
  contractDate: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  meetingPlace: string
  attendeeClient: string
  attendeeSubcontractor: string
  note: string
  contractFile: string
  fileUpload: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    meetDate: string
    startTime: string
    endTime: string
    place: string
    contractor: string
    recipient: string
    contents: string
    newPhotoFiles: File[]
    keepPhotoIds: number[]
    newProceedFiles: File[]
    keepProceedIds: number[]
  }) => void
  isEdit?: boolean
  initialData?: {
    id?: number | string
    meetDate?: string
    startTime?: string
    endTime?: string
    place?: string
    contractor?: string
    recipient?: string
    contents?: string
    photoFiles?: ContractSafetyFile[]
    proceedFiles?: ContractSafetyFile[]
  }
}

export default function ContractDocumentRegister({ isOpen, onClose, onSave, isEdit, initialData }: Props) {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<ContractFormData>({
    contractDate: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    meetingPlace: "",
    attendeeClient: "",
    attendeeSubcontractor: "",
    note: "",
    contractFile: "",
    fileUpload: "",
  })
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newProceedFiles, setNewProceedFiles] = useState<File[]>([])
  const [existingPhotoFiles, setExistingPhotoFiles] = useState<ContractSafetyFile[]>([])
  const [existingProceedFiles, setExistingProceedFiles] = useState<ContractSafetyFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({
    contractDate: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    meetingPlace: "",
    attendeeClient: "",
    attendeeSubcontractor: "",
    note: "",
    photoFileIds: [] as number[],
    proceedFileIds: [] as number[],
  })

  useEffect(() => {
    if (!isOpen) return
    const [sh, sm] = (initialData?.startTime || "").split(":")
    const [eh, em] = (initialData?.endTime || "").split(":")
    const photoFiles = initialData?.photoFiles || []
    const proceedFiles = initialData?.proceedFiles || []

    setFormData({
      contractDate: initialData?.meetDate || "",
      startHour: sh || "",
      startMinute: sm || "",
      endHour: eh || "",
      endMinute: em || "",
      meetingPlace: initialData?.place || "",
      attendeeClient: initialData?.contractor || "",
      attendeeSubcontractor: initialData?.recipient || "",
      note: initialData?.contents || "",
      contractFile: proceedFiles.map(f => getFileNameFromUrl(f.url)).join(","),
      fileUpload: photoFiles.map(f => getFileNameFromUrl(f.url)).join(","),
    })
    setNewPhotoFiles([])
    setNewProceedFiles([])
    setExistingPhotoFiles(photoFiles)
    setExistingProceedFiles(proceedFiles)
    setInitialSnapshot({
      contractDate: initialData?.meetDate || "",
      startHour: sh || "",
      startMinute: sm || "",
      endHour: eh || "",
      endMinute: em || "",
      meetingPlace: (initialData?.place || "").trim(),
      attendeeClient: (initialData?.contractor || "").trim(),
      attendeeSubcontractor: (initialData?.recipient || "").trim(),
      note: (initialData?.contents || "").trim(),
      photoFileIds: photoFiles.map(f => f.id),
      proceedFileIds: proceedFiles.map(f => f.id),
    })
  }, [initialData?.id, isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      contractDate: { required: true },
      startHour: { required: true },
      meetingPlace: { required: true },
      note: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name === "contractFile") {
      setNewProceedFiles(prev => [...prev, ...files])
    } else if (name === "fileUpload") {
      setNewPhotoFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "contractFile") {
      setNewProceedFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "fileUpload") {
      setNewPhotoFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingProceedFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const handleExistingPhotoRemove = (fileName: string, url: string) => {
    setExistingPhotoFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const sortedIds = (ids: number[]) => ids.slice().sort((a, b) => a - b).join(",")

  const hasChanges =
    formData.contractDate !== initialSnapshot.contractDate ||
    formData.startHour !== initialSnapshot.startHour ||
    formData.startMinute !== initialSnapshot.startMinute ||
    formData.endHour !== initialSnapshot.endHour ||
    formData.endMinute !== initialSnapshot.endMinute ||
    formData.meetingPlace.trim() !== initialSnapshot.meetingPlace ||
    formData.attendeeClient.trim() !== initialSnapshot.attendeeClient ||
    formData.attendeeSubcontractor.trim() !== initialSnapshot.attendeeSubcontractor ||
    formData.note.trim() !== initialSnapshot.note ||
    newPhotoFiles.length > 0 ||
    newProceedFiles.length > 0 ||
    sortedIds(existingPhotoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.photoFileIds) ||
    sortedIds(existingProceedFiles.map(f => f.id)) !== sortedIds(initialSnapshot.proceedFileIds)

  const editedFields: Record<string, boolean> = {
    contractDate: formData.contractDate !== initialSnapshot.contractDate,
    contractTime:
      formData.startHour !== initialSnapshot.startHour ||
      formData.startMinute !== initialSnapshot.startMinute ||
      formData.endHour !== initialSnapshot.endHour ||
      formData.endMinute !== initialSnapshot.endMinute,
    meetingPlace: formData.meetingPlace.trim() !== initialSnapshot.meetingPlace,
    attendeeClient: formData.attendeeClient.trim() !== initialSnapshot.attendeeClient,
    attendeeSubcontractor: formData.attendeeSubcontractor.trim() !== initialSnapshot.attendeeSubcontractor,
    note: formData.note.trim() !== initialSnapshot.note,
    contractFile:
      newProceedFiles.length > 0 ||
      sortedIds(existingProceedFiles.map(f => f.id)) !== sortedIds(initialSnapshot.proceedFileIds),
    fileUpload:
      newPhotoFiles.length > 0 ||
      sortedIds(existingPhotoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.photoFileIds),
  }

  const handleSave = () => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(formData)) return
    const startTime = `${formData.startHour.padStart(2, "0")}:${(formData.startMinute || "00").padStart(2, "0")}`
    const endTime = `${(formData.endHour || formData.startHour).padStart(2, "0")}:${(formData.endMinute || "00").padStart(2, "0")}`
    onSave?.({
      meetDate: formData.contractDate,
      startTime,
      endTime,
      place: formData.meetingPlace,
      contractor: formData.attendeeClient,
      recipient: formData.attendeeSubcontractor,
      contents: formData.note,
      newPhotoFiles,
      keepPhotoIds: existingPhotoFiles.map(f => f.id),
      newProceedFiles,
      keepProceedIds: existingProceedFiles.map(f => f.id),
    })
  }

  const fields: Field[] = [
    { label: "회의일", name: "contractDate", type: "date", placeholder: "날짜 선택", required: true, hasError: isFieldInvalid("contractDate") },
    { label: "회의시간", name: "contractTime", type: "timeRange", placeholder: "시간 선택", required: true, hasError: isFieldInvalid("startHour") },
    { label: "회의장소", name: "meetingPlace", type: "text", placeholder: "회의장소 입력", required: true, hasError: isFieldInvalid("meetingPlace") },
    { label: "참석자(도급인)", name: "attendeeClient", type: "text", placeholder: "도급인 참석자 입력", required: false },
    { label: "참석자(수급인)", name: "attendeeSubcontractor", type: "text", placeholder: "수급인 참석자 입력", required: false },
    { label: "회의내용", name: "note", type: "textarea", placeholder: "회의내용 입력", required: true, hasError: isFieldInvalid("note") },
    { label: "회의록", name: "contractFile", type: "fileUpload", placeholder: "파일명 입력", required: false },
    { label: "현장사진", name: "fileUpload", type: "photoUpload", required: false },
  ]

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>안전보건협의체 회의록 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={formData}
            editedFields={editedFields}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            existingFileMap={{
              contractFile: existingProceedFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            existingPhotoMap={{
              fileUpload: existingPhotoFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onExistingPhotoRemove={handleExistingPhotoRemove}
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
