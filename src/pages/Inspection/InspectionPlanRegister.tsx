import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import CustomSelect from "@/components/common/base/CustomSelect"
import { X, Plus, Search } from "lucide-react"
import { inspectionFieldOptions, inspectionKindOptions } from "@/components/common/base/FilterBar"
import { inspectionChecklistMockData } from "@/data/mockData"
import useForm, { ValidationRules } from "@/hooks/useForm"
import LoadSearchDialog, { SearchItem } from "@/components/dialog/LoadSearchDialog"
import { useInspectionPlanHandlers, InspectionPlanFormData } from "@/hooks/useHandlers"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

interface InspectionPlanRegisterProps {
  open: boolean
  onClose: () => void
  onSave?: (data: InspectionPlanFormData) => void
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const INPUT_CLASS =
  "w-full h-10 border rounded-lg px-2 py-2 text-xs md:text-base focus:outline-none focus:border-[var(--primary)] transition-colors bg-white placeholder:text-xs md:placeholder:text-base placeholder:text-gray-500"
const INPUT_ERROR_CLASS = "border-red-500"
const INPUT_NORMAL_CLASS = "border-[var(--border)]"
const LABEL_CLASS = "block text-xs md:text-base font-medium text-gray-700 mb-1"
const REQUIRED_MARK = <span className="text-red-500 ml-0.5">*</span>

const initialFormData: InspectionPlanFormData = {
  location: "",
  field: "",
  kind: "",
  scheduleStart: "",
  scheduleEnd: "",
  templateId: null,
  templateName: "",
  inspectorName: "",
  inspectorPhone: "",
  repeatType: null,
  weeklyDays: [],
  monthlyDates: [],
}

export default function InspectionPlanRegister({ open, onClose, onSave }: InspectionPlanRegisterProps) {
  const [formData, setFormData] = useState<InspectionPlanFormData>(initialFormData)
  const [isTemplateSearchOpen, setIsTemplateSearchOpen] = useState(false)
  const [newMonthlyDate, setNewMonthlyDate] = useState("")
  const [monthlyDateError, setMonthlyDateError] = useState("")

  const templateItems: SearchItem[] = useMemo(() => {
    return inspectionChecklistMockData.map((item: any) => ({
      id: item.id,
      name: item.template,
    }))
  }, [])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      location: { required: true },
      field: { required: true },
      kind: { required: true },
      scheduleStart: { required: true },
      scheduleEnd: { required: true },
      templateName: { required: true },
    }),
    []
  )

  const formValues = useMemo(
    () => ({
      location: formData.location,
      field: formData.field,
      kind: formData.kind,
      scheduleStart: formData.scheduleStart,
      scheduleEnd: formData.scheduleEnd,
      templateName: formData.templateName,
    }),
    [formData]
  )

  const { validateForm, isFieldInvalid, getFieldError, clearErrors } = useForm(validationRules, formValues)

  const {
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
  } = useInspectionPlanHandlers({
    formData,
    setFormData,
    validateForm,
    onSave,
    onClose,
  })

  useEffect(() => {
    if (open) {
      setFormData(initialFormData)
      setNewMonthlyDate("")
      setMonthlyDateError("")
      clearErrors()
    }
  }, [open, clearErrors])

  const onAddMonthlyDate = () => {
    const dateNum = parseInt(newMonthlyDate)
    handleAddMonthlyDate(
      dateNum,
      msg => setMonthlyDateError(msg),
      () => {
        setMonthlyDateError("")
        setNewMonthlyDate("")
      }
    )
  }

  const getInputClass = (fieldName: string) => {
    return `${INPUT_CLASS} ${isFieldInvalid(fieldName) ? INPUT_ERROR_CLASS : INPUT_NORMAL_CLASS}`
  }

  if (!open) return null

  return (
    <>
      <div className={DIALOG_STYLES.overlay}>
        <div className={DIALOG_STYLES.containerMd}>
          <div className={DIALOG_STYLES.header}>
            <h2 className={DIALOG_STYLES.title}>점검일정 등록</h2>
            <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className={DIALOG_STYLES.contentWithSpace}>
            <div>
              <label className={LABEL_CLASS}>장소 {REQUIRED_MARK}</label>
              <input type="text" value={formData.location} onChange={e => handleChange("location", e.target.value)} placeholder="점검장소 입력" className={getInputClass("location")} />
              {isFieldInvalid("location") && <p className="text-red-500 text-xs mt-1">{getFieldError("location")}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>점검분야 {REQUIRED_MARK}</label>
                <CustomSelect value={formData.field} onChange={v => handleChange("field", v)} options={inspectionFieldOptions} className={isFieldInvalid("field") ? "border-red-500" : ""} />
                {isFieldInvalid("field") && <p className="text-red-500 text-xs mt-1">{getFieldError("field")}</p>}
              </div>
              <div>
                <label className={LABEL_CLASS}>점검종류 {REQUIRED_MARK}</label>
                <CustomSelect value={formData.kind} onChange={v => handleChange("kind", v)} options={inspectionKindOptions} className={isFieldInvalid("kind") ? "border-red-500" : ""} />
                {isFieldInvalid("kind") && <p className="text-red-500 text-xs mt-1">{getFieldError("kind")}</p>}
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>점검일정 {REQUIRED_MARK}</label>
              <div className="flex items-center gap-2">
                <input type="date" value={formData.scheduleStart} onChange={e => handleStartDateChange(e.target.value)} className={`${getInputClass("scheduleStart")} flex-1`} />
                <span className="text-xs md:text-base text-gray-500">~</span>
                <input type="date" value={formData.scheduleEnd} onChange={e => handleEndDateChange(e.target.value)} className={`${getInputClass("scheduleEnd")} flex-1`} />
              </div>
              {(isFieldInvalid("scheduleStart") || isFieldInvalid("scheduleEnd")) && <p className="text-red-500 text-xs mt-1">{getFieldError("scheduleStart") || getFieldError("scheduleEnd")}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>점검표(체크리스트) {REQUIRED_MARK}</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.templateName}
                  readOnly
                  placeholder="점검표를 검색하여 선택하세요"
                  className={`${getInputClass("templateName")} pr-10 cursor-pointer bg-gray-50`}
                  onClick={() => setIsTemplateSearchOpen(true)}
                />
                <button onClick={() => setIsTemplateSearchOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition">
                  <Search size={16} className="md:w-[18px] md:h-[18px] text-gray-500" />
                </button>
              </div>
              {isFieldInvalid("templateName") && <p className="text-red-500 text-xs mt-1">{getFieldError("templateName")}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>점검자</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.inspectorName}
                  onChange={e => handleChange("inspectorName", e.target.value)}
                  placeholder="점검자명"
                  className={`${INPUT_CLASS} ${INPUT_NORMAL_CLASS}`}
                />
                <input
                  type="tel"
                  value={formData.inspectorPhone}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  inputMode="numeric"
                  className={`${INPUT_CLASS} ${INPUT_NORMAL_CLASS}`}
                />
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-3 md:p-4 bg-gray-50">
              <p className="text-xs md:text-sm text-gray-500 mb-3">반복 점검을 설정하려면 주기를 선택하세요</p>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="radio" name="repeatType" checked={formData.repeatType === "daily"} onChange={() => handleRepeatTypeChange("daily")} className="w-4 h-4 text-[var(--primary)]" />
                  <span className={LABEL_CLASS} style={{ marginBottom: 0 }}>
                    매일
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="radio" name="repeatType" checked={formData.repeatType === "weekly"} onChange={() => handleRepeatTypeChange("weekly")} className="w-4 h-4 text-[var(--primary)]" />
                  <span className={LABEL_CLASS} style={{ marginBottom: 0 }}>
                    주간 점검요일 지정
                  </span>
                </label>
                {formData.repeatType === "weekly" && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2 ml-6">
                    {DAYS.map(day => (
                      <label
                        key={day}
                        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 border rounded-lg cursor-pointer transition-all ${
                          formData.weeklyDays.includes(day) ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white text-gray-700 border-[var(--border)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <input type="checkbox" checked={formData.weeklyDays.includes(day)} onChange={() => handleWeeklyDayToggle(day)} className="hidden" />
                        <span className="text-xs md:text-sm font-medium">{day}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="radio" name="repeatType" checked={formData.repeatType === "monthly"} onChange={() => handleRepeatTypeChange("monthly")} className="w-4 h-4 text-[var(--primary)]" />
                  <span className={LABEL_CLASS} style={{ marginBottom: 0 }}>
                    월별 점검일자 지정
                  </span>
                </label>
                {formData.repeatType === "monthly" && (
                  <div className="ml-6">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={newMonthlyDate}
                        onChange={e => {
                          setNewMonthlyDate(e.target.value)
                          setMonthlyDateError("")
                        }}
                        placeholder="일자 (1~31)"
                        className={`${INPUT_CLASS} ${monthlyDateError ? INPUT_ERROR_CLASS : INPUT_NORMAL_CLASS} w-28 md:w-32`}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            onAddMonthlyDate()
                          }
                        }}
                      />
                      <Button variant="action" onClick={onAddMonthlyDate} className="flex items-center gap-1 text-xs md:text-sm">
                        <Plus size={14} className="md:w-4 md:h-4" />
                        추가
                      </Button>
                    </div>
                    {monthlyDateError && <p className="text-xs md:text-sm text-red-500 mb-2">{monthlyDateError}</p>}
                    {formData.monthlyDates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {formData.monthlyDates.map(date => (
                          <span key={date} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm">
                            매월 {date}일
                            <button onClick={() => handleRemoveMonthlyDate(date)} className="p-0.5 hover:bg-gray-200 rounded">
                              <X size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={DIALOG_STYLES.footer}>
            <Button variant="primaryOutline" onClick={onClose}>
              닫기
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장하기
            </Button>
          </div>
        </div>
      </div>

      <LoadSearchDialog
        isOpen={isTemplateSearchOpen}
        title="점검표 검색"
        items={templateItems}
        onSelect={handleSelectTemplate}
        onClose={() => setIsTemplateSearchOpen(false)}
        placeholder="검색"
        emptyMessage="검색결과가 없습니다."
      />
    </>
  )
}
