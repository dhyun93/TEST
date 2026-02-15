import { useState } from "react"
import { X } from "lucide-react"
import Button from "@/components/common/base/Button"
import Checkbox from "@/components/common/base/Checkbox"
import Pagination from "@/components/common/base/Pagination"
import { causeImporterMockData } from "@/data/mockRiskAssessmentData"
import { DIALOG_STYLES, getThClass, getTdClass } from "@/components/dialog/DialogCommon"

type CauseImportDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (selectedIds: number[]) => void
}

export default function CauseImportDialog({ isOpen, onClose, onSubmit }: CauseImportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const data = causeImporterMockData
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedList = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const isAllSelected = paginatedList.length > 0 && paginatedList.every(row => selectedIds.includes(row.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter(id => !paginatedList.some(row => row.id === id)))
    } else {
      const newIds = paginatedList.map(row => row.id).filter(id => !selectedIds.includes(id))
      setSelectedIds([...selectedIds, ...newIds])
    }
  }

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(s => s !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSubmit = () => {
    if (onSubmit) onSubmit(selectedIds)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerXl}>
        <div className={DIALOG_STYLES.headerNoBorder}>
          <h2 className={DIALOG_STYLES.title}>기인물요인 불러오기</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={DIALOG_STYLES.tableContainer}>
          <table className={DIALOG_STYLES.table}>
            <thead className={DIALOG_STYLES.tableHead}>
              <tr className={DIALOG_STYLES.headerBg}>
                <th className={`${getThClass(true, "w-12 md:w-16")} text-center`}>
                  <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
                </th>
                <th className={`${getThClass(false, "w-28 md:w-40")} text-center`}>위험분류</th>
                <th className={`${getThClass(false)} text-left`}>위험발생 상황 및 결과</th>
                <th className={`${getThClass(false, "w-40 md:w-60")} text-left hidden md:table-cell`}>유해위험요인</th>
              </tr>
            </thead>
            <tbody className={DIALOG_STYLES.tableBody}>
              {paginatedList.length > 0 ? (
                paginatedList.map(row => (
                  <tr key={row.id} className={DIALOG_STYLES.tableRowHover}>
                    <td className={`${getTdClass(true)} text-center`}>
                      <Checkbox checked={selectedIds.includes(row.id)} onChange={() => handleSelect(row.id)} />
                    </td>
                    <td className={`${getTdClass(false)} text-center`}>{row.category}</td>
                    <td className={getTdClass(false)}>{row.situation}</td>
                    <td className={`${getTdClass(false)} hidden md:table-cell`}>{row.hazard}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={DIALOG_STYLES.emptyStateTable}>
                    등록된 기인물요인이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={DIALOG_STYLES.footerBetween}>
          <div className="flex-1" />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <div className="flex-1 flex justify-end">
            <Button variant="primary" onClick={handleSubmit} disabled={selectedIds.length === 0}>
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
