import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import StepBar from "@/components/snippetRisk/StepBar"
import DataTable, { Column } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import useHandlers from "@/hooks/useHandlers"
import { ChevronRight, ChevronLeft, Trash2, Save } from "lucide-react"
import PageTitle from "@/components/common/base/PageTitle"
import { ThreeStepRiskDataRow } from "@/types/riskAssessment"
import { threeStep2MockData } from "@/data/mockRiskAssessmentData"

export default function ThreeStep2() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [checked, setChecked] = useState<(number | string)[]>([])
  const [data, setData] = useState<ThreeStepRiskDataRow[]>(threeStep2MockData)

  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, [key]: value } : r)))
  }

  const handleRiskChange = (id: number | string, key: string, value: number) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, [key]: value } : r)))
  }

  const handleUploadChange = (id: number | string, key: string, file: File) => {
    const url = URL.createObjectURL(file)
    setData(prev => prev.map(r => (r.id === id ? { ...r, [key]: url } : r)))
  }

  const { handleDelete, handleSave, handleSaveAndNext } = useHandlers<ThreeStepRiskDataRow>({
    data,
    checkedIds: checked,
    onDeleteSuccess: ids => {
      setData(prev => prev.filter(r => !ids.includes(r.id)))
      setChecked([])
    },
    onSave: () => {},
    onNextStep: () => navigate("/risk-assessment/methods/threestep/step3"),
    saveMessage: "임시저장 완료",
  })

  const columns: Column<ThreeStepRiskDataRow>[] = [
    { key: "id", label: "번호", type: "index" },
    { key: "work", label: "공정(작업)" },
    { key: "hazard", label: "유해위험요인", type: "textarea", align: "left" },
    { key: "action", label: "현재 안전보건조치", type: "textarea", align: "left" },
    { key: "riskLevel", label: "위험성 수준판단", type: "riskRadio" },
    { key: "afterPhoto", label: "평가현장 사진", type: "upload" },
    { key: "evaluationDate", label: "평가일자", type: "date" },
  ]

  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <StepBar currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-8 w-full flex flex-col">
          <PageTitle>위험성평가 실시(위험성수준 3단계 판단법)</PageTitle>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-y-2">
            <div className="text-xs sm:text-sm md:text-base md:whitespace-nowrap md:flex-1">
              <span className="font-medium">산재업종분류:&nbsp;</span>
              <span className="font-normal">
                제조업&nbsp;&gt;&nbsp;전기기계기구ㆍ정밀기구ㆍ전자제품제조업&nbsp;&gt;&nbsp;
                <span className="inline md:hidden">
                  <br />
                </span>
                기타전기기계기구제조업
              </span>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-1 w-full md:w-auto justify-end md:justify-start md:ml-4 shrink-0">
              <Button variant="action" onClick={handleSave} className="flex items-center gap-1">
                <Save size={16} />
                임시저장하기
              </Button>
              <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
                <Trash2 size={16} />
                삭제
              </Button>
            </div>
          </div>
          <DataTable<ThreeStepRiskDataRow>
            columns={columns}
            data={data}
            onCheckedChange={setChecked}
            onInputChange={handleInputChange}
            onRiskChange={handleRiskChange}
            onUploadChange={handleUploadChange}
          />
        </div>
      </div>
      <div className="mt-5 flex justify-between">
        <Button variant="secondary" onClick={() => navigate("/risk-assessment/methods/threestep/step1")} className="py-3">
          <ChevronLeft size={18} className="mr-2" />
          이전으로
        </Button>
        <Button variant="secondary" onClick={handleSaveAndNext} className="py-3">
          저장 후 다음으로
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
    </section>
  )
}
