import React, { useState, useEffect, useMemo, ReactNode } from "react"
import { X, Search } from "lucide-react"
import Button from "@/components/common/base/Button"
import Pagination from "@/components/common/base/Pagination"
import YearPicker from "@/components/common/inputs/YearPicker"
import { DIALOG_STYLES, getThClass, getTdClass } from "./DialogCommon"

export interface ListItem {
  id: string | number
  name?: string
  [key: string]: any
}

export interface ColumnDef<T> {
  key: string
  label: string
  width?: string
  align?: "left" | "center" | "right"
  hiddenMobile?: boolean
  render?: (item: T, index: number) => ReactNode
}

export interface RoutineListItem extends ListItem {
  inspectionDate: string
  inspector: string
  registeredAt: string
}

export const ROUTINE_LIST_COLUMNS: ColumnDef<RoutineListItem>[] = [
  { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
  { key: "inspectionDate", label: "점검기간", align: "center" },
  { key: "inspector", label: "점검자", width: "w-20 md:w-24", align: "center" },
  { key: "registeredAt", label: "등록일", width: "w-24 md:w-28", align: "center", hiddenMobile: true },
]

export const ROUTINE_LIST_MOCK_DATA: RoutineListItem[] = [
  { id: 1, inspectionDate: "2026-01-06 ~ 2026-01-12", inspector: "김안전", registeredAt: "2026-01-09" },
  { id: 2, inspectionDate: "2025-12-30 ~ 2026-01-05", inspector: "이점검", registeredAt: "2026-01-05" },
  { id: 3, inspectionDate: "2025-12-23 ~ 2025-12-29", inspector: "박순회", registeredAt: "2025-12-29" },
  { id: 4, inspectionDate: "2025-12-16 ~ 2025-12-22", inspector: "김안전", registeredAt: "2025-12-22" },
  { id: 5, inspectionDate: "2025-12-09 ~ 2025-12-15", inspector: "이점검", registeredAt: "2025-12-15" },
]

interface LoadListDialogProps<T extends ListItem = ListItem> {
  isOpen: boolean
  items: T[]
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  selectedId?: string | number | null
  selectedIds?: (string | number)[]
  onChangeSelected?: (selected: (string | number)[] | string | number | null) => void
  onClose: () => void
  singleSelect?: boolean
  title?: string
  columnLabel?: string
  columns?: ColumnDef<T>[]
  emptyMessage?: string
  searchKeys?: string[]
  actionLabel?: string
  actionDisabled?: boolean | ((item: T) => boolean)
  year?: string
  onYearChange?: (year: string) => void
}

export default function LoadListDialog<T extends ListItem = ListItem>({
  isOpen,
  items,
  selectedId = null,
  selectedIds = [],
  onChangeSelected,
  onClose,
  singleSelect = false,
  title = "위험성평가표 불러오기",
  columnLabel = "위험성평가명",
  columns,
  emptyMessage = "등록된 위험성평가표가 없습니다.",
  searchKeys = ["name"],
  actionLabel = "선택",
  actionDisabled = false,
  year,
  onYearChange,
  page,
  totalPages,
  onPageChange,
}: LoadListDialogProps<T>) {
  const [localPage, setLocalPage] = useState(1)
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear().toString())
  const [searchText, setSearchText] = useState("")
  const itemsPerPage = 10
  const isServerPagination = typeof onPageChange === "function" && typeof totalPages === "number" && typeof page === "number"

  const defaultColumns: ColumnDef<T>[] = [
    { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
    { key: "name", label: columnLabel, align: "left" },
    { key: "registeredAt", label: "등록일", width: "w-24 md:w-28", align: "center", hiddenMobile: true },
  ]

  const finalColumns = columns || defaultColumns

  useEffect(() => {
    if (isOpen) {
      if (isServerPagination) {
        onPageChange?.(1)
      } else {
        setLocalPage(1)
      }
      setSearchText("")
    }
  }, [isOpen, isServerPagination, onPageChange])

  useEffect(() => {
    if (year) setSelectedYear(year)
  }, [year])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (!searchText) return true
      const search = searchText.toLowerCase()
      return searchKeys.some(key => {
        const value = (item as any)[key]
        return value && String(value).toLowerCase().includes(search)
      })
    })
  }, [items, searchText, searchKeys])

  const handleSelect = (item: T) => {
    if (!onChangeSelected) return
    if (singleSelect) {
      onChangeSelected(item.id)
      onClose()
    } else {
      const current = selectedIds || []
      const isSelected = current.includes(item.id)
      const newSelected = isSelected ? current.filter(x => x !== item.id) : [...current, item.id]
      onChangeSelected(newSelected)
    }
  }

  const totalPagesValue = isServerPagination ? totalPages || 1 : Math.ceil(filteredItems.length / itemsPerPage)
  const currentPageValue = isServerPagination ? page || 1 : localPage
  const paginatedList = isServerPagination ? filteredItems : filteredItems.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage)

  const sampleDates = ["2024-05-26", "2024-05-25", "2024-05-24", "2024-05-23", "2024-05-22"]

  if (!isOpen) return null

  const totalColSpan = finalColumns.length + 1

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>{title}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={`${DIALOG_STYLES.searchWrapper} mb-3`}>
          <div className={DIALOG_STYLES.searchInputWrapper}>
            <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색" className={`${DIALOG_STYLES.input} pr-10`} />
            <Search size={18} className={DIALOG_STYLES.searchIcon} />
          </div>
          <YearPicker
            year={selectedYear}
            onChange={value => {
              if (onYearChange) onYearChange(value)
              if (!year) setSelectedYear(value)
            }}
            size="small"
          />
        </div>

        <div className={DIALOG_STYLES.tableContainer}>
          <table className={DIALOG_STYLES.table}>
            <thead className={DIALOG_STYLES.tableHead}>
              <tr className={DIALOG_STYLES.headerBg}>
                {finalColumns.map((col, idx) => (
                  <th key={col.key} className={`${getThClass(idx === 0, col.width || "")} text-${col.align || "center"} ${col.hiddenMobile ? "hidden md:table-cell" : ""}`}>
                    {col.label}
                  </th>
                ))}
                <th className={`${getThClass(false, "w-16 md:w-24")} text-center`}>{actionLabel}</th>
              </tr>
            </thead>
            <tbody className={DIALOG_STYLES.tableBody}>
              {paginatedList.length > 0 ? (
                paginatedList.map((item, index) => {
                  const globalIndex = (currentPageValue - 1) * itemsPerPage + index + 1
                  const isSelected = singleSelect ? selectedId === item.id : selectedIds?.includes(item.id)
                  const isDisabled = typeof actionDisabled === "function" ? actionDisabled(item) : actionDisabled

                  return (
                    <tr key={item.id}>
                      {finalColumns.map((col, idx) => {
                        let content: ReactNode
                        if (col.render) {
                          content = col.render(item, globalIndex)
                        } else if (col.key === "no") {
                          content = globalIndex
                        } else if (col.key === "registeredAt" && !item.registeredAt) {
                          content = sampleDates[index % sampleDates.length]
                        } else {
                          content = (item as any)[col.key]
                        }

                        const textColor = col.key === "registeredAt" ? "secondary" : "primary"
                        return (
                          <td key={col.key} className={`${getTdClass(idx === 0, textColor)} text-${col.align || "center"} ${col.hiddenMobile ? "hidden md:table-cell" : ""}`}>
                            {content}
                          </td>
                        )
                      })}
                      <td className={`border-b ${DIALOG_STYLES.border} border-l ${DIALOG_STYLES.border} px-1 md:px-2 py-2`}>
                        <div className="flex items-center justify-center w-full h-full">
                          <Button variant={isSelected && !singleSelect ? "secondary" : "action"} onClick={() => handleSelect(item)} className="text-[11px] h-[26px] px-2 py-0" disabled={isDisabled}>
                            {isSelected && !singleSelect ? "해제" : actionLabel}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={totalColSpan} className={DIALOG_STYLES.emptyStateTable}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={DIALOG_STYLES.footerCenter}>
          <Pagination currentPage={currentPageValue} totalPages={totalPagesValue} onPageChange={isServerPagination ? onPageChange : setLocalPage} />
        </div>
      </div>
    </div>
  )
}
