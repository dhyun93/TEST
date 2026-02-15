import React from "react"
import DataTable, { Column } from "@/components/common/tables/DataTable"

export type InspectionItem = {
  id: number
  year: string
  detailPlan: string
  q1: boolean
  q2: boolean
  q3: boolean
  q4: boolean
  KPI: string
  department: string
  achievementRate: string
  resultRemark: string
  entryDate: string
  readOnly?: boolean
}

interface Props {
  items: InspectionItem[]
  onChangeField: (id: number | string, field: keyof Omit<InspectionItem, "id">, value: string | boolean) => void
  onCheckedChange?: (checkedIds: (number | string)[]) => void
  cellClassName?: (item: InspectionItem, columnKey: string) => string
  inputClassName?: (item: InspectionItem, columnKey: string) => string
}

export default function InspectionTable({ items, onChangeField, onCheckedChange, cellClassName, inputClassName }: Props) {
  const columns: Column[] = [
    { key: "detailPlan", label: "목표/세부추진계획", type: "input", placeholder: "목표 또는 세부추진계획을 입력하세요", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "q1", label: "1분기", type: "checkbox", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "q2", label: "2분기", type: "checkbox", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "q3", label: "3분기", type: "checkbox", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "q4", label: "4분기", type: "checkbox", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "KPI", label: "성과지표", type: "input", placeholder: "예: 1회/년 이상", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "department", label: "담당부서", type: "input", placeholder: "담당부서 입력", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "achievementRate", label: "달성률%", type: "percent", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "resultRemark", label: "실적/부진사유", type: "input", placeholder: "실적 또는 부진사유 입력", disabledWhenKey: "readOnly", disabledWhenValue: true },
    { key: "entryDate", label: "작성일", type: "date", disabledWhenKey: "readOnly", disabledWhenValue: true },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      onCheckedChange={onCheckedChange}
      onInputChange={(id, key, value) => onChangeField(id, key as keyof Omit<InspectionItem, "id">, value)}
      onToggleChange={(id, key, value) => onChangeField(id, key as keyof Omit<InspectionItem, "id">, value)}
      cellClassName={cellClassName ? (row, columnKey) => cellClassName(row as InspectionItem, columnKey) : undefined}
      inputClassName={inputClassName ? (row, columnKey) => inputClassName(row as InspectionItem, columnKey) : undefined}
    />
  )
}
