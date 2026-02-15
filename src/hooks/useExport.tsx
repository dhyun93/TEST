import React, { useState } from "react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { useCompanyStore } from "@/stores/companyStore"
import { PrintDocument, DocumentTemplate, documentActions } from "@/docExport"
import { pdf } from "@react-pdf/renderer"
import { PDFDocument } from "pdf-lib"

export { documentActions }

export interface UseDocumentExportParams<T = any> {
  data: T[]
  checkedIds: (number | string)[]
  createTemplate: (row: T, index: number) => DocumentTemplate
  excelFileNamePrefix?: string
}

export interface DocumentExportHandlers {
  handleExcelDownload: () => Promise<void>
  handlePrint: () => Promise<void>
  isDownloading: boolean
  isPrinting: boolean
}

export function useDocumentExport<T = any>({ data, checkedIds, createTemplate, excelFileNamePrefix }: UseDocumentExportParams<T>): DocumentExportHandlers {
  const { factoryName } = useCompanyStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const getSelectedRows = () => data.filter((item: any) => checkedIds.includes(item.id)) as T[]

  const applyCompanyName = (template: DocumentTemplate): DocumentTemplate => ({
    ...template,
    companyName: template.companyName || factoryName,
  })

  const getCategoryName = (template: DocumentTemplate): string => {
    return template.title.replace(/\s*(문서|목록|현황|결과|평가|점검|일지)$/g, "").trim()
  }

  const handleExcelDownload = async (): Promise<void> => {
    if (checkedIds.length === 0) {
      alert("항목을 선택하세요")
      return
    }
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const rows = getSelectedRows()
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const firstTemplate = applyCompanyName(createTemplate(rows[0], 0))
      const categoryName = excelFileNamePrefix || getCategoryName(firstTemplate)

      if (rows.length === 1) {
        await documentActions.downloadExcel(firstTemplate, `${categoryName}_${today}`)
      } else {
        const zip = new JSZip()
        for (let i = 0; i < rows.length; i++) {
          const template = applyCompanyName(createTemplate(rows[i], i))
          const buffer = await documentActions.getExcelBuffer(template)
          const fileName = `${categoryName}_${today}_${i + 1}.xlsx`
          zip.file(fileName, buffer)
        }
        const zipBlob = await zip.generateAsync({ type: "blob" })
        saveAs(zipBlob, `${categoryName}_${today}.zip`)
      }
    } catch (e) {
      alert("오류가 발생했습니다")
    }
    setIsDownloading(false)
  }

  const handlePrint = async (): Promise<void> => {
    if (checkedIds.length === 0) {
      alert("인쇄할 항목을 선택해주세요")
      return
    }
    if (isPrinting) return
    setIsPrinting(true)
    try {
      const rows = getSelectedRows()
      if (rows.length === 1) {
        const template = applyCompanyName(createTemplate(rows[0], 0))
        await documentActions.print(template)
      } else {
        const pdfBuffers: ArrayBuffer[] = []
        for (const row of rows) {
          const template = applyCompanyName(createTemplate(row, 0))
          const blob = await pdf(<PrintDocument template={template} />).toBlob()
          const buffer = await blob.arrayBuffer()
          pdfBuffers.push(buffer)
        }
        if (pdfBuffers.length > 0) {
          const mergedPdf = await PDFDocument.create()
          for (const buffer of pdfBuffers) {
            const pdfDoc = await PDFDocument.load(buffer)
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
            pages.forEach(page => mergedPdf.addPage(page))
          }
          const mergedBytes = await mergedPdf.save()
          const mergedBlob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" })
          const url = URL.createObjectURL(mergedBlob)
          const printWindow = window.open(url, "_blank")
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.focus()
              printWindow.print()
            }
          }
        }
      }
    } catch (e) {
      alert("인쇄 중 오류가 발생했습니다")
    }
    setIsPrinting(false)
  }

  return {
    handleExcelDownload,
    handlePrint,
    isDownloading,
    isPrinting,
  }
}
