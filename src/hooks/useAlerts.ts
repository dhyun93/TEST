export const ALERT_MESSAGES = {
  noChanges: "변경 사항이 없습니다.",
  requiredFields: "필수 항목을 입력해주세요",
} as const

export const useAlerts = () => {
  const alertNoChanges = (): void => {
    alert(ALERT_MESSAGES.noChanges)
  }
  const alertRequiredFields = (): void => {
    alert(ALERT_MESSAGES.requiredFields)
  }

  return { alertNoChanges, alertRequiredFields }
}
