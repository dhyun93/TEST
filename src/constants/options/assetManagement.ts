// 부식성 유무 (is_corrosiveness)
export const CORROSIVENESS_OPTIONS = [
  { id: 1, value: "예", label: "예" },
  { id: 0, value: "아니오", label: "아니오" },
] as const

export const corrosivenessToLabel = (id: number): string =>
  CORROSIVENESS_OPTIONS.find(opt => opt.id === id)?.label ?? "아니오"

export const labelToCorrosiveness = (label: string): number =>
  CORROSIVENESS_OPTIONS.find(opt => opt.label === label)?.id ?? 0

// 알림 발송시점 (alarm_time)
export const ALARM_TIME_OPTIONS = [
  { id: 0, value: "1일 전", label: "1일 전" },
  { id: 1, value: "1주일 전", label: "1주일 전" },
  { id: 2, value: "1개월 전", label: "1개월 전" },
] as const

export const alarmTimeToLabel = (id: number): string =>
  ALARM_TIME_OPTIONS.find(opt => opt.id === id)?.label ?? "1일 전"

export const labelToAlarmTime = (label: string): number =>
  ALARM_TIME_OPTIONS.find(opt => opt.label === label)?.id ?? 0

// 점검주기 (inspection_interval)
export const INSPECTION_INTERVAL_OPTIONS = [
  { id: 0, value: "상시", label: "상시" },
  { id: 1, value: "주간", label: "주간" },
  { id: 2, value: "월간", label: "월간" },
  { id: 3, value: "분기", label: "분기" },
  { id: 4, value: "연간", label: "연간" },
  { id: 5, value: "2년", label: "2년" },
  { id: 6, value: "3년", label: "3년" },
] as const

export const inspectionIntervalToLabel = (id: number): string =>
  INSPECTION_INTERVAL_OPTIONS.find(opt => opt.id === id)?.label ?? "상시"

export const labelToInspectionInterval = (label: string): number =>
  INSPECTION_INTERVAL_OPTIONS.find(opt => opt.label === label)?.id ?? 0
