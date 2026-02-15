import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoadingStore } from "@/stores/loadingStore"
import { DocumentTemplate } from "@/docExport"
import { DataRow } from "@/components/common/tables/DataTable"
import { AttendeeGroup } from "@/data/mockBusinessData"
import { useDocumentExport } from "./useExport"
import { downloadFiles } from "@/utils/download"

export interface ButtonHandlersParams<T = any> {
  data: T[]
  checkedIds: (number | string)[]
  onCreate?: () => void
  onDeleteSuccess?: (deletedIds: (number | string)[]) => void
  onSave?: () => void
  onSaveComplete?: () => void
  onAdd?: () => void
  onNextStep?: () => void
  navigateOnComplete?: string
  saveMessage?: string
  saveAndNextMessage?: string
  completeMessage?: string
  notificationMessage?: string
  onOpenMoveModal?: () => void
  onMoveSuccess?: (targetGroup: string) => void
  groupKey?: string
  createTemplate?: (row: T, index: number) => DocumentTemplate
  excelFileNamePrefix?: string
}

export interface ButtonHandlers {
  handleCreate: () => void
  handleDelete: () => void
  handleSave: () => void
  handleSaveAndNext: () => void
  handleSaveComplete: () => void
  handleAdd: () => void
  handleOpenMoveModal: () => void
  handleMoveGroup: (targetGroup: string) => void
  handleExcelDownload: () => Promise<void>
  handlePrint: () => Promise<void>
  handleSendNotification: (count: number, onSuccess?: () => void) => Promise<void>
  isDownloading: boolean
  isPrinting: boolean
}

