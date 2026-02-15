import { useState, useEffect } from "react"
import Checkbox from "@/components/common/base/Checkbox"
import EditableTextArea from "@/components/common/inputs/EditableTextArea"
import { processSelectorMockData } from "@/data/mockRiskAssessmentData"
import { DIALOG_STYLES, getThClass, getTdClass } from "@/components/dialog/DialogCommon"

type IndustryTypeDialogProps = {
  industry: unknown
  selectedIds: number[]
  onSelectIds: (ids: number[]) => void
}

export default function IndustryTypeDialog({ industry, selectedIds, onSelectIds }: IndustryTypeDialogProps) {
  const [rows, setRows] = useState(processSelectorMockData)

  useEffect(() => {
    if (selectedIds.length === 0 && rows.length > 0) {
      onSelectIds(rows.map(row => row.id))
    }
  }, [])

  const handleChange = (id: number, val: string) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, description: val } : row)))
  }

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectIds([])
    } else {
      onSelectIds(rows.map(row => row.id))
    }
  }

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(s => s !== id))
    } else {
      onSelectIds([...selectedIds, id])
    }
  }

  return (
    <div className={`border ${DIALOG_STYLES.border} rounded-lg overflow-auto max-h-[60vh] md:max-h-[72vh]`}>
      <table className={DIALOG_STYLES.table}>
        <thead className={DIALOG_STYLES.tableHead}>
          <tr className={DIALOG_STYLES.headerBg}>
            <th className={`border-b ${DIALOG_STYLES.border} ${DIALOG_STYLES.thPadding} w-12 md:w-16 text-center`}>
              <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
            </th>
            <th
              className={`border-b ${DIALOG_STYLES.border} border-l ${DIALOG_STYLES.border} ${DIALOG_STYLES.thPadding} ${DIALOG_STYLES.textSizeTh} font-medium ${DIALOG_STYLES.textSecondary} w-28 md:w-32 text-center`}
            >
              공정(작업)
            </th>
            <th
              className={`border-b ${DIALOG_STYLES.border} border-l ${DIALOG_STYLES.border} ${DIALOG_STYLES.thPadding} ${DIALOG_STYLES.textSizeTh} font-medium ${DIALOG_STYLES.textSecondary} text-left`}
            >
              공정 설명
            </th>
          </tr>
        </thead>
        <tbody className={DIALOG_STYLES.tableBody}>
          {rows.length > 0 ? (
            rows.map(row => (
              <tr key={row.id} className={DIALOG_STYLES.tableRowHover}>
                <td className={`border-b ${DIALOG_STYLES.border} ${DIALOG_STYLES.cellPadding} text-center`}>
                  <Checkbox checked={selectedIds.includes(row.id)} onChange={() => handleSelect(row.id)} />
                </td>
                <td className={`border-b ${DIALOG_STYLES.border} border-l ${DIALOG_STYLES.border} ${DIALOG_STYLES.cellPadding} ${DIALOG_STYLES.textSizeTd} ${DIALOG_STYLES.textPrimary} text-center`}>
                  {row.process}
                </td>
                <td className={`border-b ${DIALOG_STYLES.border} border-l ${DIALOG_STYLES.border} ${DIALOG_STYLES.cellPadding}`}>
                  <EditableTextArea
                    value={row.description}
                    onChange={val => handleChange(row.id, val)}
                    maxLength={200}
                    rows={2}
                    placeholder="공정 설명을 입력하세요"
                    className={DIALOG_STYLES.textSizeTd}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className={DIALOG_STYLES.emptyStateTable}>
                등록된 공정이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
