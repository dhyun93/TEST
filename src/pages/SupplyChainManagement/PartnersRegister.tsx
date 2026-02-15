import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { ConsultativeFile } from "@/api/09_SupplyChainManagement/partners.api"

type PartnerFormData = {
  company: string
  contractStartDate: string
  contractEndDate: string
  managerList: string[]
  contact: string
  planFile: string
  etcFile: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    name: string
    startDate: string
    endDate: string
    manager: string
    phone: string
    newPlanFiles: File[]
    keepPlanIds: number[]
    newEtcFiles: File[]
    keepEtcIds: number[]
  }) => void
  isEdit?: boolean
  initialData?: {
    id?: number | string
    name?: string
    startDate?: string
    endDate?: string
    manager?: string
    phone?: string
    planFiles?: ConsultativeFile[]
    etcFiles?: ConsultativeFile[]
  }
}

const BASE_INPUT_CLASS =
  "border border-[var(--border)] px-2 md:px-3 h-[32px] md:h-[36px] w-full appearance-none placeholder:text-gray-500 text-xs md:text-base font-normal rounded-[8px] bg-white focus:outline-none focus:border-[var(--primary)] transition-colors"

export default function PartnerRegister({ isOpen, onClose, onSave, isEdit, initialData }: Props) {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<PartnerFormData>({
    company: "",
    contractStartDate: "",
    contractEndDate: "",
    managerList: [""],
    contact: "",
    planFile: "",
    etcFile: "",
  })
  const [newPlanFiles, setNewPlanFiles] = useState<File[]>([])
  const [newEtcFiles, setNewEtcFiles] = useState<File[]>([])
  const [existingPlanFiles, setExistingPlanFiles] = useState<ConsultativeFile[]>([])
  const [existingEtcFiles, setExistingEtcFiles] = useState<ConsultativeFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({
    company: "",
    contractStartDate: "",
    contractEndDate: "",
    manager: "",
    contact: "",
    planFileIds: [] as number[],
    etcFileIds: [] as number[],
  })

  useEffect(() => {
    if (!isOpen) return
    const planFiles = initialData?.planFiles || []
    const etcFiles = initialData?.etcFiles || []
    // manager: comma-separated string from API ("이안전, 홍길동")
    const managers = initialData?.manager ? initialData.manager.split(",").map(s => s.trim()).filter(Boolean) : [""]

    setFormData({
      company: initialData?.name || "",
      contractStartDate: initialData?.startDate || "",
      contractEndDate: initialData?.endDate || "",
      managerList: managers.length > 0 ? managers : [""],
      contact: initialData?.phone || "",
      planFile: planFiles.map(f => getFileNameFromUrl(f.url)).join(","),
      etcFile: etcFiles.map(f => getFileNameFromUrl(f.url)).join(","),
    })
    setNewPlanFiles([])
    setNewEtcFiles([])
    setExistingPlanFiles(planFiles)
    setExistingEtcFiles(etcFiles)
    setInitialSnapshot({
      company: (initialData?.name || "").trim(),
      contractStartDate: initialData?.startDate || "",
      contractEndDate: initialData?.endDate || "",
      manager: initialData?.manager || "",
      contact: (initialData?.phone || "").trim(),
      planFileIds: planFiles.map(f => f.id),
      etcFileIds: etcFiles.map(f => f.id),
    })
  }, [initialData?.id, isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      company: { required: true },
      startDate: { required: true },
      endDate: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, index?: number) => {
    const { name, value } = e.target as HTMLInputElement
    if (name === "managerList" && typeof index === "number") {
      const newList = [...formData.managerList]
      newList[index] = value
      setFormData(prev => ({ ...prev, managerList: newList }))
    } else if (name === "startDate") {
      setFormData(prev => ({ ...prev, contractStartDate: value }))
    } else if (name === "endDate") {
      setFormData(prev => ({ ...prev, contractEndDate: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addManager = () => {
    if (formData.managerList.length >= 8) return
    setFormData(prev => ({ ...prev, managerList: [...prev.managerList, ""] }))
  }

  const removeManager = (index: number) => {
    if (formData.managerList.length <= 1) return
    setFormData(prev => ({
      ...prev,
      managerList: prev.managerList.filter((_, i) => i !== index),
    }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name === "planFile") {
      setNewPlanFiles(prev => [...prev, ...files])
    } else if (name === "etcFile") {
      setNewEtcFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "planFile") {
      setNewPlanFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "etcFile") {
      setNewEtcFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    // onExistingFileRemove is called for both planFile and etcFile
    // identify by checking which list contains the url
    if (existingPlanFiles.some(f => f.url === url)) {
      setExistingPlanFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
    } else {
      setExistingEtcFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
    }
  }

  const sortedIds = (ids: number[]) => ids.slice().sort((a, b) => a - b).join(",")
  const currentManager = formData.managerList.filter(s => s.trim()).join(", ")

  const hasChanges =
    formData.company.trim() !== initialSnapshot.company ||
    formData.contractStartDate !== initialSnapshot.contractStartDate ||
    formData.contractEndDate !== initialSnapshot.contractEndDate ||
    currentManager !== initialSnapshot.manager ||
    formData.contact.trim() !== initialSnapshot.contact ||
    newPlanFiles.length > 0 ||
    newEtcFiles.length > 0 ||
    sortedIds(existingPlanFiles.map(f => f.id)) !== sortedIds(initialSnapshot.planFileIds) ||
    sortedIds(existingEtcFiles.map(f => f.id)) !== sortedIds(initialSnapshot.etcFileIds)

  const editedFields: Record<string, boolean> = {
    company: formData.company.trim() !== initialSnapshot.company,
    contractPeriod: formData.contractStartDate !== initialSnapshot.contractStartDate || formData.contractEndDate !== initialSnapshot.contractEndDate,
    contact: formData.contact.trim() !== initialSnapshot.contact,
    planFile:
      newPlanFiles.length > 0 ||
      sortedIds(existingPlanFiles.map(f => f.id)) !== sortedIds(initialSnapshot.planFileIds),
    etcFile:
      newEtcFiles.length > 0 ||
      sortedIds(existingEtcFiles.map(f => f.id)) !== sortedIds(initialSnapshot.etcFileIds),
  }

  const valuesForForm: { [key: string]: string } = {
    company: formData.company,
    startDate: formData.contractStartDate,
    endDate: formData.contractEndDate,
    contact: formData.contact,
    planFile: formData.planFile,
    etcFile: formData.etcFile,
  }

  const fields: Field[] = [
    { label: "업체명", name: "company", type: "text", placeholder: "업체명 입력", required: true, hasError: isFieldInvalid("company") },
    { label: "계약기간", name: "contractPeriod", type: "daterange", required: true, hasError: isFieldInvalid("startDate") || isFieldInvalid("endDate") },
    { label: "담당자 연락처", name: "contact", type: "phone", placeholder: "연락처 입력", required: false },
    { label: "안전보건계획서", name: "planFile", type: "fileUpload", required: false },
    { label: "계약서류", name: "etcFile", type: "fileUpload", required: false },
  ]

  const handleSave = () => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(valuesForForm)) return
    onSave?.({
      name: formData.company,
      startDate: formData.contractStartDate,
      endDate: formData.contractEndDate,
      // managerList joined as comma-separated string for API
      manager: currentManager,
      phone: formData.contact,
      newPlanFiles,
      keepPlanIds: existingPlanFiles.map(f => f.id),
      newEtcFiles,
      keepEtcIds: existingEtcFiles.map(f => f.id),
    })
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>수급업체 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.contentWithSpace}>
          <FormScreen
            fields={fields}
            values={valuesForForm}
            editedFields={editedFields}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            existingFileMap={{
              planFile: existingPlanFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
              etcFile: existingEtcFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onClose={onClose}
            onSave={handleSave}
            isModal
          />
          <div className="mt-6">
            <div className="flex items-center mb-2 gap-2">
              <label className="block text-xs md:text-base font-medium">현장관리자 등록</label>
              {formData.managerList.length < 8 && (
                <button
                  type="button"
                  onClick={addManager}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 hover:text-sky-800 transition select-none"
                  title="현장관리자 추가"
                  aria-label="현장관리자 추가"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.managerList.map((name, idx) => (
                <div key={idx} className="relative w-full md:w-auto" style={{ maxWidth: 230 }}>
                  <input type="text" name="managerList" placeholder="이름/직함/소속 입력" value={name} onChange={e => handleChange(e, idx)} className={`${BASE_INPUT_CLASS} pr-9`} />
                  {formData.managerList.length > 1 && idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeManager(idx)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition select-none"
                      title="삭제"
                      aria-label={`현장관리자 ${idx + 1} 삭제`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
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
