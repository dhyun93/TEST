import React from "react"
import { pdf } from "@react-pdf/renderer"
import ExcelJS from "exceljs"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import PrintDocument, { DocumentTemplate, DocumentField } from "./PrintDocument"

const getFieldValue = (field: DocumentField): string => {
  if (field.type === "badge") {
    const v = field.value as { text: string; color: string }
    return v?.text || "-"
  }
  if (field.type === "tags" || field.type === "files") {
    const arr = field.value as string[]
    return arr?.length ? arr.join(", ") : "-"
  }
  if (field.type === "photos") return ""
  return (field.value as string) || "-"
}

const imgToBase64 = async (imgUrl: string): Promise<string> => {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1])
    }
    img.onerror = () => resolve("")
    img.src = imgUrl
  })
}

const applyBorderToMergedCells = (ws: ExcelJS.Worksheet, startRow: number, startCol: number, endRow: number, endCol: number, border: Partial<ExcelJS.Borders>) => {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      ws.getCell(r, c).border = border
    }
  }
}

const calcRowHeight = (text: string, baseHeight: number, charsPerLine: number = 35): number => {
  if (!text) return baseHeight
  const lines = text.split("\n").reduce((acc, line) => acc + Math.ceil((line.length || 1) / charsPerLine), 0)
  return Math.max(baseHeight, lines * 16)
}

export const documentActions = {
  async print(template: DocumentTemplate): Promise<void> {
    const blob = await pdf(<PrintDocument template={template} />).toBlob()
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, "_blank")
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
    }
  },

  async printPdf(pdfElement: React.ReactElement): Promise<void> {
    const blob = await pdf(pdfElement).toBlob()
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, "_blank")
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
    }
  },

  async printHtml(element: HTMLElement, options?: { filename?: string; orientation?: "portrait" | "landscape"; fitToOnePage?: boolean }): Promise<void> {
    const { orientation = "portrait", fitToOnePage = false } = options || {}

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const styleSheets: string[] = []
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      styleSheets.push(link.outerHTML)
    })
    document.querySelectorAll("style").forEach(style => {
      styleSheets.push(style.outerHTML)
    })

    const computedStyle = getComputedStyle(document.documentElement)
    const borderColor = computedStyle.getPropertyValue("--border").trim() || "#e5e7eb"
    const primaryColor = computedStyle.getPropertyValue("--primary").trim() || "#2563eb"
    const neutralColor = computedStyle.getPropertyValue("--neutral").trim() || "#6b7280"
    const neutralBgColor = computedStyle.getPropertyValue("--neutral-bg").trim() || "#f3f4f6"

    const clonedElement = element.cloneNode(true) as HTMLElement
    const originalWidth = element.offsetWidth

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>인쇄</title>
${styleSheets.join("\n")}
<style>
:root {
--border: ${borderColor};
--primary: ${primaryColor};
--neutral: ${neutralColor};
--neutral-bg: ${neutralBgColor};
}

* {
-webkit-print-color-adjust: exact !important;
print-color-adjust: exact !important;
}

html, body {
margin: 0;
padding: 0;
background: white;
}

@page {
size: A4 ${orientation};
margin: 10mm;
}

@media print {
body {
width: 100%;
}
}

.print-wrapper {
display: flex;
justify-content: center;
}

.print-content {
width: ${originalWidth}px;
transform-origin: top center;
}

.print\\:hidden,
button:not(.no-hide),
[role="button"]:not(.no-hide) {
display: none !important;
}

input, textarea {
border: none !important;
background: transparent !important;
}

.print-first-page {
page-break-after: always;
}

.print-first-page > .print-page-footer {
margin-top: 12px;
}

.print-photo-page {
page-break-after: always;
min-height: calc(297mm - 20mm);
display: flex;
flex-direction: column;
}

.print-photo-page > .print-page-footer {
margin-top: auto;
}

.print-page-footer {
padding-top: 6px;
border-top: 1px solid #000;
text-align: center;
font-size: 10px;
color: #374151;
}

.print-only {
display: block !important;
}

.hidden.print-only {
display: block !important;
}

