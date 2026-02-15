import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import FilterBar from "@/components/common/base/FilterBar"
import Pagination from "@/components/common/base/Pagination"
import InfoBox from "@/components/common/base/InfoBox"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import useFilterBar from "@/hooks/useFilterBar"
import useHandlers from "@/hooks/useHandlers"
import usePagination from "@/hooks/usePagination"
import { Trash2, FilePen, PencilLine, Printer, FileSpreadsheet } from "lucide-react"
import { evaluationListMockData } from "@/data/mockRiskAssessmentData"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"

type EvaluationRow = DataRow & {
  id: number | string
  year: number
  title: string
  type: string
  method: string
  regulation: string
  registered: string
  modified: string
  completed: string
  status: { text: string; color: string }
}

const createEvaluationTemplate = (row: EvaluationRow): DocumentTemplate => ({
  id: `evaluation-${row.id}`,
  title: "위험성평가",
  companyName: "",
  documentNumber: `EVAL_${String(row.id).padStart(8, "0")}`,
  createdAt: row.registered,
  fields: [
    { label: "평가명", value: row.title, type: "text", section: "overview" },
    { label: "년도", value: String(row.year), type: "text", section: "overview" },
    { label: "평가구분", value: row.type, type: "text", section: "overview" },
    { label: "평가방법", value: row.method, type: "text", section: "overview" },
    { label: "실시규정", value: row.regulation, type: "text", section: "overview" },
    { label: "등록일", value: row.registered, type: "date", section: "overview" },
    { label: "최종수정일", value: row.modified, type: "date", section: "overview" },
    { label: "완료일", value: row.completed, type: "date", section: "overview" },
    { label: "진행상태", value: row.status.text, type: "text", section: "overview" },
  ],
})

const evaluationColumns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "year", label: "년도" },
  { key: "title", label: "위험성평가명" },
  { key: "type", label: "평가구분" },
  { key: "method", label: "평가방법" },
  { key: "regulation", label: "실시규정" },
  { key: "registered", label: "등록일" },
  { key: "modified", label: "최종수정일" },
  { key: "completed", label: "완료일" },
  { key: "status", label: "진행상태", type: "badge" },
  { key: "result", label: "평가결과", type: "download" },
]

export default function EvaluationList() {
  const navigate = useNavigate()
  const sortedData = [...evaluationListMockData].sort((a, b) => a.id - b.id)
  const [data, setData] = useState<EvaluationRow[]>(sortedData as EvaluationRow[])
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, handleSearch, filteredData } = useFilterBar({
    data,
    dateKey: "registered",
    searchKeys: ["title", "type", "method"],
  })

  const { currentPage, totalPages, currentData, onPageChange } = usePagination<EvaluationRow>(filteredData as EvaluationRow[], 10)

  const { handleDelete, handleExcelDownload, handlePrint, isDownloading, isPrinting } = useHandlers<EvaluationRow>({
    data: filteredData as EvaluationRow[],
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
    createTemplate: createEvaluationTemplate,
  })

  const handleStartEvaluation = () => navigate("/risk-assessment/list", { state: { showChecklist: true } })

  const handleDownload = (row: DataRow) => {
    if (row.completed) {
      alert(`ID ${row.id} 평가결과 다운로드`)
    }
  }

  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-4 md:p-8 mt-3 w-full flex flex-col">
          <PageTitle>위험성평가 목록</PageTitle>
          <InfoBox message="평가결과 다운로드 시 위험성평가지 양식으로 자동변환됩니다" />
          <div className="mb-3">
            <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <TotalCount count={filteredData.length} />
            <div className="flex flex-wrap gap-1">
              <Button variant="action" onClick={handleStartEvaluation} className="flex items-center gap-1">
                <FilePen size={16} />
                위험성평가 실시
              </Button>
              <Button variant="action" onClick={() => alert("평가 수정 페이지로 이동")} className="flex items-center gap-1">
                <PencilLine size={16} />
                위험성평가 수정
              </Button>
              <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
                <Printer size={16} />
                인쇄
              </Button>
              <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
                <FileSpreadsheet size={16} />
                Excel
              </Button>
              <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
                <Trash2 size={16} />
                삭제
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white">
            <DataTable columns={evaluationColumns} data={currentData} onCheckedChange={setCheckedIds} onDownloadClick={handleDownload} />
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  )
}
