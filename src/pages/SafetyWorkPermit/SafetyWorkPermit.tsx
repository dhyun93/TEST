import React, { useState, useCallback } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import PageTitle from "@/components/common/base/PageTitle"
import SafetyWorkPermitRegister from "./SafetyWorkPermitRegister"
import TabMenu from "@/components/common/base/TabMenu"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import usePagination from "@/hooks/usePagination"
import useHandlers from "@/hooks/useHandlers"
import { CirclePlus, Download, Trash2, FileSpreadsheet, Printer } from "lucide-react"
import { safetyWorkPermitMockData } from "@/data/mockData"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"

type SafetyWorkPermitRow = DataRow & {
  id: number | string
  workType: string
  workerCount: string
  risk_level: string
  workPeriod: string
  registrationDate: string
  approvalStatus: { text: string; color: string }
}

const TAB_LABELS = ["작업중지요청 목록"]
const TAB_PATHS = ["/safety-work-permit"]

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "workType", label: "작업유형" },
  { key: "workerCount", label: "작업인원" },
  { key: "risk_level", label: "위험수준" },
  { key: "workPeriod", label: "작업기간" },
  { key: "registrationDate", label: "등록일" },
  { key: "approvalStatus", label: "승인상태", type: "badge" },
  { key: "attachment", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

const createSafetyWorkPermitTemplate = (row: SafetyWorkPermitRow): DocumentTemplate => ({
  id: `safety-work-permit-${row.id}`,
  title: "작업중지요청서",
  companyName: "",
  documentNumber: `SWP_${String(row.id).padStart(8, "0")}`,
  createdAt: row.registrationDate,
  fields: [
    { label: "작업유형", value: row.workType, type: "text", section: "overview" },
    { label: "작업인원", value: row.workerCount, type: "text", section: "overview" },
    { label: "위험수준", value: row.risk_level, type: "text", section: "overview" },
    { label: "작업기간", value: row.workPeriod, type: "text", section: "overview" },
    { label: "등록일", value: row.registrationDate, type: "date", section: "overview" },
    { label: "승인상태", value: { text: row.approvalStatus.text, color: row.approvalStatus.color }, type: "badge", section: "overview" },
  ],
})

export default function SafetyWorkPermit() {
  const [data, setData] = useState<SafetyWorkPermitRow[]>(safetyWorkPermitMockData as SafetyWorkPermitRow[])
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({
    data,
    dateKey: "registrationDate",
    searchKeys: ["workType", "risk_level"],
  })
  const { currentPage, totalPages, currentData, onPageChange } = usePagination<SafetyWorkPermitRow>(filteredData as SafetyWorkPermitRow[], 30)

  const { handleDelete, handleExcelDownload, handlePrint, isDownloading, isPrinting } = useHandlers<SafetyWorkPermitRow>({
    data: filteredData as SafetyWorkPermitRow[],
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
    createTemplate: createSafetyWorkPermitTemplate,
  })

  const handlePermitFormDownload = useCallback(() => {
    alert("안전작업허가서 양식 다운로드")
  }, [])

  const handleSave = useCallback(
    (newItem: Partial<SafetyWorkPermitRow>) => {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      setData(prev => [
        { id: nextId, workType: "", workerCount: "", risk_level: "", workPeriod: "", registrationDate: "", approvalStatus: { text: "대기", color: "orange" }, ...newItem } as SafetyWorkPermitRow,
        ...prev,
      ])
      setIsModalOpen(false)
      setIsEditMode(false)
    },
    [data]
  )

  return (
    <section className="safety-work-permit-content w-full bg-white">
      <PageTitle>작업중지요청</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={0} onTabClick={() => {}} className="mb-6" />

      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <TotalCount count={filteredData.length} />

        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex gap-1 justify-end">
            <Button
              variant="action"
              onClick={() => {
                setIsEditMode(false)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-1"
            >
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
              <Printer size={16} />
              인쇄
            </Button>
            <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
              <FileSpreadsheet size={16} />
              Excel
            </Button>
            <Button variant="action" onClick={handlePermitFormDownload} className="flex items-center gap-1">
              <Download size={16} />
              작업중지요청 양식
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>

        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button
            variant="action"
            onClick={() => {
              setIsEditMode(false)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1"
          >
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
            <Printer size={16} />
            인쇄
          </Button>
          <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
            <FileSpreadsheet size={16} />
            Excel
          </Button>
          <Button variant="action" onClick={handlePermitFormDownload} className="flex items-center gap-1">
            <Download size={16} />
            작업중지요청 양식
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={columns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onManageClick={() => {
            setIsEditMode(true)
            setIsModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {isModalOpen && (
        <SafetyWorkPermitRegister
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setIsEditMode(false)
          }}
          onSave={handleSave}
          isEdit={isEditMode}
        />
      )}
    </section>
  )
}
