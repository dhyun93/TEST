import React from "react"
import RadioGroup from "@/components/common/base/RadioGroup"

type CompoundFieldProps = {
  field: { name: string; label?: string }
  values: Record<string, any>
  onChange: (e: React.ChangeEvent<any>) => void
}

const FONT_SM_BASE = "text-[10px] sm:text-xs"
const TEXT_BASE_CLASS = `${FONT_SM_BASE} font-medium`
const BORDER_CLASS = "rounded-lg border border-[var(--border)]"
const PLACEHOLDER_CLASS = "placeholder:font-normal placeholder:text-gray-500 placeholder:text-[10px] sm:placeholder:text-xs"

const FIELD_TITLE = `hidden md:inline-block md:min-w-[140px] shrink-0 text-gray-600 ${TEXT_BASE_CLASS}`
const INPUT = `px-1.5 sm:px-2 py-1 sm:py-1.5 ${BORDER_CLASS} ${TEXT_BASE_CLASS} ${PLACEHOLDER_CLASS} bg-white text-gray-800`
const SELECT = `px-1.5 sm:px-2 pr-5 sm:pr-6 py-1 sm:py-1.5 ${BORDER_CLASS} ${TEXT_BASE_CLASS} appearance-none bg-white text-gray-800 whitespace-nowrap`

export default function FormCompoundFields({ field, values, onChange }: CompoundFieldProps) {
  const rowClass = `flex items-center gap-2 ${TEXT_BASE_CLASS}`

  if (field.name === "percentCompound") {
    return (
      <div className="flex flex-col gap-3">
        <div className={rowClass}>
          <span className={FIELD_TITLE}>물질구분 :</span>
          <RadioGroup
            name="materialType"
            value={values.materialType}
            options={[
              { value: "단일물질", label: "단일물질" },
              { value: "혼합물질", label: "혼합물질" },
            ]}
            onChange={onChange}
          />
        </div>
        <div className={rowClass}>
          <span className={FIELD_TITLE}>하루취급량 :</span>
          <input name="dailyAmount" value={values.dailyAmount || ""} onChange={onChange} placeholder="하루취급량" className={`flex-1 md:w-[150px] md:flex-none ${INPUT}`} />
          <select name="dailyAmountUnit" value={values.dailyAmountUnit || ""} onChange={onChange} className={`w-[80px] ${SELECT}`}>
            <option value="">단위</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="mg">mg</option>
            <option value="L">L</option>
            <option value="mL">mL</option>
          </select>
        </div>
        <div className={rowClass}>
          <span className={FIELD_TITLE}>함유량 :</span>
          <input name="containRatio" value={values.containRatio || ""} onChange={onChange} placeholder="함유량" className={`flex-1 md:w-[150px] md:flex-none ${INPUT}`} />
          <span className="text-gray-600 shrink-0">%</span>
        </div>
      </div>
    )
  }

  if (field.name === "volatilityInput") {
    return (
      <div className="flex flex-col gap-3">
        <div className={rowClass}>
          <span className={FIELD_TITLE}>사용 온도 :</span>
          <input name="useTemp" value={values.useTemp || ""} onChange={onChange} placeholder="사용 온도" className={`flex-1 md:w-[200px] md:flex-none ${INPUT}`} />
          <span className="text-gray-600 shrink-0">℃</span>
        </div>
        <div className={rowClass}>
          <span className={FIELD_TITLE}>끓는점 :</span>
          <input name="boilingPoint" value={values.boilingPoint || ""} onChange={onChange} placeholder="끓는점" className={`flex-1 md:w-[200px] md:flex-none ${INPUT}`} />
          <span className="text-gray-600 shrink-0">℃</span>
        </div>
      </div>
    )
  }

  if (field.name === "tripleInput") {
    return (
      <div className="flex flex-col gap-3">
        <div className={rowClass}>
          <span className={FIELD_TITLE}>발암성(C)값 :</span>
          <input name="cmrC" value={values.cmrC || ""} onChange={onChange} placeholder="발암성(C)" className={`flex-1 md:w-[200px] md:flex-none ${INPUT}`} />
        </div>
        <div className={rowClass}>
          <span className={FIELD_TITLE}>생식세포변이원성(M)값 :</span>
          <input name="cmrM" value={values.cmrM || ""} onChange={onChange} placeholder="변이원성(M)" className={`flex-1 md:w-[200px] md:flex-none ${INPUT}`} />
        </div>
        <div className={rowClass}>
          <span className={FIELD_TITLE}>생식독성(R)값 :</span>
          <input name="cmrR" value={values.cmrR || ""} onChange={onChange} placeholder="생식독성(R)" className={`flex-1 md:w-[200px] md:flex-none ${INPUT}`} />
        </div>
      </div>
    )
  }

  if (field.name === "measuredInput") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className={rowClass}>
          <input name="twaPpm" value={values.twaPpm || ""} onChange={onChange} placeholder="PPM" className={`flex-1 md:w-[120px] md:flex-none ${INPUT}`} />
          <span className="text-gray-600 shrink-0">ppm</span>
        </div>
        <div className={rowClass}>
          <input name="twaMg" value={values.twaMg || ""} onChange={onChange} placeholder="mg" className={`flex-1 md:w-[120px] md:flex-none ${INPUT}`} />
          <span className="text-gray-600 shrink-0">mg/m³</span>
        </div>
      </div>
    )
  }

  if (field.name === "textSelect") {
    return (
      <div className={rowClass}>
        <input name="hcodeValue" value={values.hcodeValue || ""} onChange={onChange} placeholder="값 입력" className={`flex-1 md:w-[120px] md:flex-none ${INPUT}`} />
        <select name="hcodeGrade" value={values.hcodeGrade || ""} onChange={onChange} className={`w-[80px] ${SELECT}`}>
          <option value="">등급</option>
          <option value="1등급">1등급</option>
          <option value="2등급">2등급</option>
          <option value="3등급">3등급</option>
          <option value="4등급">4등급</option>
        </select>
      </div>
    )
  }

  return null
}
