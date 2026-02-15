import React, { useCallback, useState, useMemo } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import ToggleSwitch from "@/components/common/base/ToggleSwitch"
import RadioGroup from "@/components/common/base/RadioGroup"
import ChemicalAutocomplete from "@/components/common/inputs/ChemicalAutocomplete"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { CORROSIVENESS_OPTIONS, ALARM_TIME_OPTIONS, labelToCorrosiveness, labelToAlarmTime, labelToInspectionInterval } from "@/constants/options/assetManagement"
import { registHazard } from "@/api/05_AssetManagement/hazard.api"
import { useLoadingStore } from "@/stores/loadingStore"

const USE_MOCK_DATA = false

type FormDataState = {
  chemicalName: string
  casNo: string
  exposureLimitValue: string
  exposureLimitUnit: string
  exposureLimitUnitCustom: string
  dailyUsageValue: string
  dailyUsageUnit: string
  dailyUsageUnitCustom: string
  storageAmountValue: string
  storageAmountUnit: string
  storageAmountUnitCustom: string
  is_corrosiveness: "예" | "아니오"
  toxicity_level: string
  adverse_reaction: string
  registrationDate: string
  cycle: string
  msds: string
  note: string
  is_alarm: boolean
  alarm_time: string
  repeat: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormDataState) => void
  isEdit?: boolean
}

type Option = { value: string; label: string }

const concentrationUnits: Option[] = [
  { value: "ppb", label: "ppb" },
  { value: "ppm", label: "ppm" },
  { value: "mg/m³", label: "mg/m³" },
  { value: "µg/m³", label: "µg/m³" },
  { value: "mg/L", label: "mg/L" },
  { value: "µg/L", label: "µg/L" },
]

