import React from "react"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import CustomSelect from "@/components/common/base/CustomSelect"
import InfoBox from "@/components/common/base/InfoBox"
import { DocumentApprovalSetting } from "@/data/mockBusinessData"

interface ApprovalLineOption {
  id: number | string
  name: string
  steps: string
}

interface Props {
  settings: DocumentApprovalSetting[]
  approvalLines: ApprovalLineOption[] | DataRow[]
  onToggleApproval: (id: number, value: boolean) => void
  onApprovalLineChange: (id: number, value: string) => void
}

const MANAGEMENT_DOC_TYPES = ["경영방침", "안전보건 목표 및 추진계획", "안전보건예산"]

export default function ApprovalDocTable({ settings, approvalLines, onToggleApproval, onApprovalLineChange }: Props) {
  const columns: Column<DataRow>[] = [
    { key: "approvalType", label: "결재 유형", minWidth: 200, maxWidth: 200 },
    { key: "useApproval", label: "결재문서 지정", type: "toggle", minWidth: 140, maxWidth: 140 },
    {
      key: "approvalLineId",
      label: "적용 결재선",
      minWidth: 250,
      renderCell: row => {
        const options = [
          { value: "", label: "결재선 선택" },
          ...approvalLines.map(line => ({
            value: String(line.id),
            label: `${line.name} (${line.steps})`,
          })),
        ]
        return !row.useApproval ? (
          <select
            value={row.approvalLineId ?? ""}
            disabled
            className="w-full border border-[var(--border)] rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <option value="">결재선 선택</option>
            {approvalLines.map(line => (
              <option key={line.id} value={line.id}>
                {line.name} ({line.steps})
              </option>
            ))}
          </select>
        ) : (
          <CustomSelect value={String(row.approvalLineId ?? "")} onChange={v => onApprovalLineChange(row.id as number, v)} options={options} />
        )
      },
    },
  ]

  const documentSettings = settings.filter(s => !MANAGEMENT_DOC_TYPES.includes(s.approvalType))
  const managementSettings = settings.filter(s => MANAGEMENT_DOC_TYPES.includes(s.approvalType))

  const documentData: DataRow[] = documentSettings.map(s => ({
    id: s.id,
    approvalType: s.approvalType,
    useApproval: s.useApproval,
    approvalLineId: s.approvalLineId,
  }))

  const managementData: DataRow[] = managementSettings.map(s => ({
    id: s.id,
    approvalType: s.approvalType,
    useApproval: s.useApproval,
    approvalLineId: s.approvalLineId,
  }))

  return (
    <>
      <div className="mb-6">
        <InfoBox message="결재문서 지정을 활성화하면 해당 문서 작성 시 선택된 결재선에 따라 결재 프로세스가 진행됩니다." />
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-2">안전문서</h3>
      <DataTable columns={columns} data={documentData} selectable={false} onToggleChange={(id, _key, value) => onToggleApproval(id as number, value)} />

      <h3 className="text-sm font-semibold text-gray-800 mt-6 mb-2">경영문서</h3>
      <DataTable columns={columns} data={managementData} selectable={false} onToggleChange={(id, _key, value) => onToggleApproval(id as number, value)} />
    </>
  )
}
