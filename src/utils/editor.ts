export const stripRichText = (value: string): string => {
  if (!value) return ""
  return value
    .replace(/\r\n/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export const hasRichTextContent = (value: string): boolean => {
  return stripRichText(value).length > 0
}