const usageUnits: Option[] = [
  { value: "µL", label: "µL" },
  { value: "mL", label: "mL" },
  { value: "L", label: "L" },
  { value: "cm³", label: "cm³" },
  { value: "m³", label: "m³" },
  { value: "µg", label: "µg" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
]

const storageUnits: Option[] = [
  { value: "ng", label: "ng" },
  { value: "µg", label: "µg" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "t", label: "t" },
  { value: "µL", label: "µL" },
  { value: "mL", label: "mL" },
  { value: "L", label: "L" },
  { value: "cm³", label: "cm³" },
  { value: "m³", label: "m³" },
]


export default function AssetHazardRegister({ isOpen, onClose, onSave, isEdit }: Props): React.ReactElement | null {
  const { setLoading } = useLoadingStore()
  const [formData, setFormData] = useState<FormDataState>({
    chemicalName: "",
    casNo: "",
    exposureLimitValue: "",
    exposureLimitUnit: "",
    exposureLimitUnitCustom: "",
    dailyUsageValue: "",
    dailyUsageUnit: "",
    dailyUsageUnitCustom: "",
    storageAmountValue: "",
    storageAmountUnit: "",
    storageAmountUnitCustom: "",
    is_corrosiveness: "예",
    toxicity_level: "",
    adverse_reaction: "",
    registrationDate: "",
    cycle: "",
    msds: "",
    note: "",
    is_alarm: false,
    alarm_time: "1일 전",
    repeat: false,
  })

  const validationRules = useMemo<ValidationRules>(
    () => ({
      chemicalName: { required: true },
      casNo: { required: true },
      exposureLimit_value: { required: true },
      exposureLimit_unit: { required: true },
      dailyUsage_value: { required: true },
      dailyUsage_unit: { required: true },
      storageAmount_value: { required: true },
      storageAmount_unit: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement

    if (name.endsWith("Value") && value !== "" && !/^\d*\.?\d*$/.test(value)) return

    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }))
      return
    }

    if (name === "msds") {
      setFormData(prev => ({ ...prev, msds: value }))
      return
    }

    if (name === "exposureLimit_value") {
      setFormData(prev => ({ ...prev, exposureLimitValue: value }))
      return
    }
    if (name === "dailyUsage_value") {
      setFormData(prev => ({ ...prev, dailyUsageValue: value }))
      return
    }
    if (name === "storageAmount_value") {
      setFormData(prev => ({ ...prev, storageAmountValue: value }))
      return
    }

    if (name === "exposureLimit_unit") {
      setFormData(prev => ({ ...prev, exposureLimitUnit: value, exposureLimitUnitCustom: value === "직접입력" ? "" : prev.exposureLimitUnitCustom }))
      return
    }
    if (name === "exposureLimit_unit_custom") {
      setFormData(prev => ({ ...prev, exposureLimitUnitCustom: value }))
      return
    }
    if (name === "dailyUsage_unit") {
      setFormData(prev => ({ ...prev, dailyUsageUnit: value, dailyUsageUnitCustom: value === "직접입력" ? "" : prev.dailyUsageUnitCustom }))
      return
    }
    if (name === "dailyUsage_unit_custom") {
      setFormData(prev => ({ ...prev, dailyUsageUnitCustom: value }))
      return
    }
    if (name === "storageAmount_unit") {
      setFormData(prev => ({ ...prev, storageAmountUnit: value, storageAmountUnitCustom: value === "직접입력" ? "" : prev.storageAmountUnitCustom }))
      return
    }
    if (name === "storageAmount_unit_custom") {
      setFormData(prev => ({ ...prev, storageAmountUnitCustom: value }))
      return
    }
    if (name === "cycle") {
      setFormData(prev => ({ ...prev, cycle: value, repeat: value === "상시" ? false : prev.repeat }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const valuesForForm: { [key: string]: string } = {
    chemicalName: formData.chemicalName,
    casNo: formData.casNo,
    exposureLimit_value: formData.exposureLimitValue,
    exposureLimit_unit: formData.exposureLimitUnit,
    exposureLimit_unit_custom: formData.exposureLimitUnitCustom,
    dailyUsage_value: formData.dailyUsageValue,
    dailyUsage_unit: formData.dailyUsageUnit,
    dailyUsage_unit_custom: formData.dailyUsageUnitCustom,
    storageAmount_value: formData.storageAmountValue,
    storageAmount_unit: formData.storageAmountUnit,
    storageAmount_unit_custom: formData.storageAmountUnitCustom,
    is_corrosiveness: formData.is_corrosiveness,
    toxicity_level: formData.toxicity_level,
    adverse_reaction: formData.adverse_reaction,
    registrationDate: formData.registrationDate,
    cycle: formData.cycle,
    msds: formData.msds,
    note: formData.note,
    is_alarm: formData.is_alarm ? "true" : "",
    alarm_time: formData.alarm_time,
  }

  const fields: Field[] = [
    {
      label: "화학물질명",
      name: "chemicalName",
      type: "custom",
      required: true,
      hasError: isFieldInvalid("chemicalName"),
      customRender: (
        <ChemicalAutocomplete
          id="chemicalName"
          value={formData.chemicalName}
          placeholder="화학물질명 입력 또는 선택"
          onChange={v => setFormData(prev => ({ ...prev, chemicalName: v }))}
          onSelect={opt => setFormData(prev => ({ ...prev, chemicalName: opt.label }))}
          className={`w-full ${isFieldInvalid("chemicalName") ? "[&_input]:border-red-500" : ""}`}
        />
      ),
    },
    { label: "CAS No", name: "casNo", type: "text", placeholder: "CAS No 입력", required: true, hasError: isFieldInvalid("casNo") },
    {
      label: "노출기준",
      name: "exposureLimit",
      type: "quantityUnit",
      placeholder: "0",
      options: concentrationUnits,
      required: true,
      hasError: isFieldInvalid("exposureLimit_value"),
      hasUnitError: isFieldInvalid("exposureLimit_unit"),
    },
    {
      label: "일일사용량",
      name: "dailyUsage",
      type: "quantityUnit",
      placeholder: "0",
      options: usageUnits,
      required: true,
      hasError: isFieldInvalid("dailyUsage_value"),
      hasUnitError: isFieldInvalid("dailyUsage_unit"),
    },
    {
      label: "저장량",
      name: "storageAmount",
      type: "quantityUnit",
      placeholder: "0",
      options: storageUnits,
      required: true,
      hasError: isFieldInvalid("storageAmount_value"),
      hasUnitError: isFieldInvalid("storageAmount_unit"),
    },
    {
      label: "부식성 유무",
      name: "is_corrosiveness",
      type: "custom",
      required: false,
      customRender: (
        <RadioGroup
          name="is_corrosiveness"
          value={formData.is_corrosiveness}
          options={CORROSIVENESS_OPTIONS.map(opt => ({ value: opt.label, label: opt.label }))}
          onChange={handleChange}
        />
      ),
    },
    { label: "독성치", name: "toxicity_level", type: "text", placeholder: "독성치 입력", required: false },
    { label: "이상반응", name: "adverse_reaction", type: "text", placeholder: "이상반응 입력", required: false },
    { label: "등록일", name: "registrationDate", type: "date", placeholder: "등록일 선택", required: false },
    { label: "점검주기", name: "cycle", type: "inspectionCycle", required: false },
    {
      label: "알림 전송여부",
      name: "is_alarm",
      type: "custom",
      required: false,
      customRender: <ToggleSwitch checked={formData.is_alarm} onChange={checked => setFormData(prev => ({ ...prev, is_alarm: checked }))} />,
    },
    {
      label: "알림 발송시점",
      name: "alarm_time",
      type: "select",
      options: ALARM_TIME_OPTIONS.map(opt => ({ value: opt.label, label: opt.label })),
      placeholder: "알림 발송시점 선택",
      required: false,
    },
    { label: "첨부파일 (MSDS)", name: "msds", type: "fileUpload", required: false },
  ]

  const handleSave = async (): Promise<void> => {
    const exposureLimitUnitValue = formData.exposureLimitUnit === "직접입력" ? formData.exposureLimitUnitCustom : formData.exposureLimitUnit
    const dailyUsageUnitValue = formData.dailyUsageUnit === "직접입력" ? formData.dailyUsageUnitCustom : formData.dailyUsageUnit
    const storageAmountUnitValue = formData.storageAmountUnit === "직접입력" ? formData.storageAmountUnitCustom : formData.storageAmountUnit
    const validationValues = {
      ...valuesForForm,
      exposureLimit_unit: exposureLimitUnitValue,
      dailyUsage_unit: dailyUsageUnitValue,
      storageAmount_unit: storageAmountUnitValue,
    }
    if (!validateForm(validationValues)) return
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      onSave(formData)
      return
    }

    setLoading(true)
    try {
      const requestData = {
        post_id: 0,
        name: formData.chemicalName,
        cas_number: formData.casNo,
        exposure_limit: formData.exposureLimitValue,
        exposure_limit_unit: 0,
        daily_usage: formData.dailyUsageValue,
        daily_usage_unit: 0,
        storage_limit: formData.storageAmountValue,
        storage_limit_unit: 0,
        is_corrosiveness: labelToCorrosiveness(formData.is_corrosiveness),
        toxicity_level: formData.toxicity_level,
        adverse_reaction: formData.adverse_reaction,
        registration_date: formData.registrationDate,
        memo: formData.note,
        is_alarm: Number(formData.is_alarm),
        alarm_time: labelToAlarmTime(formData.alarm_time),
        cycle: labelToInspectionInterval(formData.cycle),
        files: [],
      }

      const response = await registHazard(requestData)
      if (response.code === 200) {
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.")
        onSave(formData)
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("유해물질 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>유해/위험물질 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={valuesForForm}
            onChange={handleChange}
            onClose={onClose}
            onSave={handleSave}
            isModal
            notifyEnabled={formData.is_alarm}
            repeatEnabled={formData.repeat}
            onRepeatChange={checked => setFormData(prev => ({ ...prev, repeat: checked }))}
          />
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
  )
}