export function useHandlers<T = any>({
  data,
  checkedIds,
  onCreate,
  onDeleteSuccess,
  onSave,
  onSaveComplete,
  onAdd,
  onNextStep,
  navigateOnComplete,
  saveMessage = "저장되었습니다",
  saveAndNextMessage = "내용이 저장되었습니다. 다음단계로 이동합니다",
  completeMessage = "저장이 완료되었습니다",
  notificationMessage = "교육알림이 전송되었습니다",
  onOpenMoveModal,
  onMoveSuccess,
  groupKey = "group",
  createTemplate,
  excelFileNamePrefix,
}: ButtonHandlersParams<T>): ButtonHandlers {
  const { setLoading } = useLoadingStore()
  const navigate = useNavigate()

  const { handleExcelDownload, handlePrint, isDownloading, isPrinting } = useDocumentExport({
    data,
    checkedIds,
    createTemplate: createTemplate || (() => ({}) as DocumentTemplate),
    excelFileNamePrefix,
  })

  const handleCreate = (): void => {
    onCreate?.()
  }

  const handleDelete = async (): Promise<void> => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onDeleteSuccess?.(checkedIds)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!window.confirm("저장하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave?.()
      alert(saveMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndNext = async (): Promise<void> => {
    if (!window.confirm("저장 후 다음 단계로 이동하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave?.()
      alert(saveAndNextMessage)
      onNextStep?.()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveComplete = async (): Promise<void> => {
    if (onSaveComplete) {
      setLoading(true)
      try {
        onSaveComplete()
      } finally {
        setLoading(false)
      }
      return
    }
    if (!window.confirm("작성한 평가내용을 저장하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave?.()
      alert(completeMessage)
      if (navigateOnComplete) {
        setTimeout(() => navigate(navigateOnComplete), 500)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = (): void => {
    onAdd?.()
  }

  const handleOpenMoveModal = (): void => {
    if (checkedIds.length === 0) {
      alert("이동할 항목을 선택하세요")
      return
    }
    onOpenMoveModal?.()
  }

  const handleMoveGroup = (targetGroup: string): void => {
    const selectedItems = data.filter((item: any) => checkedIds.includes(item.id))
    const allInTargetGroup = selectedItems.every((item: any) => item[groupKey] === targetGroup)

    if (allInTargetGroup) {
      alert("변경할 사항이 존재하지 않습니다")
      return
    }

    if (!window.confirm(`${checkedIds.length}명을 ${targetGroup}(으)로 이동하시겠습니까?`)) return

    onMoveSuccess?.(targetGroup)
  }

  const handleSendNotification = async (count: number, onSuccess?: () => void): Promise<void> => {
    if (count === 0) {
      alert("알림을 전송할 대상이 없습니다")
      return
    }
    if (!window.confirm(`${count}명에게 교육알림을 전송하시겠습니까?`)) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      alert(notificationMessage)
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return {
    handleCreate,
    handleDelete,
    handleSave,
    handleSaveAndNext,
    handleSaveComplete,
    handleAdd,
    handleOpenMoveModal,
    handleMoveGroup,
    handleExcelDownload,
    handlePrint,
    handleSendNotification,
    isDownloading,
    isPrinting,
  }
}

const DEFAULT_SAMPLE_FILE = "/downloads/MSDS_2200J_Kor.pdf"

type FileFieldKeys = "fileAttach" | "file" | "attachment" | "attachments" | "msds" | "planFile" | "etcFile" | "evaluationFile" | "attachmentFile" | "proof" | "certificate"

interface UseFileDownloadOptions {
  sampleFilePath?: string
}

export function useDownload(options?: UseFileDownloadOptions) {
  const { setLoading } = useLoadingStore()
  const sampleFile = options?.sampleFilePath || DEFAULT_SAMPLE_FILE

  const hasFileData = (row: Record<string, any>, preferredKey?: string): boolean => {
    const fileKeys: FileFieldKeys[] = ["fileAttach", "file", "attachment", "attachments", "msds", "planFile", "etcFile", "evaluationFile", "attachmentFile", "proof", "certificate"]
    const extraKeys = ["eduMaterial", "attachmentFiles", "files", "education_data"]
    const keys = preferredKey ? [preferredKey] : [...fileKeys, ...extraKeys]

    for (const key of keys) {
      const value = row[key]
      if (Array.isArray(value)) {
        if (value.length > 0) return true
        continue
      }
      if (value && value !== false) {
        return true
      }
    }
    return false
  }

  const extractFiles = (value: any): Array<{ url: string; name?: string }> => {
    if (!value) return []
    if (typeof value === "string") return [{ url: value }]
    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === "string") return { url: item }
          if (item?.url) return { url: item.url, name: item.name }
          return null
        })
        .filter(Boolean) as Array<{ url: string; name?: string }>
    }
    if (value?.url) return [{ url: value.url, name: value.name }]
    return []
  }

  const downloadFile = async (row: Record<string, any>, preferredKey?: string): Promise<void> => {
    if (!hasFileData(row, preferredKey)) {
      return
    }

    setLoading(true)
    try {
      const fileKeys: FileFieldKeys[] = ["fileAttach", "file", "attachment", "attachments", "msds", "planFile", "etcFile", "evaluationFile", "attachmentFile", "proof", "certificate"]
      const extraKeys = ["eduMaterial", "attachmentFiles", "files", "education_data"]
      const keys = preferredKey ? [preferredKey] : [...fileKeys, ...extraKeys]
      const targetKey = preferredKey || keys.find(key => extractFiles(row[key]).length > 0)
      const files = targetKey ? extractFiles(row[targetKey]) : []
      const downloadTargets = files.length > 0 ? files : sampleFile ? [{ url: sampleFile }] : []
      if (downloadTargets.length === 0) return

      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const zipName = downloadTargets.length > 1 ? `${targetKey || "files"}_${today}.zip` : undefined
      await downloadFiles(downloadTargets, zipName ? { zipName } : undefined)
    } catch (error) {
      console.error("내려받기 실패:", error)
      alert("파일 내려받기에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const downloadMultiple = async (rows: Record<string, any>[]): Promise<void> => {
    const rowsWithFiles = rows.filter(row => hasFileData(row))
    if (rowsWithFiles.length === 0) {
      alert("내려받을 파일이 없습니다")
      return
    }

    setLoading(true)
    try {
      for (const row of rowsWithFiles) {
        await downloadFile(row)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    downloadFile,
    downloadMultiple,
    hasFileData,
  }
}

export interface GroupHandlersParams {
  groups: AttendeeGroup[]
  attendees: DataRow[]
  groupKey?: string
  onGroupSave?: (groupName: string) => void
  onGroupDelete?: (groupId: number) => void
}

export interface GroupHandlers {
  getGroupMemberCount: (groupName: string) => number
  handleGroupSave: (groupName: string) => boolean
  handleGroupDelete: (group: AttendeeGroup) => void
  validateGroupName: (groupName: string) => boolean
}

export function useGroupHandlers({ groups, attendees, groupKey = "group", onGroupSave, onGroupDelete }: GroupHandlersParams): GroupHandlers {
  const getGroupMemberCount = (groupName: string): number => {
    return attendees.filter(a => a[groupKey] === groupName).length
  }

  const validateGroupName = (groupName: string): boolean => {
    if (!groupName.trim()) return false
    if (groups.some(g => g.name === groupName)) return false
    return true
  }

  const handleGroupSave = (groupName: string): boolean => {
    if (!validateGroupName(groupName)) return false
    onGroupSave?.(groupName)
    return true
  }

  const handleGroupDelete = (group: AttendeeGroup): void => {
    const memberCount = getGroupMemberCount(group.name)
    const message = memberCount > 0 ? `삭제 시 소속된 ${memberCount}명의 정보도 함께 사라집니다. 삭제하시겠습니까?` : `"${group.name}"을(를) 삭제하시겠습니까?`

    if (window.confirm(message)) {
      onGroupDelete?.(group.id)
    }
  }

  return {
    getGroupMemberCount,
    handleGroupSave,
    handleGroupDelete,
    validateGroupName,
  }
}

export interface BudgetHandlersParams<TInsp, TBudget> {
  inspItems: TInsp[]
  budgetItems: TBudget[]
  setInspItems: React.Dispatch<React.SetStateAction<TInsp[]>>
  setBudgetItems: React.Dispatch<React.SetStateAction<TBudget[]>>
  inspCheckedIds: (number | string)[]
  budgetCheckedIds: (number | string)[]
  selectedYear: string
  budgetYear: string
  activeQuarter: number
}

export interface BudgetHandlers<TInsp, TBudget> {
  handleInspAdd: () => void
  handleBudgetAdd: () => void
  handleInspChange: (id: number | string, field: keyof Omit<TInsp, "id">, value: string | boolean) => void
  handleBudgetChange: (id: number | string, field: keyof Omit<TBudget, "id" | "year">, value: string | boolean | File) => void
  handleInspDelete: () => Promise<void>
  handleBudgetDelete: () => Promise<void>
  isQuarterEnabled: (quarter: number) => boolean
  formatCurrency: (num: number) => string
}

export function useBudgetHandlers<
  TInsp extends { id: number; year?: string },
  TBudget extends { id: number; year: string; quarter: number; budget: string; spent: string; remaining: string; carryOver: boolean },
>({
  inspItems,
  budgetItems,
  setInspItems,
  setBudgetItems,
  inspCheckedIds,
  budgetCheckedIds,
  selectedYear,
  budgetYear,
  activeQuarter,
}: BudgetHandlersParams<TInsp, TBudget>): BudgetHandlers<TInsp, TBudget> {
  const { setLoading } = useLoadingStore()
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = new Date().getMonth() + 1
  const currentQuarter = Math.ceil(currentMonth / 3)

  const handleInspAdd = () => {
    const nextId = -Date.now()
    setInspItems(prev => [
      ...prev,
      {
        id: nextId,
        year: selectedYear,
        detailPlan: "",
        q1: false,
        q2: false,
        q3: false,
        q4: false,
        KPI: "",
        department: "",
        achievementRate: "",
        resultRemark: "",
        entryDate: new Date().toISOString().slice(0, 10),
      } as unknown as TInsp,
    ])
  }

  const handleBudgetAdd = () => {
    const nextId = -Date.now()
    setBudgetItems(prev => [
      ...prev,
      {
        id: nextId,
        year: budgetYear,
        quarter: activeQuarter,
        itemName: "",
        category: "",
        budget: "0",
        spent: "0",
        remaining: "0",
        carryOver: false,
        attachment: null,
        author: "",
        entryDate: new Date().toISOString().slice(0, 10),
      } as unknown as TBudget,
    ])
  }

  const handleInspChange = (id: number | string, field: keyof Omit<TInsp, "id">, value: string | boolean) => {
    setInspItems(items => items.map(item => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleBudgetChange = (id: number | string, field: keyof Omit<TBudget, "id" | "year">, value: string | boolean | File) => {
    setBudgetItems(items =>
      items.map(item => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === "budget" || field === "spent") {
          const b = parseInt(next.budget.replace(/[^0-9]/g, ""), 10) || 0
          const s = parseInt(next.spent.replace(/[^0-9]/g, ""), 10) || 0
          next.remaining = Math.max(0, b - s).toString()
          if (next.remaining === "0") next.carryOver = false
        }
        return next
      })
    )
  }

  const handleInspDelete = async (): Promise<void> => {
    if (inspCheckedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setInspItems(prev => prev.filter(item => !inspCheckedIds.includes(item.id)))
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetDelete = async (): Promise<void> => {
    if (budgetCheckedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setBudgetItems(prev => prev.filter(item => !budgetCheckedIds.includes(item.id)))
    } finally {
      setLoading(false)
    }
  }

  const isQuarterEnabled = (quarter: number): boolean => {
    const selectedYearNum = parseInt(budgetYear, 10)
    const currentYearNum = parseInt(currentYear, 10)

    if (selectedYearNum > currentYearNum) return false
    if (selectedYearNum === currentYearNum) return quarter <= currentQuarter
    if (selectedYearNum === 2025) return true

    return budgetItems.some(item => item.year === budgetYear && item.quarter === quarter)
  }

  const formatCurrency = (num: number) => num.toLocaleString() + "원"

  return {
    handleInspAdd,
    handleBudgetAdd,
    handleInspChange,
    handleBudgetChange,
    handleInspDelete,
    handleBudgetDelete,
    isQuarterEnabled,
    formatCurrency,
  }
}

export default useHandlers

export interface QRSelectionState<T = any> {
  isOpen: boolean
  items: T[]
  selectedId: number | string | null
  qrType: "tbm" | "education" | null
}

export interface UseQRSelectionHandlersParams<T = any> {
  data: T[]
  checkedIds: (number | string)[]
  onOpenQRModal: (id: number | string, type: "tbm" | "education") => void
}

export interface QRSelectionHandlers<T = any> {
  qrSelection: QRSelectionState<T>
  handleOpenQRSelection: (type: "tbm" | "education") => void
  handleSelectQRItem: (id: number | string) => void
  handleConfirmQRSelection: () => void
  handleCloseQRSelection: () => void
}

export function useQRSelectionHandlers<T extends { id: number | string }>({ data, checkedIds, onOpenQRModal }: UseQRSelectionHandlersParams<T>): QRSelectionHandlers<T> {
  const [qrSelection, setQRSelection] = useState<QRSelectionState<T>>({
    isOpen: false,
    items: [],
    selectedId: null,
    qrType: null,
  })

  const handleOpenQRSelection = (type: "tbm" | "education") => {
    if (checkedIds.length === 0) {
      alert("QR 항목을 선택하세요")
      return
    }
    if (checkedIds.length > 1) {
      alert("QR 생성은 하나의 항목만 선택해주세요")
      return
    }
    const selectedItem = data.find(item => checkedIds.includes(item.id))
    if (selectedItem) {
      onOpenQRModal(selectedItem.id, type)
    }
  }

  /**
   * QR 항목 선택 처리
   * @param id - 선택/해제할 항목의 ID
   */
  const handleSelectQRItem = (id: number | string) => {
    setQRSelection(prev => ({
      ...prev,
      selectedId: prev.selectedId === id ? null : id,
    }))
  }

  /**
   * QR 선택 확인 및 모달 열기
   */
  const handleConfirmQRSelection = () => {
    if (!qrSelection.selectedId) {
      alert("항목을 선택해주세요")
      return
    }
    if (!qrSelection.qrType) {
      alert("QR 타입이 설정되지 않았습니다")
      return
    }

    onOpenQRModal(qrSelection.selectedId, qrSelection.qrType)
    handleCloseQRSelection()
  }

  /**
   * QR 선택 모달 닫기 및 상태 초기화
   */
  const handleCloseQRSelection = () => {
    setQRSelection({
      isOpen: false,
      items: [],
      selectedId: null,
      qrType: null,
    })
  }

  return {
    qrSelection,
    handleOpenQRSelection,
    handleSelectQRItem,
    handleConfirmQRSelection,
    handleCloseQRSelection,
  }
}

export interface InspectionPlanFormData {
  location: string
  field: string
  kind: string
  scheduleStart: string
  scheduleEnd: string
  templateId: number | string | null
  templateName: string
  inspectorName: string
  inspectorPhone: string
  repeatType: "daily" | "weekly" | "monthly" | null
  weeklyDays: string[]
  monthlyDates: number[]
}

export interface UseInspectionPlanHandlersParams {
  formData: InspectionPlanFormData
  setFormData: React.Dispatch<React.SetStateAction<InspectionPlanFormData>>
  validateForm: (values: Record<string, any>) => boolean
  onSave?: (data: InspectionPlanFormData) => void
  onClose: () => void
}

export function useInspectionPlanHandlers({ formData, setFormData, validateForm, onSave, onClose }: UseInspectionPlanHandlersParams) {
  const handleChange = (field: keyof InspectionPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({ ...prev, inspectorPhone: formatted }))
  }

  const handleStartDateChange = (date: string) => {
    setFormData(prev => {
      if (prev.scheduleEnd && date > prev.scheduleEnd) {
        return { ...prev, scheduleStart: date, scheduleEnd: date }
      }
      return { ...prev, scheduleStart: date }
    })
  }

  const handleEndDateChange = (date: string) => {
    setFormData(prev => {
      if (prev.scheduleStart && date < prev.scheduleStart) {
        return { ...prev, scheduleStart: date, scheduleEnd: date }
      }
      return { ...prev, scheduleEnd: date }
    })
  }

  const handleRepeatTypeChange = (type: "daily" | "weekly" | "monthly") => {
    setFormData(prev => ({
      ...prev,
      repeatType: prev.repeatType === type ? null : type,
      weeklyDays: type === "weekly" ? prev.weeklyDays : [],
      monthlyDates: type === "monthly" ? prev.monthlyDates : [],
    }))
  }

  const handleWeeklyDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      weeklyDays: prev.weeklyDays.includes(day) ? prev.weeklyDays.filter(d => d !== day) : [...prev.weeklyDays, day],
    }))
  }

  const handleAddMonthlyDate = (dateNum: number, onError: (msg: string) => void, onSuccess: () => void) => {
    if (isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
      onError("1~31 사이의 숫자를 입력하세요")
      return
    }
    if (formData.monthlyDates.includes(dateNum)) {
      onError("이미 추가된 날짜입니다")
      return
    }
    setFormData(prev => ({
      ...prev,
      monthlyDates: [...prev.monthlyDates, dateNum].sort((a, b) => a - b),
    }))
    onSuccess()
  }

  const handleRemoveMonthlyDate = (date: number) => {
    setFormData(prev => ({
      ...prev,
      monthlyDates: prev.monthlyDates.filter(d => d !== date),
    }))
  }

  const handleSelectTemplate = (item: { id: number | string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      templateId: item.id,
      templateName: item.name,
    }))
  }

  const handleSave = () => {
    const formValues = {
      location: formData.location,
      field: formData.field,
      kind: formData.kind,
      scheduleStart: formData.scheduleStart,
      scheduleEnd: formData.scheduleEnd,
      templateName: formData.templateName,
    }
    if (!validateForm(formValues)) return
    onSave?.(formData)
    onClose()
  }

  return {
    handleChange,
    handlePhoneChange,
    handleStartDateChange,
    handleEndDateChange,
    handleRepeatTypeChange,
    handleWeeklyDayToggle,
    handleAddMonthlyDate,
    handleRemoveMonthlyDate,
    handleSelectTemplate,
    handleSave,
  }
}

export interface InspectionCheckItem {
  id: number
  category?: string
  content: string
  status: "양호" | "불량" | ""
  note: string
  photos: string[]
}

export interface InspectionLogResultData {
  id?: number | string
  template?: string
  workplace?: string
  field?: string
  kind?: string
  inspector?: string
  inspectedAt?: string
  confirmed?: boolean
  notes?: string
  signature?: string
}

export interface UseInspectionLogHandlersParams {
  items: InspectionCheckItem[]
  setItems: React.Dispatch<React.SetStateAction<InspectionCheckItem[]>>
  signature: string | null
  setSignature: React.Dispatch<React.SetStateAction<string | null>>
  setIsSignaturePadOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPhotoViewerOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPhotoViewerImages: React.Dispatch<React.SetStateAction<string[]>>
  setPhotoViewerIndex: React.Dispatch<React.SetStateAction<number>>
  printRef?: React.RefObject<HTMLDivElement>
  data: InspectionLogResultData | null
  onSubmitSuccess?: (signature: string) => void
  onClose: () => void
}

export function useInspectionLogHandlers({
  items,
  setItems,
  signature,
  setSignature,
  setIsSignaturePadOpen,
  setPhotoViewerOpen,
  setPhotoViewerImages,
  setPhotoViewerIndex,
  data,
  onSubmitSuccess,
  onClose,
}: UseInspectionLogHandlersParams) {
  const { setLoading } = useLoadingStore()

  const handleStatusChange = (itemId: number, status: "양호" | "불량") => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, status: item.status === status ? "" : status } : item)))
  }

  const handleNoteChange = (itemId: number, note: string) => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, note } : item)))
  }

  const handleSubmit = async () => {
    const hasEmptyStatus = items.some(item => !item.status)
    if (hasEmptyStatus) {
      alert("모든 점검항목의 상태를 선택해주세요")
      return
    }
    if (!signature) {
      alert("점검자 서명을 입력하세요")
      return
    }
    if (!window.confirm("제출하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      alert("제출이 완료되었습니다")
      onSubmitSuccess?.(signature)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSignatureSave = (dataUrl: string) => {
    setSignature(dataUrl)
    setIsSignaturePadOpen(false)
  }

  const handlePhotoUpload = (itemId: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setItems(prev => prev.map(item => (item.id === itemId ? { ...item, photos: [...item.photos, dataUrl] } : item)))
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = (itemId: number, photoIndex: number) => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, photos: item.photos.filter((_, i) => i !== photoIndex) } : item)))
  }

  const handleViewPhotos = (photos: string[]) => {
    if (photos.length === 0) return
    setPhotoViewerImages(photos)
    setPhotoViewerIndex(0)
    setPhotoViewerOpen(true)
  }

  return {
    handleStatusChange,
    handleNoteChange,
    handleSubmit,
    handleSignatureSave,
    handlePhotoUpload,
    handleRemovePhoto,
    handleViewPhotos,
  }
}

