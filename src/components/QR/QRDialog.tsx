import React from "react"
import { QRCodeSVG } from "qrcode.react"
import { X, Download, Printer } from "lucide-react"
import Button from "@/components/common/base/Button"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

interface QRDialogProps {
  open: boolean
  url: string
  title?: string
  onClose: () => void
}

export default function QRDialog({ open, url, title = "점검 QR코드", onClose }: QRDialogProps) {
  if (!open) return null

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `inspection-qr-${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)

    printWindow.document.write(`
<html>
<head><title>${title}</title></head>
<body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<h2 style="margin-bottom:20px;font-family:sans-serif;">${title}</h2>
${svgData}
<p style="margin-top:20px;font-size:12px;color:#666;font-family:sans-serif;word-break:break-all;max-width:300px;text-align:center;">${url}</p>
</body>
</html>
`)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-5 max-w-xs w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <QRCodeSVG id="qr-code-svg" value={url} size={180} level="H" includeMargin />
          </div>

          <p className="text-[11px] text-gray-400 text-center break-all px-2">{url}</p>

          <div className="flex gap-2 w-full">
            <Button variant="action" onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 text-xs">
              <Download size={14} />
              저장
            </Button>
            <Button variant="action" onClick={handlePrint} className="flex-1 flex items-center justify-center gap-1 text-xs">
              <Printer size={14} />
              인쇄
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose} className="w-full text-xs">
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
