import React, { useState, useRef, useEffect } from "react"
import { X, Check, FileText, Pencil, FolderOpen, RotateCcw, Clock } from "lucide-react"
import Button from "@/components/common/base/Button"
import Badge from "@/components/common/base/Badge"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

export type ReceivedDetail = {
  id: number | string
  date: string
  type: string
  content: string
  drafter: string
  status: "결재대기" | "결재완료" | "반려"
}

export type SentDetail = {
  id: number | string
  date: string
  document: string
  content: string
  status: string
  progress: string
  finalApprover: string
}

type SignatureMode = "draw" | "load"

type ReceivedProps = {
  variant: "received"
  row: ReceivedDetail
  onClose: () => void
  onApprove?: (id: number | string, signature: string, mode: SignatureMode) => void
  onReject?: (id: number | string) => void
  signatureLoadUrl?: string
}
type SentProps = { variant: "sent"; row: SentDetail; onClose: () => void }
type Props = ReceivedProps | SentProps

function SignaturePad({ value, onChange, loadSignatureUrl, onModeChange }: { value: string; onChange: (v: string) => void; loadSignatureUrl?: string; onModeChange?: (mode: SignatureMode) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mode, setMode] = useState<SignatureMode>("draw")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || mode !== "draw") return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [mode])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL("image/png"))
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, rect.width, rect.height)
    onChange("")
  }

  const handleModeChange = (newMode: SignatureMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
    if (newMode === "load") onChange(loadSignatureUrl || "/images/sample-signature.png")
    else onChange("")
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => handleModeChange("draw")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-md transition-colors ${mode === "draw" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Pencil size={16} />
          직접 서명
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("load")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-md transition-colors ${mode === "load" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <FolderOpen size={16} />내 서명 불러오기
        </button>
      </div>
      {mode === "draw" ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none bg-white"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          {!value && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">여기에 서명해주세요</div>}
          {value && (
            <button type="button" onClick={clearCanvas} className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-md border border-gray-200 text-gray-500 hover:text-gray-700">
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
          {value && <img src={value} alt="내 서명" className="max-h-28 max-w-full object-contain" />}
        </div>
      )}
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "결재완료") return <Badge color="blue">결재완료</Badge>
  if (status === "결재대기") return <Badge color="orange">결재대기</Badge>
  if (status === "결재중") return <Badge color="green">결재중</Badge>
  if (status === "반려") return <Badge color="red">반려</Badge>
  return <Badge color="gray">{status}</Badge>
}

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <div className={`font-medium ${DIALOG_STYLES.textSecondary}`}>{label}</div>
    <div>{children}</div>
  </>
)

export default function ApprovalDetail(props: Props) {
  const { variant, row, onClose } = props
  const [signature, setSignature] = useState("")
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw")

  if (variant === "received") {
    const { status } = row
    const isPending = status === "결재대기"
    const isApproved = status === "결재완료"
    const isRejected = status === "반려"

    const handleApprove = () => {
      if (!signature) return alert("서명이 필요합니다.")
      props.onApprove?.(row.id, signature, signatureMode)
    }

    const handleReject = () => {
      if (!signature) return alert("서명이 필요합니다.")
      if (!window.confirm("정말 반려하시겠습니까?")) return
      props.onReject?.(row.id)
      onClose()
    }

    return (
      <div className={DIALOG_STYLES.overlay}>
        <div className={DIALOG_STYLES.containerMd}>
          <div className={DIALOG_STYLES.header}>
            <h2 className={DIALOG_STYLES.title}>결재 상세</h2>
            <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
              <X size={24} />
            </button>
          </div>
          <div className={DIALOG_STYLES.contentWithSpace}>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`grid grid-cols-[100px_1fr] gap-y-3 ${DIALOG_STYLES.textSizeTd}`}>
                <InfoRow label="요청일">{row.date}</InfoRow>
                <InfoRow label="결재유형">{row.type}</InfoRow>
                <InfoRow label="결재내용">{row.content}</InfoRow>
                <InfoRow label="기안자">{row.drafter}</InfoRow>
                <InfoRow label="상태">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {isApproved && <Check size={16} className="text-blue-600" />}
                    {isRejected && <X size={16} className="text-red-600" />}
                  </div>
                </InfoRow>
              </div>
            </div>
            <button className={`flex items-center gap-2 ${DIALOG_STYLES.textSizeTd} ${DIALOG_STYLES.textSecondary} hover:text-gray-700 border ${DIALOG_STYLES.border} rounded-lg p-3 w-full`}>
              <FileText size={16} />
              <span>내용보기</span>
            </button>
            {isPending && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-gray-700 mb-3`}>서명</p>
                  <SignaturePad value={signature} onChange={setSignature} loadSignatureUrl={props.signatureLoadUrl} onModeChange={setSignatureMode} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReject} className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white hover:bg-red-700">
                    <X size={16} />
                    반려
                  </Button>
                  <Button
                    variant="actionPrimary"
                    onClick={handleApprove}
                    // disabled={!signature}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Check size={16} />
                    승인
                  </Button>
                </div>
              </div>
            )}
            {isApproved && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-blue-700`}>결재 완료</p>
                  <p className="text-xs text-blue-600">이 문서는 승인 처리되었습니다</p>
                </div>
              </div>
            )}
            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X size={20} className="text-red-600" />
                </div>
                <div>
                  <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-red-700`}>반려됨</p>
                  <p className="text-xs text-red-600">이 문서는 반려 처리되었습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isComplete = row.status === "결재완료"
  const isRejected = row.status === "반려"
  const isInProgress = row.status === "결재중"
  const isWaiting = row.status === "결재대기"

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>결재 상세</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>
        <div className={DIALOG_STYLES.contentWithSpace}>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`grid grid-cols-[100px_1fr] gap-y-3 ${DIALOG_STYLES.textSizeTd}`}>
              <InfoRow label="기안일">{row.date}</InfoRow>
              <InfoRow label="결재유형">{row.document}</InfoRow>
              <InfoRow label="결재내용">{row.content}</InfoRow>
              <InfoRow label="상태">
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  {isComplete && <Check size={16} className="text-blue-600" />}
                  {isRejected && <X size={16} className="text-red-600" />}
                </div>
              </InfoRow>
              <InfoRow label="결재진행">{row.progress}</InfoRow>
              <InfoRow label="최종결재자">{row.finalApprover}</InfoRow>
            </div>
          </div>
          <button className={`flex items-center gap-2 ${DIALOG_STYLES.textSizeTd} ${DIALOG_STYLES.textSecondary} hover:text-gray-700 border ${DIALOG_STYLES.border} rounded-lg p-3 w-full`}>
            <FileText size={16} />
            <span>내용보기</span>
          </button>
          {isComplete && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Check size={20} className="text-blue-600" />
              </div>
              <div>
                <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-blue-700`}>결재완료</p>
                <p className="text-xs text-blue-600">모든 결재가 완료되었습니다</p>
              </div>
            </div>
          )}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X size={20} className="text-red-600" />
              </div>
              <div>
                <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-red-700`}>반려됨</p>
                <p className="text-xs text-red-600">결재가 반려되었습니다</p>
              </div>
            </div>
          )}
          {isInProgress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-green-700`}>결재 진행중</p>
                <p className="text-xs text-green-600">현재 {row.progress} 단계 진행중입니다.</p>
              </div>
            </div>
          )}
          {isWaiting && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-orange-600" />
              </div>
              <div>
                <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-orange-700`}>결재 대기</p>
                <p className="text-xs text-orange-600">결재자의 승인을 기다리고 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
