export const USER_LEVEL_LABELS: Record<number, string> = {
  0: "일반(해당없음)",
  1: "안전보건관리책임자",
  2: "안전관리자",
  3: "보건관리자",
  4: "관리감독자",
  5: "경영책임자",
}

export const getUserLevelLabel = (level?: number | null): string => {
  if (typeof level !== "number") return USER_LEVEL_LABELS[0]
  return USER_LEVEL_LABELS[level] ?? USER_LEVEL_LABELS[0]
}
