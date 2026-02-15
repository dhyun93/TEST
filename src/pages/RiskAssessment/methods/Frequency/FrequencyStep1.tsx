import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import StepBar from "@/components/snippetRisk/StepBar"
import DataTable, { Column } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import useHandlers from "@/hooks/useHandlers"
import { ChevronRight, Save, Trash2, FolderSearch, CirclePlus } from "lucide-react"
import StepSelector from "../../../../components/dialogRisk/IndustryStepDialog"
import NearMissImporter from "../../../../components/dialogRisk/NearMissImportDialog"
import CauseImporter from "../../../../components/dialogRisk/CauseImportDialog"
import { FrequencyStep1Row } from "@/types/riskAssessment"
import { frequencyStep1MockData } from "@/data/mockRiskAssessmentData"

const columns: Column[] = [
  { key: "work", label: "공정(작업)", type: "textarea", align: "left" },
  { key: "hazard", label: "유해위험요인", type: "textarea", align: "left" },
  { key: "law", label: "관련법규", type: "textarea", align: "left" },
  { key: "action", label: "현재 안전보건조치", type: "textarea", align: "left" },
  { key: "proof", label: "첨부파일", type: "upload" },
]

export default function FrequencyStep1() {
  const navigate = useNavigate()
  const [checkedRows, setCheckedRows] = useState<(number | string)[]>([])
  const [data, setData] = useState<FrequencyStep1Row[]>(frequencyStep1MockData)
  const [modalOpen, setModalOpen] = useState(false)
  const [nearMissOpen, setNearMissOpen] = useState(false)
  const [causeOpen, setCauseOpen] = useState(false)

  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev =>
      prev.map(row => {
        if (row.id !== id) return row
        if (key === "work") return { ...row, work: value, law: "" }
        return { ...row, [key]: value }
      })
    )
  }

  const handleUploadChange = (id: number | string, key: string, file: File) => {
    setData(prev => prev.map(row => (row.id === id ? { ...row, [key]: file } : row)))
  }

  const { handleDelete, handleAdd, handleSave, handleSaveAndNext } = useHandlers<FrequencyStep1Row>({
    data,
    checkedIds: checkedRows,
    onDeleteSuccess: ids => {
      setData(prev => prev.filter(row => !ids.includes(row.id)))
      setCheckedRows([])
    },
    onAdd: () => {
      setData(prev => [...prev, { id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1, work: "", hazard: "", law: "", action: "", proof: null }])
    },
    onSave: () => {
      // 실제 저장 로직
    },
    onNextStep: () => {
      navigate("/risk-assessment/methods/frequency/step2")
    },
    saveMessage: "임시저장 완료",
  })

  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <StepBar currentStep={0} setCurrentStep={() => {}} />
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-8 w-full flex flex-col">
          <PageTitle>위험성평가 실시(빈도·강도법)</PageTitle>
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
              <Button variant="action" onClick={() => setModalOpen(true)} className="flex items-center gap-1">
                <FolderSearch size={16} />
                업종선택
              </Button>
              <Button variant="action" onClick={() => setNearMissOpen(true)} className="flex items-center gap-1">
                <CirclePlus size={16} />
                아차사고 추가
              </Button>
              <Button variant="action" onClick={() => setCauseOpen(true)} className="flex items-center gap-1">
                <CirclePlus size={16} />
                기인물요인 추가
              </Button>
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
          <DataTable columns={columns} data={data} onCheckedChange={setCheckedRows} onInputChange={handleInputChange} onUploadChange={handleUploadChange} selectable />
          <div className="mt-1 flex justify-start">
            <Button variant="rowAdd" onClick={handleAdd} className="flex items-center gap-1 text-sm">
              + 직접입력
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={handleSaveAndNext} className="py-3">
          저장 후 다음으로
          <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
      {modalOpen && <StepSelector isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={() => setModalOpen(false)} />}
      {nearMissOpen && <NearMissImporter isOpen={nearMissOpen} onClose={() => setNearMissOpen(false)} />}
      {causeOpen && <CauseImporter isOpen={causeOpen} onClose={() => setCauseOpen(false)} />}
    </section>
  )
}