.grid {
display: grid;
}
.grid-cols-2 {
grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
grid-template-columns: repeat(3, minmax(0, 1fr));
}
.gap-3 {
gap: 0.75rem;
}
.gap-4 {
gap: 1rem;
}
</style>
</head>
<body>
<div class="print-wrapper">
<div class="print-content">
${clonedElement.outerHTML}
</div>
</div>
<script>
window.onload = function() {
const content = document.querySelector('.print-content');
const fitToOnePage = ${fitToOnePage};
const a4Width = ${orientation === "portrait" ? "794" : "1123"};
const a4Height = ${orientation === "portrait" ? "1123" : "794"};
const margin = 40;
const availableWidth = a4Width - margin;
const availableHeight = a4Height - margin;
const originalWidth = ${originalWidth};
const contentHeight = content.scrollHeight;

let scale;
if (fitToOnePage) {
const scaleX = availableWidth / originalWidth;
const scaleY = availableHeight / contentHeight;
scale = Math.min(scaleX, scaleY, 1.0);
} else {
scale = availableWidth / originalWidth;
scale = Math.min(scale, 1.0);
}

content.style.transform = 'scale(' + scale + ')';
setTimeout(function() {
window.print();
window.close();
}, 300);
};
</script>
</body>
</html>
`)
    printWindow.document.close()
  },

  async downloadHtmlAsPdf(element: HTMLElement, options?: { filename?: string; orientation?: "portrait" | "landscape" }): Promise<void> {
    const { filename = "document", orientation = "portrait" } = options || {}

    const a4Width = orientation === "portrait" ? 210 : 297
    const a4Height = orientation === "portrait" ? 297 : 210
    const margin = 10
    const contentWidth = a4Width - margin * 2
    const contentHeight = a4Height - margin * 2

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    const pdfDoc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    })

    const widthRatio = contentWidth / (imgWidth * 0.264583)
    const heightRatio = contentHeight / (imgHeight * 0.264583)
    const ratio = Math.min(widthRatio, heightRatio, 1)

    const scaledWidth = imgWidth * 0.264583 * ratio
    const scaledHeight = imgHeight * 0.264583 * ratio

    const x = (a4Width - scaledWidth) / 2
    const y = (a4Height - scaledHeight) / 2

    pdfDoc.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight)
    pdfDoc.save(`${filename}.pdf`)
  },

  async downloadExcel(template: DocumentTemplate, docNumber: string): Promise<void> {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("문서", {
      pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
    })

    const border: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    }

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 10, name: "맑은 고딕" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } },
      border,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    }

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { size: 10, name: "맑은 고딕" },
      border,
      alignment: { vertical: "middle", horizontal: "left", wrapText: true },
    }

    ws.columns = [{ width: 16 }, { width: 28 }, { width: 16 }, { width: 28 }]

    const mainFields = template.fields.filter(f => f.type !== "photos")
    const overviewFields = mainFields.filter(f => f.section === "overview")
    const contentFields = mainFields.filter(f => f.section === "content")
    const resultFields = mainFields.filter(f => f.section === "result")
    const allPhotos = template.fields.filter(f => f.type === "photos").flatMap(f => (f.value as string[]) || [])

    let row = 1
    const ROW_HEIGHT = 24

    ws.getRow(row).height = 8
    row++

    ws.mergeCells(row, 1, row, 4)
    ws.getCell(row, 1).value = template.title
    ws.getCell(row, 1).style = { font: { bold: true, size: 18, name: "맑은 고딕" }, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getRow(row).height = 30
    row++

    ws.mergeCells(row, 1, row, 2)
    ws.getCell(row, 1).value = template.companyName || ""
    ws.getCell(row, 1).style = { font: { size: 10, name: "맑은 고딕" }, alignment: { vertical: "middle" }, border }
    applyBorderToMergedCells(ws, row, 1, row, 2, border)
    ws.getCell(row, 3).value = "문서번호"
    ws.getCell(row, 3).style = headerStyle
    ws.getCell(row, 4).value = docNumber
    ws.getCell(row, 4).style = cellStyle
    ws.getRow(row).height = ROW_HEIGHT
    row++

    ws.mergeCells(row, 1, row, 2)
    ws.getCell(row, 1).value = ""
    applyBorderToMergedCells(ws, row, 1, row, 2, border)
    ws.getCell(row, 3).value = "작성일"
    ws.getCell(row, 3).style = headerStyle
    ws.getCell(row, 4).value = template.createdAt || ""
    ws.getCell(row, 4).style = cellStyle
    ws.getRow(row).height = ROW_HEIGHT
    row++

    ws.getRow(row).height = 8
    row++

    for (let i = 0; i < overviewFields.length; i += 2) {
      const f1 = overviewFields[i]
      const f2 = overviewFields[i + 1]
      const val1 = getFieldValue(f1)
      const val2 = f2 ? getFieldValue(f2) : ""

      ws.getCell(row, 1).value = f1.label
      ws.getCell(row, 1).style = headerStyle
      ws.getCell(row, 2).value = val1
      ws.getCell(row, 2).style = cellStyle

      if (f2) {
        ws.getCell(row, 3).value = f2.label
        ws.getCell(row, 3).style = headerStyle
        ws.getCell(row, 4).value = val2
        ws.getCell(row, 4).style = cellStyle
      } else {
        ws.mergeCells(row, 2, row, 4)
        applyBorderToMergedCells(ws, row, 2, row, 4, border)
        ws.getCell(row, 2).style = cellStyle
      }

      const maxHeight = Math.max(calcRowHeight(val1, ROW_HEIGHT), calcRowHeight(val2, ROW_HEIGHT))
      ws.getRow(row).height = maxHeight
      row++
    }

    contentFields.forEach(field => {
      const val = getFieldValue(field)
      ws.getCell(row, 1).value = field.label
      ws.getCell(row, 1).style = headerStyle
      ws.mergeCells(row, 2, row, 4)
      ws.getCell(row, 2).value = val
      ws.getCell(row, 2).style = cellStyle
      applyBorderToMergedCells(ws, row, 2, row, 4, border)
      ws.getRow(row).height = calcRowHeight(val, ROW_HEIGHT)
      row++
    })

    if (allPhotos.length > 0) {
      ws.getCell(row, 1).value = "현장사진"
      ws.getCell(row, 1).style = headerStyle
      ws.mergeCells(row, 2, row, 4)
      ws.getCell(row, 2).value = `${allPhotos.length}장 (아래 참조)`
      ws.getCell(row, 2).style = cellStyle
      applyBorderToMergedCells(ws, row, 2, row, 4, border)
      ws.getRow(row).height = ROW_HEIGHT
      row++
    }

    if (resultFields.length > 0) {
      resultFields.forEach(field => {
        const val = getFieldValue(field)
        ws.getCell(row, 1).value = field.label
        ws.getCell(row, 1).style = headerStyle
        ws.mergeCells(row, 2, row, 4)
        ws.getCell(row, 2).value = val
        ws.getCell(row, 2).style = cellStyle
        applyBorderToMergedCells(ws, row, 2, row, 4, border)
        ws.getRow(row).height = calcRowHeight(val, ROW_HEIGHT)
        row++
      })
    }

    ws.getRow(row).height = 10
    row++

    ws.getCell(row, 2).value = ""
    ws.getCell(row, 2).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getCell(row, 3).value = ""
    ws.getCell(row, 3).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getCell(row, 4).value = ""
    ws.getCell(row, 4).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getRow(row).height = 18
    row++

    ws.getCell(row, 2).value = ""
    ws.getCell(row, 2).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getCell(row, 3).value = ""
    ws.getCell(row, 3).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getCell(row, 4).value = ""
    ws.getCell(row, 4).style = { border, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getRow(row).height = 28
    row++

    if (allPhotos.length > 0) {
      ws.getRow(row).height = 15
      row++

      for (let i = 0; i < allPhotos.length; i++) {
        const photoBase64 = await imgToBase64(allPhotos[i])
        if (photoBase64) {
          const photoId = wb.addImage({ base64: photoBase64, extension: "jpeg" })
          ws.addImage(photoId, { tl: { col: 0.5, row: row - 0.5 }, ext: { width: 280, height: 180 } })
          ws.getRow(row).height = 140
          row++

          ws.mergeCells(row, 1, row, 4)
          ws.getCell(row, 1).value = `사진 ${i + 1}`
          ws.getCell(row, 1).style = { font: { size: 9, name: "맑은 고딕" }, alignment: { vertical: "middle", horizontal: "center" } }
          ws.getRow(row).height = 16
          row++

          ws.getRow(row).height = 10
          row++
        }
      }
    }

    if (template.participants?.length) {
      const ws2 = wb.addWorksheet("참여자명단", {
        pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      })
      ws2.columns = [{ width: 10 }, { width: 20 }, { width: 24 }, { width: 16 }]

      ws2.getRow(1).height = 10

      ws2.mergeCells(2, 1, 2, 4)
      ws2.getCell(2, 1).value = `${template.title} - 참여자 명단`
      ws2.getCell(2, 1).style = { font: { bold: true, size: 14, name: "맑은 고딕" }, alignment: { vertical: "middle", horizontal: "center" }, border }
      applyBorderToMergedCells(ws2, 2, 1, 2, 4, border)
      ws2.getRow(2).height = 32

      ws2.getRow(3).height = 8

      const headers = ["번호", "성명", "연락처", "서명"]
      headers.forEach((h, i) => {
        ws2.getCell(4, i + 1).value = h
        ws2.getCell(4, i + 1).style = headerStyle
      })
      ws2.getRow(4).height = ROW_HEIGHT

      template.participants.forEach((p, i) => {
        const r = 5 + i
        ws2.getCell(r, 1).value = i + 1
        ws2.getCell(r, 1).style = { ...cellStyle, alignment: { vertical: "middle", horizontal: "center" } }
        ws2.getCell(r, 2).value = p.name
        ws2.getCell(r, 2).style = { ...cellStyle, alignment: { vertical: "middle", horizontal: "center" } }
        ws2.getCell(r, 3).value = p.contact
        ws2.getCell(r, 3).style = { ...cellStyle, alignment: { vertical: "middle", horizontal: "center" } }
        ws2.getCell(r, 4).value = p.signature ? "서명완료" : ""
        ws2.getCell(r, 4).style = { ...cellStyle, alignment: { vertical: "middle", horizontal: "center" } }
        ws2.getRow(r).height = ROW_HEIGHT
      })
    }

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${docNumber}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  async getExcelBuffer(template: DocumentTemplate): Promise<ArrayBuffer> {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("문서", {
      pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
    })

    const border: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    }

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 10, name: "맑은 고딕" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } },
      border,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    }

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { size: 10, name: "맑은 고딕" },
      border,
      alignment: { vertical: "middle", horizontal: "left", wrapText: true },
    }

    ws.columns = [{ width: 16 }, { width: 28 }, { width: 16 }, { width: 28 }]

    const mainFields = template.fields.filter(f => f.type !== "photos")
    const overviewFields = mainFields.filter(f => f.section === "overview")
    const contentFields = mainFields.filter(f => f.section === "content")
    const resultFields = mainFields.filter(f => f.section === "result")

    let row = 1
    const ROW_HEIGHT = 24

    ws.getRow(row).height = 8
    row++

    ws.mergeCells(row, 1, row, 4)
    ws.getCell(row, 1).value = template.title
    ws.getCell(row, 1).style = { font: { bold: true, size: 18, name: "맑은 고딕" }, alignment: { vertical: "middle", horizontal: "center" } }
    ws.getRow(row).height = 30
    row++

    ws.mergeCells(row, 1, row, 2)
    ws.getCell(row, 1).value = template.companyName || ""
    ws.getCell(row, 1).style = { font: { size: 10, name: "맑은 고딕" }, alignment: { vertical: "middle" }, border }
    applyBorderToMergedCells(ws, row, 1, row, 2, border)
    ws.getCell(row, 3).value = "문서번호"
    ws.getCell(row, 3).style = headerStyle
    ws.getCell(row, 4).value = template.documentNumber || ""
    ws.getCell(row, 4).style = cellStyle
    ws.getRow(row).height = ROW_HEIGHT
    row++

    ws.mergeCells(row, 1, row, 2)
    ws.getCell(row, 1).value = ""
    applyBorderToMergedCells(ws, row, 1, row, 2, border)
    ws.getCell(row, 3).value = "작성일"
    ws.getCell(row, 3).style = headerStyle
    ws.getCell(row, 4).value = template.createdAt || ""
    ws.getCell(row, 4).style = cellStyle
    ws.getRow(row).height = ROW_HEIGHT
    row++

    ws.getRow(row).height = 8
    row++

    for (let i = 0; i < overviewFields.length; i += 2) {
      const f1 = overviewFields[i]
      const f2 = overviewFields[i + 1]
      const val1 = getFieldValue(f1)
      const val2 = f2 ? getFieldValue(f2) : ""

      ws.getCell(row, 1).value = f1.label
      ws.getCell(row, 1).style = headerStyle
      ws.getCell(row, 2).value = val1
      ws.getCell(row, 2).style = cellStyle

      if (f2) {
        ws.getCell(row, 3).value = f2.label
        ws.getCell(row, 3).style = headerStyle
        ws.getCell(row, 4).value = val2
        ws.getCell(row, 4).style = cellStyle
      } else {
        ws.mergeCells(row, 2, row, 4)
        applyBorderToMergedCells(ws, row, 2, row, 4, border)
        ws.getCell(row, 2).style = cellStyle
      }

      const maxHeight = Math.max(calcRowHeight(val1, ROW_HEIGHT), calcRowHeight(val2, ROW_HEIGHT))
      ws.getRow(row).height = maxHeight
      row++
    }

    contentFields.forEach(field => {
      const val = getFieldValue(field)
      ws.getCell(row, 1).value = field.label
      ws.getCell(row, 1).style = headerStyle
      ws.mergeCells(row, 2, row, 4)
      ws.getCell(row, 2).value = val
      ws.getCell(row, 2).style = cellStyle
      applyBorderToMergedCells(ws, row, 2, row, 4, border)
      ws.getRow(row).height = calcRowHeight(val, ROW_HEIGHT)
      row++
    })

    if (resultFields.length > 0) {
      resultFields.forEach(field => {
        const val = getFieldValue(field)
        ws.getCell(row, 1).value = field.label
        ws.getCell(row, 1).style = headerStyle
        ws.mergeCells(row, 2, row, 4)
        ws.getCell(row, 2).value = val
        ws.getCell(row, 2).style = cellStyle
        applyBorderToMergedCells(ws, row, 2, row, 4, border)
        ws.getRow(row).height = calcRowHeight(val, ROW_HEIGHT)
        row++
      })
    }

    const buffer = await wb.xlsx.writeBuffer()
    return buffer as ArrayBuffer
  },
}
