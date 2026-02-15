import React, { useState, useEffect } from "react"
import Button from "@/components/common/base/Button"
import { Tag } from "@/components/common/base/Badge"
import { X, ChevronRight } from "lucide-react"
import { useApprovalStore } from "@/stores/approvalStore"
import { DIALOG_STYLES } from "./DialogCommon"

interface ApprovalConfirmDialogProps {
  isOpen: boolean
  documentType: string
  approvalLineName: string
  approvers: string
  defaultContent?: string
  onConfirm: (content: string) => void
  onCancel: () => void
}

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <div className={`font-medium ${DIALOG_STYLES.textSecondary}`}>{label}</div>
    <div>{children}</div>
  </>
)

export default function ApprovalConfirmDialog({ isOpen, documentType, approvalLineName, approvers, defaultContent = "", onConfirm, onCancel }: ApprovalConfirmDialogProps) {
  const [content, setContent] = useState(defaultContent)
  const { currentUser } = useApprovalStore()

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  useEffect(() => {
    if (isOpen) {
      setContent(defaultContent)
    }
  }, [isOpen, defaultContent])

  if (!isOpen) return null

  const approverList = approvers.split(" → ")

  const handleConfirm = () => {
    if (!content.trim()) {
      alert("결재내용을 입력해주세요")
      return
    }
    onConfirm(content)
  }

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerMd}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>결재요청</h2>
          <button onClick={onCancel} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={DIALOG_STYLES.contentWithSpace}>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`grid grid-cols-[100px_1fr] gap-y-3 ${DIALOG_STYLES.textSizeTd}`}>
              <InfoRow label="요청일">{today}</InfoRow>
              <InfoRow label="결재유형">{documentType}</InfoRow>
              <InfoRow label="기안자">{currentUser.name}</InfoRow>
              <InfoRow label="결재선">
                <div className="flex items-center flex-wrap gap-1">
                  {approverList.map((approver, idx) => (
                    <span key={idx} className="flex items-center">
                      <Tag>{approver}</Tag>
                      {idx < approverList.length - 1 && <ChevronRight size={14} className="text-gray-400 mx-1.5" />}
                    </span>
                  ))}
                </div>
              </InfoRow>
            </div>
          </div>

          <div>
            <p className={`${DIALOG_STYLES.textSizeTd} font-medium text-gray-700 mb-2`}>결재내용</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="결재내용 입력"
              className={`w-full rounded-lg p-3 ${DIALOG_STYLES.textSizeTd} bg-white ${DIALOG_STYLES.textPrimary} border ${DIALOG_STYLES.border} placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none min-h-[120px]`}
            />
          </div>
        </div>

        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            결재요청
          </Button>
        </div>
      </div>
    </div>
  )
}
