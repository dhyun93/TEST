export type ApprovalOption = { id: number; value: string; label: string }

export const APPROVAL_TYPE_OPTIONS: ReadonlyArray<ApprovalOption> = [
  { id: 0, value: "위험성평가", label: "위험성평가" },
  { id: 1, value: "작업중지요청", label: "작업중지요청" },
  { id: 2, value: "TBM", label: "TBM" },
  { id: 3, value: "안전점검", label: "안전점검" },
  { id: 4, value: "안전보건교육", label: "안전보건교육" },
]

export const getApprovalTypeLabelById = (options: ReadonlyArray<ApprovalOption>, id?: number | null): string => {
  if (id === null || id === undefined) return ""
  const exact = options.find(option => option.id === id)
  if (exact) return exact.label
  const shifted = options.find(option => option.id === id - 1)
  if (shifted) return shifted.label
  return String(id)
}
