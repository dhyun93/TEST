import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useReactToPrint } from "react-to-print"
import StepBar from "@/components/snippetRisk/StepBar"
import DataTable, { Column } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import useHandlers from "@/hooks/useHandlers"
import useApproval from "@/hooks/useApproval"
import { ChevronLeft, Save, Trash2, Printer, FileDown } from "lucide-react"
import PageTitle from "@/components/common/base/PageTitle"
import { FrequencyStep3Row } from "@/types/riskAssessment"
import { frequencyStep3MockData } from "@/data/mockRiskAssessmentData"

export default function FrequencyStep3() {
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<FrequencyStep3Row[]>(frequencyStep3MockData)
  const [checkedRows, setCheckedRows] = useState<(number | string)[]>([])
  const { handleSaveComplete: handleRiskSaveComplete } = useHandlers({ data: [], checkedIds: [], navigateOnComplete: "/risk-assessment/list" })

  const { isDialogOpen, approvalLineName, approvers, defaultContent: approvalDefaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "위험성평가" })

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "위험성평가_빈도강도법",
    pageStyle: `
@page {
size: A4 landscape;
margin: 15mm 10mm;
}
@media print {
body {
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
margin: 0;
padding: 0;
}
.no-print { display: none !important; }
.page-break { page-break-before: always; }
.print-container {
width: 100%;
max-width: 100%;
margin: 0 auto;
}
}
`,
  })

  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev => prev.map(x => (x.id === id ? { ...x, [key]: value } : x)))
  }

  const handleRiskChange = (id: number | string, key: string, value: number) => {
    setData(prev => prev.map(x => (x.id === id ? { ...x, [key]: value } : x)))
  }

  const handleUploadChange = (id: number | string, key: string, file: File) => {
    const url = URL.createObjectURL(file)
    setData(prev => prev.map(x => (x.id === id ? { ...x, [key]: url } : x)))
  }

  const doSaveComplete = () => {
    handleRiskSaveComplete()
  }

  const { handleDelete } = useHandlers<FrequencyStep3Row>({
    data,
    checkedIds: checkedRows,
    onDeleteSuccess: ids => {
      setData(prev => prev.filter(row => !ids.includes(row.id)))
      setCheckedRows([])
    },
  })

  const handleSaveComplete = () => {
    checkAndSave(doSaveComplete, "위험성평가 빈도·강도법")
  }

  const columns: Column<FrequencyStep3Row>[] = [
    { key: "id", label: "번호", type: "index" },
    { key: "work", label: "공정(작업)" },
    { key: "hazard", label: "유해위험요인", type: "textarea", align: "left" },
    { key: "action", label: "감소대책", type: "textarea", align: "left" },
    { key: "plannedDate", label: "개선예정일", type: "date" },
    { key: "completedDate", label: "개선완료일", type: "date" },
    { key: "evaluator", label: "평가담당자", type: "input" },
    { key: "frequency", label: "빈도", type: "riskSelect" },
    { key: "intensity", label: "강도", type: "riskSelect" },
    { key: "risk", label: "위험성", type: "riskResult" },
    { key: "afterPhoto", label: "개선후 사진", type: "upload" },
  ]

  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <StepBar currentStep={2} setCurrentStep={() => {}} />
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-8 w-full flex flex-col" ref={printRef}>
          <PageTitle>위험성평가 실시(빈도·강도법)</PageTitle>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-y-2">
            <div className="text-xs sm:text-sm md:text-base md:whitespace-nowrap md:flex-1">
              <span className="font-medium">산재업종분류: </span>
              <span className="font-normal">
                제조업&nbsp;&gt;&nbsp;전기기계기구ㆍ정밀기구ㆍ전자제품제조업&nbsp;&gt;&nbsp;
                <span className="inline md:hidden">
                  <br />
                </span>
                기타전기기계기구제조업
              </span>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-1 w-full md:w-auto justify-end md:justify-start md:ml-4 shrink-0 no-print">
              <Button variant="action" onClick={() => alert("엑셀 다운로드")} className="flex items-center gap-1">
                <FileDown size={16} />
                엑셀다운로드
              </Button>
              <Button variant="action" onClick={handlePrint} className="flex items-center gap-1">
                <Printer size={16} />
                인쇄
              </Button>
              <Button variant="action" onClick={() => alert("임시저장 완료")} className="flex items-center gap-1">
                <Save size={16} />
                임시저장하기
              </Button>
              <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
                <Trash2 size={16} />
                삭제
              </Button>
            </div>
          </div>
          <DataTable<FrequencyStep3Row>
            columns={columns}
            data={data}
            onCheckedChange={setCheckedRows}
            onInputChange={handleInputChange}
            onRiskChange={handleRiskChange}
            onUploadChange={handleUploadChange}
          />
        </div>
      </div>
      <div className="mt-5 flex justify-between no-print">
        <Button variant="secondary" onClick={() => navigate("/risk-assessment/methods/frequency/step2")} className="py-3">
          <ChevronLeft size={18} className="mr-2" />
          이전으로
        </Button>
        <Button variant="secondary" onClick={handleSaveComplete} className="py-3">
          <Save size={18} className="mr-1" />
          저장완료
        </Button>
      </div>
      <ApprovalConfirmDialog
        isOpen={isDialogOpen}
        documentType="위험성평가"
        approvalLineName={approvalLineName}
        approvers={approvers}
        defaultContent={approvalDefaultContent}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancel}
      />
    </section>
  )
}
