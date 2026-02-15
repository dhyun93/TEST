import React, { useState } from "react"
import DataTable, { Column } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import ChemicalRegister from "./ChemicalRegister"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import FilterBar from "@/components/common/base/FilterBar"
import useFilterBar from "@/hooks/useFilterBar"
import useHandlers from "@/hooks/useHandlers"
import useApproval from "@/hooks/useApproval"
import { Save, Trash2, CirclePlus } from "lucide-react"
import ChemicalAction from "./ChemicalAction"
import { ChemicalEditableRow } from "@/types/riskAssessment"
import { chemicalStep1MockData } from "@/data/mockRiskAssessmentData"

export default function ChemicalStep() {
  const [checkedRows, setCheckedRows] = useState<(number | string)[]>([])
  const [data, setData] = useState<ChemicalEditableRow[]>(chemicalStep1MockData)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [editItem, setEditItem] = useState<ChemicalEditableRow | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [currentActionId, setCurrentActionId] = useState<number | null>(null)

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({ data, dateKey: "", searchKeys: ["process", "product", "substance"] })
  const { handleSaveComplete: handleRiskSaveComplete } = useHandlers({ data: [], checkedIds: [], navigateOnComplete: "/risk-assessment/list" })

  const { isDialogOpen, approvalLineName, approvers, defaultContent: approvalDefaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "위험성평가" })

  const handleSaveComplete = () => {
    checkAndSave(handleRiskSaveComplete, "위험성평가 화학물질 평가법")
  }

  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev => prev.map(row => (row.id === id ? { ...row, [key]: value } : row)))
  }

  const handleUploadChange = (id: number | string, key: string, file: File) => {
    setData(prev => prev.map(row => (row.id === id ? { ...row, [key]: file } : row)))
  }

  const openActionModal = (id: number) => {
    setCurrentActionId(id)
    setIsActionModalOpen(true)
  }
  const handleEdit = (row: ChemicalEditableRow) => {
    setEditItem(row)
    setIsRegisterOpen(true)
  }

  const columns: Column<ChemicalEditableRow>[] = [
    { key: "id", label: "번호", type: "index" },
    { key: "process", label: "공정명" },
    { key: "product", label: "제품명" },
    { key: "substance", label: "화학물질명" },
    { key: "exposure", label: "노출수준(가능성)", type: "textarea", align: "left" },
    { key: "toxicity", label: "유해성(중대성)", type: "textarea", align: "left" },
    { key: "risk", label: "위험성 수준판단", type: "riskRadio" },
    { key: "action", label: "감소대책", type: "reduction" },
    { key: "image", label: "이미지", type: "upload" },
    { key: "manage", label: "관리", type: "manage" },
  ]

  const { handleDelete } = useHandlers({
    data,
    checkedIds: checkedRows,
    onDeleteSuccess: ids => {
      setData(prev => prev.filter(row => !ids.includes(row.id)))
      setCheckedRows([])
    },
  })

  const handleRegisterSave = (formData: any) => {
    if (editItem) setData(prev => prev.map(row => (row.id === editItem.id ? { ...row, ...formData } : row)))
    else setData(prev => [...prev, { id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1, ...formData }])
    setEditItem(null)
    setIsRegisterOpen(false)
  }

  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-4 md:p-8 mt-3 w-full flex flex-col">
          <PageTitle>위험성평가 실시(화학물질 평가법)</PageTitle>
          <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
          <div className="flex justify-end mt-1 mb-3 gap-1">
            <Button
              variant="action"
              onClick={() => {
                setEditItem(null)
                setIsRegisterOpen(true)
              }}
              className="flex items-center gap-1"
            >
              <CirclePlus size={16} />
              물질추가
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
          <DataTable<ChemicalEditableRow>
            columns={columns}
            data={filteredData as ChemicalEditableRow[]}
            onCheckedChange={setCheckedRows}
            onInputChange={handleInputChange}
            onUploadChange={handleUploadChange}
            onManageClick={handleEdit}
            onReductionClick={row => openActionModal(row.id as number)}
            selectable
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={handleSaveComplete} className="py-3">
          <Save size={18} className="mr-1" />
          저장완료
        </Button>
      </div>
      <ChemicalRegister
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false)
          setEditItem(null)
        }}
        onSave={handleRegisterSave}
      />
      <ChemicalAction isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} onSubmit={() => setIsActionModalOpen(false)} />
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
