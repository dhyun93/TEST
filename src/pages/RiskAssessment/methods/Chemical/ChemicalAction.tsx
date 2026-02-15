import React, { useState } from "react"
import { Download } from "lucide-react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import Checkbox from "@/components/common/base/Checkbox"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import PageTitle from "@/components/common/base/PageTitle"
import { checklistMockData } from "@/data/mockRiskAssessmentData"
import { getFileNameFromUrl } from "@/utils/file"

type Props = { isOpen: boolean; onClose: () => void; onSubmit?: () => void }

const etcFields: Field[] = [
  { label: "1. 작업환경 관리실태 평가내용", name: "evaluationDetail", type: "text", placeholder: "내용을 입력하세요" },
  { label: "2. 작업환경 개선대책", name: "improvementPlan", type: "textarea", placeholder: "내용을 입력하세요" },
]

export default function WorkplaceChecklistModal({ isOpen, onClose, onSubmit }: Props) {
  const [checkedIds, setCheckedIds] = useState<(string | number)[]>([])
  const [formValues, setFormValues] = useState({ evaluationDetail: "", improvementPlan: "" })

  const handleDownloadExample = (key: string) => {
    const fileMap: Record<string, string> = {
      "hazardous-substance": "/downloads/평가기준예시_물질유해성.pdf",
      "exposure-possibility": "/downloads/평가기준예시_물질노출가능성.pdf",
      "work-method": "/downloads/평가기준예시_작업방법.pdf",
      "management-plan": "/downloads/평가기준예시_관리방안.pdf",
    }
    const fileUrl = fileMap[key]
    if (fileUrl) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = getFileNameFromUrl(fileUrl) || "평가기준예시.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`.no-checkbox th:first-child, .no-checkbox td:first-child { display: none; }`}</style>
      <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="w-full max-w-[960px] bg-white rounded-[13px] border border-[#E5E5E5] shadow-md overflow-hidden">
          <PageTitle className="px-6 pt-6">직업환경 관리상태 체크리스트</PageTitle>
          <div className="max-h-[70vh] overflow-y-auto text-[#111] px-6 py-6 space-y-8">
            {checklistMockData.map((section, sIdx) => {
              const ActionButton = section.downloadKey && (
                <Button variant="secondaryOutline" className="min-w-[100px] h-[30px] text-xs gap-1" onClick={() => handleDownloadExample(section.downloadKey!)}>
                  <Download size={16} /> 평가기준예시
                </Button>
              )
              if (section.type === "form") {
                return (
                  <div key={sIdx}>
                    <div className="flex justify-between items-center mb-1">
                      <PageTitle className="text-base sm:text-lg">{section.title}</PageTitle>
                    </div>
                    <div className="mt-1">
                      <FormScreen
                        fields={etcFields}
                        values={formValues}
                        onChange={e => setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        isModal
                        onClose={() => {}}
                        onSave={() => {}}
                      />
                    </div>
                  </div>
                )
              }
              const data: DataRow[] = (section.items || []).map((text, i) => ({ id: `${sIdx}-${i}`, text, index: i + 1 }))
              const columns: Column[] = [
                { key: "rowNum", label: "번호", minWidth: 30, align: "center", renderCell: row => <span>{row.index}</span> },
                { key: "text", label: "작업환경 관리상태 평가 내용", minWidth: 300, align: "left" },
                {
                  key: "check",
                  label: "✓",
                  minWidth: 30,
                  align: "center",
                  renderCell: row => (
                    <Checkbox checked={checkedIds.includes(row.id)} onChange={() => setCheckedIds(prev => (prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]))} />
                  ),
                },
              ]
              return (
                <div key={sIdx}>
                  <div className="flex justify-between items-center mb-1">
                    <PageTitle className="text-base sm:text-lg">{section.title}</PageTitle>
                    {ActionButton}
                  </div>
                  <div className="no-checkbox">
                    <DataTable columns={columns} data={data} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center gap-1 px-6 py-4">
            <Button variant="primaryOutline" onClick={onClose} className="min-w-[80px] h-[36px] text-sm">
              닫기
            </Button>
            <Button variant="primary" onClick={onSubmit} className="min-w-[80px] h-[36px] text-sm">
              확인
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
