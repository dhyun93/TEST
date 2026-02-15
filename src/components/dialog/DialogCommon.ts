export const DIALOG_STYLES = {
  overlay: "fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50 p-4",
  overlayHighZ: "fixed top-[60px] left-0 right-0 bottom-0 z-[250] flex items-center justify-center bg-black/50 p-4",

  container: "bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",
  containerSm: "bg-white rounded-2xl w-full max-w-[420px] p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",
  containerMd: "bg-white rounded-2xl w-full max-w-[600px] p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",
  containerLg: "bg-white rounded-2xl w-full max-w-[800px] p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",
  containerXl: "bg-white rounded-2xl w-full max-w-[900px] p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",
  containerFull: "bg-white rounded-2xl w-full max-w-[1200px] p-4 md:p-6 shadow-2xl max-h-[calc(100vh-120px)] flex flex-col relative",

  header: "flex items-center justify-between mb-3 h-[36px] shrink-0",
  headerWithBorder: "flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)] shrink-0",

  title: "text-base md:text-lg font-semibold tracking-tight text-gray-800",

  closeButton: "p-1 hover:bg-[var(--neutral-bg)] rounded transition text-[var(--neutral)]",

  content: "flex-1 overflow-auto pb-3",
  contentWithSpace: "flex-1 overflow-auto pb-3 space-y-4",

  footer: "flex justify-center items-center pt-3 shrink-0 gap-1",
  footerCenter: "flex justify-center items-center pt-3 shrink-0 gap-1",
  footerEnd: "flex justify-end items-center pt-3 shrink-0 gap-1",

  border: "border-[var(--border)]",
  headerBg: "bg-[var(--neutral-bg)]",
  textPrimary: "text-gray-800",
  textSecondary: "text-gray-500",
  textSizeTh: "text-sm",
  textSizeTd: "text-xs md:text-[13px]",
  cellPadding: "px-2 md:px-4 py-2",
  thPadding: "px-2 md:px-4 py-1.5 md:py-2",

  input: "w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-white placeholder:text-gray-500",

  table: "w-full border-separate border-spacing-0",
  tableContainer: "flex-1 overflow-auto mb-4 border border-[var(--border)] rounded-lg",
  tableHead: "sticky top-0 z-10",
  tableBody: "bg-white",
  tableRowHover: "hover:bg-gray-50 transition-colors",

  listContainer: "flex-1 overflow-auto border border-[var(--border)] rounded-lg",
  listDivider: "divide-y divide-[var(--border)]",
  listItem: "px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition",
  listItemText: "text-sm font-medium text-gray-800",

  emptyState: "p-8 text-center text-gray-400 text-sm",
  emptyStateTable: "p-12 text-xs md:text-[13px] text-gray-400 text-center",

  searchWrapper: "flex items-center justify-between mb-4",
  searchInputWrapper: "relative w-[200px]",
  searchIcon: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",

  cardItem: "border border-[var(--border)] rounded-lg p-3",
}

export const getThClass = (isFirst = false, width = "") => {
  const base = `border-b border-[var(--border)] ${DIALOG_STYLES.thPadding} ${DIALOG_STYLES.textSizeTh} font-medium ${DIALOG_STYLES.textSecondary}`
  const borderLeft = isFirst ? "" : "border-l border-[var(--border)]"
  const widthClass = width ? width : ""
  return `${base} ${borderLeft} ${widthClass}`.trim()
}

export const getTdClass = (isFirst = false, textColor = "primary") => {
  const base = `border-b border-[var(--border)] ${DIALOG_STYLES.cellPadding} ${DIALOG_STYLES.textSizeTd}`
  const borderLeft = isFirst ? "" : "border-l border-[var(--border)]"
  const color = textColor === "primary" ? DIALOG_STYLES.textPrimary : DIALOG_STYLES.textSecondary
  return `${base} ${borderLeft} ${color}`.trim()
}
