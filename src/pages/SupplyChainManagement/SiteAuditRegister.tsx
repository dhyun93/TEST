import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { InspectionFile } from "@/api/09_SupplyChainManagement/siteAudit.api"

type FormDataState = {
  inspectionDate: string
  inspectionType: string
  inspectionName: string
  inspectionResult: string
  note: string
  inspector: string
  inspectionPlace: string
  fileUpload: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    inspectionDate: string
    type: number
    title: string
    result: number
    contents: string
    name: string
    newPhotoFiles: File[]
    keepPhotoIds: number[]
    newInfoFiles: File[]
    keepInfoIds: number[]
  }) => void
  isEdit?: boolean
  initialData?: {
    id?: number | string
    inspectionDate?: string
    type?: number
    title?: string
    result?: number
    contents?: string
    name?: string
    photoFiles?: InspectionFile[]
    infoFiles?: InspectionFile[]
  }
}

export default function SiteManagementRegister({ isOpen, onClose, onSave, isEdit, initialData }: Props) {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<FormDataState>({
    inspectionDate: "",
    inspectionType: "",
    inspectionName: "",
    inspectionResult: "",
    note: "",
    inspector: "",
    inspectionPlace: "",
    fileUpload: "",
  })
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newInfoFiles, setNewInfoFiles] = useState<File[]>([])
  const [existingPhotoFiles, setExistingPhotoFiles] = useState<InspectionFile[]>([])
  const [existingInfoFiles, setExistingInfoFiles] = useState<InspectionFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({
    inspectionDate: "",
    inspectionType: "",
    inspectionName: "",
    inspectionResult: "",
    note: "",
    inspector: "",
    photoFileIds: [] as number[],
    infoFileIds: [] as number[],
  })

  useEffect(() => {
    if (!isOpen) return
    const photoFiles = initialData?.photoFiles || []
    const infoFiles = initialData?.infoFiles || []

    setFormData({
      inspectionDate: initialData?.inspectionDate || "",
      inspectionType: initialData?.type != null ? String(initialData.type) : "",
      inspectionName: initialData?.title || "",
      inspectionResult: initialData?.result != null ? String(initialData.result) : "",
      note: initialData?.contents || "",
      inspector: initialData?.name || "",
      inspectionPlace: photoFiles.map(f => getFileNameFromUrl(f.url)).join(","),
      fileUpload: infoFiles.map(f => getFileNameFromUrl(f.url)).join(","),
    })
    setNewPhotoFiles([])
    setNewInfoFiles([])
    setExistingPhotoFiles(photoFiles)
    setExistingInfoFiles(infoFiles)
    setInitialSnapshot({
      inspectionDate: initialData?.inspectionDate || "",
      inspectionType: initialData?.type != null ? String(initialData.type) : "",
      inspectionName: (initialData?.title || "").trim(),
      inspectionResult: initialData?.result != null ? String(initialData.result) : "",
      note: (initialData?.contents || "").trim(),
      inspector: (initialData?.name || "").trim(),
      photoFileIds: photoFiles.map(f => f.id),
      infoFileIds: infoFiles.map(f => f.id),
    })
  }, [initialData?.id, isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      inspectionDate: { required: true },
      inspectionType: { required: true },
      inspectionName: { required: true },
      inspectionResult: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name === "inspectionPlace") {
      setNewPhotoFiles(prev => [...prev, ...files])
    } else if (name === "fileUpload") {
      setNewInfoFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "inspectionPlace") {
      setNewPhotoFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "fileUpload") {
      setNewInfoFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingInfoFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const handleExistingPhotoRemove = (fileName: string, url: string) => {
    setExistingPhotoFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const sortedIds = (ids: number[]) => ids.slice().sort((a, b) => a - b).join(",")

  const hasChanges =
    formData.inspectionDate !== initialSnapshot.inspectionDate ||
    formData.inspectionType !== initialSnapshot.inspectionType ||
    formData.inspectionName.trim() !== initialSnapshot.inspectionName ||
    formData.inspectionResult !== initialSnapshot.inspectionResult ||
    formData.note.trim() !== initialSnapshot.note ||
    formData.inspector.trim() !== initialSnapshot.inspector ||
    newPhotoFiles.length > 0 ||
    newInfoFiles.length > 0 ||
    sortedIds(existingPhotoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.photoFileIds) ||
    sortedIds(existingInfoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.infoFileIds)

  const editedFields: Record<string, boolean> = {
    inspectionDate: formData.inspectionDate !== initialSnapshot.inspectionDate,
    inspectionType: formData.inspectionType !== initialSnapshot.inspectionType,
    inspectionName: formData.inspectionName.trim() !== initialSnapshot.inspectionName,
    inspectionResult: formData.inspectionResult !== initialSnapshot.inspectionResult,
    note: formData.note.trim() !== initialSnapshot.note,
    inspector: formData.inspector.trim() !== initialSnapshot.inspector,
    inspectionPlace:
      newPhotoFiles.length > 0 ||
      sortedIds(existingPhotoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.photoFileIds),
    fileUpload:
      newInfoFiles.length > 0 ||
      sortedIds(existingInfoFiles.map(f => f.id)) !== sortedIds(initialSnapshot.infoFileIds),
  }

  const fields: Field[] = [
    { label: "점검일자", name: "inspectionDate", type: "date", placeholder: "점검일자 선택", required: true, hasError: isFieldInvalid("inspectionDate") },
    {
      label: "점검종류",
      name: "inspectionType",
      type: "select",
      // TODO: 백엔드 type 매핑 확인 필요 (0=정기점검, 1=수시점검, 2=특별점검, 3=합동점검, 4=기타)
      options: [
        { value: "0", label: "정기점검" },
        { value: "1", label: "수시점검" },
        { value: "2", label: "특별점검" },
        { value: "3", label: "합동점검" },
        { value: "4", label: "기타" },
      ],
      placeholder: "점검종류 선택",
      required: true,
      hasError: isFieldInvalid("inspectionType"),
    },
    { label: "점검계획명", name: "inspectionName", type: "text", placeholder: "점검계획명 입력", required: true, hasError: isFieldInvalid("inspectionName") },
    {
      label: "점검결과",
      name: "inspectionResult",
      type: "select",
      // TODO: 백엔드 result 매핑 확인 필요 (0=이상없음, 1=경미한 지적사항, 2=중대 위험요인, 3=시정조치 완료)
      options: [
        { value: "0", label: "이상없음" },
        { value: "1", label: "경미한 지적사항" },
        { value: "2", label: "중대 위험요인" },
        { value: "3", label: "시정조치 완료" },
      ],
      placeholder: "점검결과 선택",
      required: true,
      hasError: isFieldInvalid("inspectionResult"),
    },
    { label: "비고사항", name: "note", type: "textarea", placeholder: "비고 입력", required: false },
    { label: "점검자", name: "inspector", type: "text", placeholder: "점검자 성명 입력", required: false },
    { label: "현장사진", name: "inspectionPlace", type: "photoUpload", required: false },
    { label: "첨부자료", name: "fileUpload", type: "fileUpload", required: false },
  ]

  const handleSave = () => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(formData)) return
    onSave?.({
      inspectionDate: formData.inspectionDate,
      type: Number(formData.inspectionType),
      title: formData.inspectionName,
      result: Number(formData.inspectionResult),
      contents: formData.note,
      name: formData.inspector,
      newPhotoFiles,
      keepPhotoIds: existingPhotoFiles.map(f => f.id),
      newInfoFiles,
      keepInfoIds: existingInfoFiles.map(f => f.id),
    })
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>협동 안전보건점검 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={formData}
            editedFields={editedFields}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            existingFileMap={{
              fileUpload: existingInfoFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            existingPhotoMap={{
              inspectionPlace: existingPhotoFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
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
