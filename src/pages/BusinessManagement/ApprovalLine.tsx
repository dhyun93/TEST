import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import Pagination from "@/components/common/base/Pagination"
import { Tag } from "@/components/common/base/Badge"
import ApprovalDocTable from "@/components/snippetBusiness/ApprovalDocTable"
import ApprovalLineRegisterModal from "./ApprovalLineRegister"
import useHandlers from "@/hooks/useHandlers"
import usePagination from "@/hooks/usePagination"
import { CirclePlus, Trash2, ChevronRight } from "lucide-react"
import { approvalLineMockData, documentApprovalSettingsMockData, DocumentApprovalSetting } from "@/data/mockBusinessData"
import TotalCount from "@/components/common/base/TotalCount"

const TAB_LABELS = ["결재선 지정", "결재문서 설정"]

const ApproverBreadcrumb = ({ approvers }: { approvers: string }) => {
  const list = approvers.split(" → ")
  return (
    <div className="flex items-center flex-wrap gap-1">
      {list.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <Tag>{item}</Tag>
          {idx < list.length - 1 && <ChevronRight size={14} className="text-gray-400 mx-1.5" />}
        </span>
      ))}
    </div>
  )
}

const columns: Column[] = [
  { key: "name", label: "결재선명" },
  { key: "steps", label: "결재단계" },
  { key: "approvers", label: "결재선", renderCell: row => <ApproverBreadcrumb approvers={row.approvers as string} /> },
  { key: "createdAt", label: "등록일" },
  { key: "manage", label: "관리", type: "manage" },
]

export default function ApprovalLine() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [approvalLines, setApprovalLines] = useState<DataRow[]>(approvalLineMockData)

  useEffect(() => {
    setSearchParams({ tab: TAB_LABELS[activeTab] })
  }, [activeTab, setSearchParams])
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<DataRow | null>(null)
  const [documentSettings, setDocumentSettings] = useState<DocumentApprovalSetting[]>(documentApprovalSettingsMockData)

  const { currentPage, totalPages, currentData, onPageChange } = usePagination<DataRow>(approvalLines, 10)

  const { handleCreate, handleDelete } = useHandlers({
    data: approvalLines,
    checkedIds,
    onCreate: () => {
      setEditData(null)
      setModalOpen(true)
    },
    onDeleteSuccess: ids => setApprovalLines(prev => prev.filter(row => !ids.includes(row.id))),
  })

  const handleEdit = (row: DataRow) => {
    setEditData(row)
    setModalOpen(true)
  }

  const handleSave = (data: Partial<DataRow>) => {
    if (editData) {
      setApprovalLines(prev => prev.map(row => (row.id === editData.id ? { ...row, ...data } : row)))
    } else {
      setApprovalLines(prev => [{ id: Date.now(), createdAt: new Date().toISOString().split("T")[0], ...data }, ...prev])
    }
    setModalOpen(false)
    setEditData(null)
  }

  const handleToggleApproval = (id: number, value: boolean) => {
    setDocumentSettings(prev => prev.map(doc => (doc.id === id ? { ...doc, useApproval: value, approvalLineId: value ? doc.approvalLineId : null } : doc)))
  }

  const handleApprovalLineChange = (id: number, value: string) => {
    setDocumentSettings(prev => prev.map(doc => (doc.id === id ? { ...doc, approvalLineId: value ? Number(value) : null } : doc)))
  }

  const handleSaveDocumentSettings = () => {
    alert("결재문서 설정이 저장되었습니다")
  }

  return (
    <section className="mypage-content w-full">
      <PageTitle>결재선관리</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={activeTab} onTabClick={setActiveTab} className="mb-6" />

      {activeTab === 0 ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <TotalCount count={approvalLines.length} />
            <div className="flex gap-1">
              <Button variant="action" onClick={handleCreate} className="flex items-center gap-1">
                <CirclePlus size={16} />
                결재선 추가
              </Button>
              <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
                <Trash2 size={16} />
                삭제
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <DataTable columns={columns} data={currentData} onCheckedChange={setCheckedIds} onManageClick={handleEdit} />
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      ) : (
        <>
          <ApprovalDocTable settings={documentSettings} approvalLines={approvalLines} onToggleApproval={handleToggleApproval} onApprovalLineChange={handleApprovalLineChange} />
          <div className="flex justify-end mt-5">
            <Button variant="primary" onClick={handleSaveDocumentSettings}>
              저장하기
            </Button>
          </div>
        </>
      )}

      <ApprovalLineRegisterModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditData(null)
        }}
        onSave={handleSave}
        editData={editData}
      />
    </section>
  )
}
