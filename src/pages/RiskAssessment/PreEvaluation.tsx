import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Checkbox from "@/components/common/base/Checkbox"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import RiskLevelTable3x3 from "@/components/snippetRisk/RiskLevelTable3x3"
import RiskLevelTable5x4 from "@/components/snippetRisk/RiskLevelTable5x4"
import Spinner from "@/components/common/base/Spinner"
import useForm, { ValidationRules } from "@/hooks/useForm"

type Props = { onClose: () => void }

const PreEvaluation: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formValues, setFormValues] = useState({ riskAssessmentName: "", evaluationType: "", evaluationMethod: "", scale: "", regulationFile: "" })

  const items = [
    {
      id: 1,
      content: [
        "다음 항목이 포함된 위험성평가 실시 규정 작성",
        "평가의 목적 및 방법",
        "평가담당자 및 책임자의 역할",
        "평가기준 및 절차",
        "근로자에 대한 참여·공유방법 및 유의사항",
        "결과의 기록·보존",
      ],
    },
    { id: 2, content: ["위험성의 수준과 그 수준을 판단하는 기준", "허용 가능한 위험성의 수준 (법에서 정한 기준 이상으로 위험성의 수준을 정하여야 함)"] },
    {
      id: 3,
      content: [
        "안전보건정보 사전 조사",
        "기계·기구·설비 사양서 MSDS 유해·위험요인 정보",
        "공정흐름과 작업 환경 정보",
        "법 제63조 작업 여부와 장소 정보",
        "재해사례·통계 정보",
        "작업환경측정결과·건강진단 결과",
        "그 밖의 참고자료",
      ],
    },
  ]

  const handleCheck = (id: number) => {
    setChecked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  const validationRules = useMemo<ValidationRules>(
    () => ({
      riskAssessmentName: { required: true },
      evaluationType: { required: true },
      evaluationMethod: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const baseFields: Field[] = [
    { label: "위험성평가명", name: "riskAssessmentName", type: "text", required: true, placeholder: "위험성평가명 입력", hasError: isFieldInvalid("riskAssessmentName") },
    {
      label: "평가구분",
      name: "evaluationType",
      type: "select",
      required: true,
      options: [
        { value: "최초평가", label: "최초평가" },
        { value: "정기평가", label: "정기평가" },
        { value: "수시평가", label: "수시평가" },
        { value: "상시평가", label: "상시평가" },
      ],
      hasError: isFieldInvalid("evaluationType"),
    },
    {
      label: "평가방법",
      name: "evaluationMethod",
      type: "select",
      required: true,
      options: [
        { value: "빈도·강도법", label: "빈도·강도법" },
        { value: "위험성수준 3단계 판단법", label: "위험성수준 3단계 판단법" },
        { value: "화학물질 평가법", label: "화학물질 평가법" },
        { value: "체크리스트법", label: "체크리스트법" },
      ],
      hasError: isFieldInvalid("evaluationMethod"),
    },
    { label: "실시규정", name: "regulationFile", type: "fileUpload", required: false },
  ]

  const additionalFields: Field[] =
    formValues.evaluationMethod === "빈도·강도법"
      ? [
          {
            label: "평가척도",
            name: "scale",
            type: "radio",
            options: [
              { value: "3x3", label: "3×3" },
              { value: "5x4", label: "5×4" },
            ],
          },
        ]
      : []

  const fields: Field[] = [...baseFields.slice(0, 3), ...additionalFields, ...baseFields.slice(3)]

  const [checklistError, setChecklistError] = useState(false)

  const createRiskAssessment = async (data: { formValues: typeof formValues; checked: number[] }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
  }

  const handleSubmit = async () => {
    if (checked.length !== 3) {
      setChecklistError(true)
      if (!validateForm(formValues)) return
      return
    }
    setChecklistError(false)
    if (!validateForm(formValues)) return
    if (formValues.evaluationMethod === "체크리스트법") {
      return
    }
    setIsLoading(true)
    try {
      const response = await createRiskAssessment({ formValues, checked })
      if (response.success) {
        await onClose()
        switch (formValues.evaluationMethod) {
          case "빈도·강도법":
            navigate("/risk-assessment/methods/frequency/step1")
            break
          case "위험성수준 3단계 판단법":
            navigate("/risk-assessment/methods/threestep/step1")
            break
          case "화학물질 평가법":
            navigate("/risk-assessment/methods/chemical")
            break
        }
      }
    } catch (error) {
      alert("생성 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-[860px] rounded-xl p-4 md:p-6 m-4 shadow-lg pre-checklist overflow-y-auto max-h-[90vh]">
        <style>{`.formscreen-reset table th {background-color: #EFEFF3 !important;}`}</style>
        <h3 className="font-semibold text-base md:text-lg mb-2">위험성평가 사전 체크리스트</h3>
        <div className="space-y-2 mb-3">
          {items.map(item => (
            <div key={item.id}>
              <div
                onClick={() => handleCheck(item.id)}
                className={`flex gap-2 items-start border rounded-lg p-2 md:p-2.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer select-none ${checklistError && !checked.includes(item.id) ? "border-red-600" : "border-[var(--border)]"}`}
              >
                <div className="flex-1">
                  {item.content.map((line, i) => (
                    <p key={i} className="text-xs md:text-sm text-gray-500 leading-snug">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <Checkbox checked={checked.includes(item.id)} onChange={() => handleCheck(item.id)} />
                </div>
              </div>
              {checklistError && !checked.includes(item.id) && <p className="text-red-600 text-xs mt-1">필수 항목입니다.</p>}
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-end gap-1 mb-3">
          <Button variant="secondaryOutline" className="text-xs md:text-sm w-full md:w-auto">
            안전보건정보 조사표 내려받기
          </Button>
          <Button variant="secondaryOutline" className="text-xs md:text-sm w-full md:w-auto">
            위험성평가 실시규정 예시 내려받기
          </Button>
        </div>
        <div className="mt-4 md:mt-6">
          <h3 className="font-semibold text-base md:text-lg mb-1">사전평가정보 입력</h3>
          <div className="formscreen-reset">
            <FormScreen fields={fields} values={formValues} onChange={handleChange} onClose={onClose} onSave={() => {}} />
            {formValues.evaluationMethod === "빈도·강도법" && formValues.scale === "3x3" && <RiskLevelTable3x3 />}
            {formValues.evaluationMethod === "빈도·강도법" && formValues.scale === "5x4" && <RiskLevelTable5x4 />}
          </div>
        </div>
        <div className="mt-4 md:mt-6 flex justify-center gap-1">
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          {isLoading && (
            <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[999] flex items-center justify-center bg-black/50">
              <Spinner />
            </div>
          )}
          <Button variant="primary" disabled={isLoading} onClick={handleSubmit}>
            위험성평가 실시
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PreEvaluation
