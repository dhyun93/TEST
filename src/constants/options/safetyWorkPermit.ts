export const RISK_LEVEL_OPTIONS = [
  { id: 0, value: "낮음", label: "낮음" },
  { id: 1, value: "중간", label: "중간" },
  { id: 2, value: "높음", label: "높음" },
] as const

export const riskLevelToLabel = (level: number): string =>
  RISK_LEVEL_OPTIONS.find(opt => opt.id === level)?.label ?? ""

export const labelToRiskLevel = (label: string): number =>
  RISK_LEVEL_OPTIONS.find(opt => opt.label === label)?.id ?? 0
