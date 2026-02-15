type InspectionOption = { value: string; label: string; id?: number }

export const INSPECTION_FIELD_OPTIONS: ReadonlyArray<InspectionOption> = [
  { value: "", label: "점검분야 선택" },
  { id: 0, value: "시설물", label: "시설물" },
  { id: 1, value: "자산(설비)", label: "자산(설비)" },
  { id: 2, value: "자율점검", label: "자율점검" },
]

export const INSPECTION_KIND_OPTIONS: ReadonlyArray<InspectionOption> = [
  { value: "", label: "점검종류 선택" },
  { id: 0, value: "정기점검", label: "정기점검" },
  { id: 1, value: "수시점검", label: "수시점검" },
  { id: 2, value: "특별점검", label: "특별점검" },
  { id: 3, value: "일일점검", label: "일일점검" },
]

export const REPORT_DOCUMENT_TYPE_OPTIONS: ReadonlyArray<InspectionOption> = [
  { value: "", label: "문서종류 선택" },
  { id: 0, value: "TBM", label: "TBM" },
  { id: 1, value: "안전보건교육", label: "안전보건교육" },
  { id: 2, value: "점검표", label: "점검표" },
  { id: 3, value: "아차사고", label: "아차사고" },
  { id: 4, value: "안전보이스", label: "안전보이스" },
  { id: 5, value: "작업중지요청", label: "작업중지요청" },
  { id: 6, value: "대응매뉴얼", label: "대응매뉴얼" },
  { id: 7, value: "위험성평가", label: "위험성평가" },
]

export const CONTRACTOR_DOCUMENT_TYPE_OPTIONS: ReadonlyArray<InspectionOption> = [
  { value: "", label: "문서종류 선택" },
  { id: 0, value: "안전보건수준 평가", label: "안전보건수준 평가" },
  { id: 1, value: "안전보건협의체 회의록", label: "안전보건협의체 회의록" },
  { id: 2, value: "협동 안전보건점검", label: "협동 안전보건점검" },
]