export interface UseInspectionRoutineHandlersParams {
  formData: { [day: string]: { [itemId: string]: "O" | "X" | "" } }
  setFormData: React.Dispatch<React.SetStateAction<{ [day: string]: { [itemId: string]: "O" | "X" | "" } }>>
  checkDates: { [day: string]: string }
  mode: "view" | "edit"
  days: string[]
  listPrintRef: React.RefObject<HTMLDivElement>
  setSelectedListItem: React.Dispatch<React.SetStateAction<any>>
  mockData: any[]
  onRegisterClose: () => void
}

export function useInspectionRoutineHandlers({ formData, setFormData, checkDates, mode, days, listPrintRef, setSelectedListItem, mockData, onRegisterClose }: UseInspectionRoutineHandlersParams) {
  const handleItemClick = (itemId: string, day: string, value: "O" | "X") => {
    if (mode === "view") return
    setFormData(prev => {
      const dayData = prev[day] || {}
      const currentValue = dayData[itemId]
      const newValue = currentValue === value ? "" : value
      return { ...prev, [day]: { ...dayData, [itemId]: newValue } }
    })
  }

  const getItemValue = (day: string, itemId: string): "O" | "X" | "" => {
    return formData[day]?.[itemId] || ""
  }

  const handleSave = () => {
    const missingDays = days.filter(day => !checkDates[day] || checkDates[day].trim() === "")
    if (missingDays.length > 0) {
      alert("점검일은 필수값입니다")
      return
    }
    alert("저장이 완료되었습니다")
    onRegisterClose()
  }

  const handlePrintFromList = async (id: string | number | (string | number)[] | null) => {
    if (id === null || Array.isArray(id)) return
    const item = mockData.find(i => i.id === id)
    if (!item) return
    setSelectedListItem(item)
    setTimeout(async () => {
      if (listPrintRef.current) {
        const { documentActions } = await import("@/docExport")
        await documentActions.printHtml(listPrintRef.current, { filename: `안전순회_점검일지_${item.inspectionDate}` })
      }
    }, 100)
  }

  return {
    handleItemClick,
    getItemValue,
    handleSave,
    handlePrintFromList,
  }
}

