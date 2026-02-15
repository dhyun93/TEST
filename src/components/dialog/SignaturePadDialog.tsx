import React, { useRef, useEffect, useState } from "react"
import { X, RotateCcw, Upload } from "lucide-react"
import { DIALOG_STYLES } from "./DialogCommon"

interface SignaturePadDialogProps {
  isOpen: boolean
  onSave: (dataUrl: string) => void
  onClose: () => void
  title?: string
}

export default function SignaturePadDialog({ isOpen, onSave, onClose, title = "서명" }: SignaturePadDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.scale(2, 2)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    }

    const timer = setTimeout(initCanvas, 50)
    return () => clearTimeout(timer)
  }, [isOpen])

  const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    } else {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
  }

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return
    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return
    const pos = getPosition(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const img = new Image()
    img.onload = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, rect.width, rect.height)

      const scale = Math.min(rect.width / img.width, rect.height / img.height) * 0.8
      const x = (rect.width - img.width * scale) / 2
      const y = (rect.height - img.height * scale) / 2
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      setHasDrawn(true)
    }
    img.src = URL.createObjectURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const saveSignature = () => {
    if (!hasDrawn) {
      alert("서명을 입력해주세요.")
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL("image/png"))
    setHasDrawn(false)
  }

  const handleClose = () => {
    setHasDrawn(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className="bg-white rounded-lg w-[90%] max-w-sm mx-4">
        <div className={`flex items-center justify-between p-3 border-b ${DIALOG_STYLES.border}`}>
          <span className={`text-sm font-semibold ${DIALOG_STYLES.textPrimary}`}>{title}</span>
          <button onClick={handleClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className="p-3">
          <div className={`relative border ${DIALOG_STYLES.border} rounded-lg overflow-hidden bg-white`}>
            <canvas
              ref={canvasRef}
              className="w-full h-40 touch-none cursor-crosshair"
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            {!hasDrawn && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">여기에 서명해주세요</div>}
            {hasDrawn && (
              <button
                type="button"
                onClick={clearCanvas}
                className={`absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-md border ${DIALOG_STYLES.border} text-gray-500 hover:text-gray-700`}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
        <div className={`flex gap-2 p-3 border-t ${DIALOG_STYLES.border}`}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-2 rounded-lg border ${DIALOG_STYLES.border} text-gray-600 text-xs font-medium flex items-center justify-center gap-1`}
          >
            <Upload size={14} />
            불러오기
          </button>
          <button onClick={saveSignature} className="flex-1 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium">
            확인
          </button>
        </div>
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>
    </div>
  )
}
