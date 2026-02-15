import React, { useCallback, useMemo, useState } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import ToggleSwitch from "@/components/common/base/ToggleSwitch"
import MachineAutocomplete from "@/components/common/inputs/MachineAutocomplete"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { ALARM_TIME_OPTIONS, labelToAlarmTime, labelToInspectionInterval } from "@/constants/options/assetManagement"
import { registMachine } from "@/api/05_AssetManagement/machine.api"
import { useLoadingStore } from "@/stores/loadingStore"

const USE_MOCK_DATA = false

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormDataState) => void
  isEdit?: boolean
}

type FormDataState = {
  name: string
  capacityValue: string
  capacityUnit: string
  capacityUnitCustom: string
  quantity: string
  place: string
  inspection_interval: string
  inspection_date: string
  potential_hazards: string
  proof: string
  is_alarm: boolean
  alarm_time: string
  is_repeat: boolean
}

type Option = { value: string; label: string }

const unitOptions: Option[] = [
  { value: "bar", label: "bar" },
  { value: "kg", label: "kg" },
  { value: "ton", label: "ton" },
  { value: "m³", label: "m³" },
  { value: "L", label: "L" },
]


export default function AssetMachineRegister({ isOpen, onClose, onSave, isEdit }: Props): React.ReactElement | null {
  const { setLoading } = useLoadingStore()
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    capacityValue: "",
    capacityUnit: "",
    capacityUnitCustom: "",
    quantity: "",
    place: "",
    inspection_interval: "상시",
    inspection_date: "",
    potential_hazards: "",
    proof: "",
    is_alarm: false,
    alarm_time: "1주일 전",
    is_repeat: false,
  })

  const validationRules = useMemo<ValidationRules>(
    () => ({
      name: { required: true },
      capacity_value: { required: true },
      capacity_unit: { required: true },
      quantity: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const numericNames = useMemo(() => new Set(["quantity", "capacity_value"]), [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      const { name, value, type, checked } = e.target as HTMLInputElement
      if (numericNames.has(name) && value !== "" && !/^\d*\.?\d*$/.test(value)) return
      if (type === "checkbox") {
        setFormData(prev => ({ ...prev, [name]: checked }))
        return
      }
      if (name === "fileUpload") {
        setFormData(prev => ({ ...prev, proof: value }))
        return
      }
      if (name === "capacity_value") {
        setFormData(prev => ({ ...prev, capacityValue: value }))
        return
      }
      if (name === "capacity_unit") {
        setFormData(prev => ({ ...prev, capacityUnit: value, capacityUnitCustom: value === "직접입력" ? "" : prev.capacityUnitCustom }))
        return
      }
      if (name === "capacity_unit_custom") {
        setFormData(prev => ({ ...prev, capacityUnitCustom: value }))
        return
      }
      if (name === "inspection_interval") {
        setFormData(prev => ({ ...prev, inspection_interval: value, is_repeat: value === "상시" ? false : prev.is_repeat }))
        return
      }
      setFormData(prev => ({ ...prev, [name]: value }))
    },
    [numericNames]
  )

  const valuesForForm: { [key: string]: string } = {
    name: formData.name,
    capacity_value: formData.capacityValue,
    capacity_unit: formData.capacityUnit,
    capacity_unit_custom: formData.capacityUnitCustom,
    quantity: formData.quantity,
    place: formData.place,
    inspection_date: formData.inspection_date,
    potential_hazards: formData.potential_hazards,
    inspection_interval: formData.inspection_interval,
    fileUpload: formData.proof,
    is_alarm: formData.is_alarm ? "true" : "",
    alarm_time: formData.alarm_time,
  }

  const fields: Field[] = [
    {
      label: "기계/기구/설비명",
      name: "name",
      type: "custom",
      required: true,
      hasError: isFieldInvalid("name"),
      customRender: (
        <MachineAutocomplete
          id="machineName"
          value={formData.name}
          placeholder="기계명 입력 또는 선택"
          onChange={v => setFormData(prev => ({ ...prev, name: v }))}
          onSelect={opt => setFormData(prev => ({ ...prev, name: opt.label }))}
          className={`w-full ${isFieldInvalid("name") ? "[&_input]:border-red-500" : ""}`}
        />
      ),
    },
    {
      label: "용량/단위",
      name: "capacity",
      type: "quantityUnit",
      placeholder: "용량 입력",
      options: unitOptions,
      required: true,
      hasError: isFieldInvalid("capacity_value"),
      hasUnitError: isFieldInvalid("capacity_unit"),
    },
    {
      label: "수량",
      name: "quantity",
      type: "quantity",
      placeholder: "수량 입력",
      required: true,
      hasError: isFieldInvalid("quantity"),
    },
    { label: "설치/작업장소", name: "place", type: "text", placeholder: "장소 입력", required: false },
    { label: "점검일", name: "inspection_date", type: "date", placeholder: "점검일 선택", required: false },
    { label: "용도", name: "potential_hazards", type: "text", placeholder: "용도 입력", required: false },
    { label: "점검주기", name: "inspection_interval", type: "inspectionCycle", required: false },
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
      required: false,
      options: ALARM_TIME_OPTIONS.map(opt => ({ value: opt.label, label: opt.label })),
      placeholder: "알림 발송시점 선택",
    },
    {
      label: "첨부파일",
      name: "fileUpload",
      type: "fileUpload",
      required: false,
    },
  ]

  const handleSave = async (): Promise<void> => {
    const unitValue = formData.capacityUnit === "직접입력" ? formData.capacityUnitCustom : formData.capacityUnit
    const validationValues = { ...valuesForForm, capacity_unit: unitValue }
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
        name: formData.name,
        capacity: formData.capacityValue,
        unit: 0,
        quantity: Number(formData.quantity) || 0,
        place: formData.place,
        inspection_interval: labelToInspectionInterval(formData.inspection_interval),
        inspection_date: formData.inspection_date,
        potential_hazards: formData.potential_hazards,
        is_alarm: Number(formData.is_alarm),
        alarm_time: labelToAlarmTime(formData.alarm_time),
        is_repeat: Number(formData.is_repeat),
        photo_id: [],
        photofiles: [],
      }

      const response = await registMachine(requestData)
      if (response.code === 200) {
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.")
        onSave(formData)
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("기계 저장 실패:", error)
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
          <h2 className={DIALOG_STYLES.title}>위험기계/기구/설비 {isEdit ? "편집" : "등록"}</h2>
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
            repeatEnabled={formData.is_repeat}
            onRepeatChange={checked => setFormData(prev => ({ ...prev, is_repeat: checked }))}
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