export interface ChecklistItemRow {
  id: number
  content: string
  isEditing?: boolean
  draft?: string
}

export interface ChecklistRow {
  id: number | string
  template: string
  items: string[]
  createdAt: string
}

export interface UseInspectionChecklistHandlersParams {
  data: ChecklistRow[]
  setData: React.Dispatch<React.SetStateAction<ChecklistRow[]>>
  editingData: { templateName: string; items: ChecklistItemRow[] }
  setEditingData: React.Dispatch<React.SetStateAction<{ templateName: string; items: ChecklistItemRow[] }>>
  editSelectedIds: (number | string)[]
  setEditSelectedIds: React.Dispatch<React.SetStateAction<(number | string)[]>>
  nextIdRef: React.MutableRefObject<number>
  validateForm: (values: Record<string, any>) => boolean
  clearErrors: () => void
  setViewingChecklist: React.Dispatch<React.SetStateAction<ChecklistRow | null>>
  setViewModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setIsTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTemplateSearch: React.Dispatch<React.SetStateAction<string>>
  setPreviewTemplateId: React.Dispatch<React.SetStateAction<number | null>>
  checklistTemplateMockData: any[]
}

export function useInspectionChecklistHandlers({
  data,
  setData,
  editingData,
  setEditingData,
  editSelectedIds,
  setEditSelectedIds,
  nextIdRef,
  validateForm,
  clearErrors,
  setViewingChecklist,
  setViewModalOpen,
  setIsTemplateModalOpen,
  setTemplateSearch,
  setPreviewTemplateId,
  checklistTemplateMockData,
}: UseInspectionChecklistHandlersParams) {
  const { setLoading } = useLoadingStore()

  const handleViewChecklist = (checklist: ChecklistRow) => {
    setViewingChecklist(checklist)
    setViewModalOpen(true)
  }

  const handleDeleteSelected = () => {
    setEditingData(prev => ({ ...prev, items: prev.items.filter(i => !editSelectedIds.includes(i.id)) }))
    setEditSelectedIds([])
  }

  const handleAddItem = () => {
    const newId = nextIdRef.current++
    setEditingData(prev => ({ ...prev, items: [...prev.items, { id: newId, content: "", isEditing: true, draft: "" }] }))
  }

  const handleItemCheck = (id: number) => {
    setEditSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  const handleItemContentChange = (id: number, value: string) => {
    setEditingData(prev => ({ ...prev, items: prev.items.map(i => (i.id === id ? { ...i, draft: value } : i)) }))
  }

  const handleItemConfirm = (id: number) => {
    setEditingData(prev => ({
      ...prev,
      items: prev.items.map(i => (i.id === id ? { ...i, content: i.draft ?? i.content, isEditing: false, draft: undefined } : i)),
    }))
  }

  const handleItemEdit = (id: number) => {
    setEditingData(prev => ({ ...prev, items: prev.items.map(i => (i.id === id ? { ...i, isEditing: true, draft: i.content } : i)) }))
  }

  const handleSelectTemplate = (templateId: number) => {
    const template = checklistTemplateMockData.find((t: any) => t.id === templateId)
    if (template) {
      setEditingData(prev => ({
        ...prev,
        items: template.items.map((item: string, idx: number) => ({ id: idx + 1, content: item })),
      }))
    }
    setIsTemplateModalOpen(false)
    setTemplateSearch("")
    setPreviewTemplateId(null)
  }

  const handleSave = async (): Promise<void> => {
    const formValues = { templateName: editingData.templateName }
    if (!validateForm(formValues)) return
    if (editingData.items.length === 0) {
      alert("점검항목을 1개 이상 추가하세요")
      return
    }
    if (!window.confirm("저장하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newId = Date.now()
      const today = new Date().toISOString().split("T")[0]
      setData(prev => [
        {
          id: newId,
          template: editingData.templateName,
          items: editingData.items.map(i => i.content),
          createdAt: today,
        },
        ...prev,
      ])
      setEditingData({ templateName: "", items: [] })
      clearErrors()
      alert("저장이 완료되었습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChecklistById = async (id: number | string): Promise<void> => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setData(prev => prev.filter(r => r.id !== id))
    } finally {
      setLoading(false)
    }
  }

  return {
    handleViewChecklist,
    handleDeleteSelected,
    handleAddItem,
    handleItemCheck,
    handleItemContentChange,
    handleItemConfirm,
    handleItemEdit,
    handleSelectTemplate,
    handleSave,
    handleDeleteChecklistById,
  }
}
