// 파일URL에서 파일명 추출
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return ""

  const trimmed = url.trim()
  if (!trimmed) return ""

  const withoutHash = trimmed.split("#")[0]
  const withoutQuery = withoutHash.split("?")[0]
  const parts = withoutQuery.split("/").filter(Boolean)
  const last = parts[parts.length - 1] || ""

  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}
