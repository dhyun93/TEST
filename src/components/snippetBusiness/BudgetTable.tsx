import React from "react"
import DataTable, { Column } from "@/components/common/tables/DataTable"

export type BudgetItem = {
  id: number
  year: string
  quarter: number
  itemName: string
  category: string
  budget: string
  spent: string
  remaining: string
  carryOver: boolean
  attachment: File | string | null
  author: string
  entryDate: string
  readOnly?: boolean
}

interface Props {
  items: BudgetItem[]
  onChangeField: (id: string | number, field: keyof Omit<BudgetItem, "id" | "year">, value: string | boolean | File) => void
  onCheckedChange?: (checkedIds: (number | string)[]) => void
  cellClassName?: (item: BudgetItem, columnKey: string) => string
  inputClassName?: (item: BudgetItem, columnKey: string) => string
}

export default function BudgetTable({ items, onChangeField, onCheckedChange, cellClassName, inputClassName }: Props) {
  const columns: Column[] = [
    { key: "itemName", label: "항목명", type: "input", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "category", label: "구분", type: "input", maxWidth: 250, disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "budget", label: "예산액", type: "input", maxWidth: 110, disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "spent", label: "집행액", type: "input", maxWidth: 110, disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "remaining", label: "남은예산", type: "input", maxWidth: 110, disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "carryOver", label: "이월여부", type: "toggle", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "attachment", label: "첨부파일", type: "upload", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "author", label: "작성자", type: "input", maxWidth: 80, disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "entryDate", label: "작성일", type: "date", disabledWhenKey: "readOnly", disabledWhenValue: true },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      onCheckedChange={onCheckedChange}
      onInputChange={(id, key, value) => onChangeField(id, key as any, value)}
      onToggleChange={(id, key, value) => onChangeField(id, key as any, value)}
      onUploadChange={(id, key, file) => onChangeField(id, key as any, file)}
      cellClassName={cellClassName ? (row, columnKey) => cellClassName(row as BudgetItem, columnKey) : undefined}
      inputClassName={inputClassName ? (row, columnKey) => inputClassName(row as BudgetItem, columnKey) : undefined}
    />
  )
}
