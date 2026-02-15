import { useState, useCallback, useMemo } from "react"
import { useApprovalStore } from "@/stores/approvalStore"

const POSITION_HIERARCHY = ["관리감독자", "안전관리자", "보건관리자", "안전보건관리책임자", "경영책임자"]

interface UseApprovalCheckOptions {
  documentType: string
  onApprovalConfirm?: () => void
}

export default function useApproval({ documentType, onApprovalConfirm }: UseApprovalCheckOptions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingSaveCallback, setPendingSaveCallback] = useState<(() => void) | null>(null)
  const [pendingDocumentTitle, setPendingDocumentTitle] = useState("")

  const { isApprovalRequired, getApprovalLine, addApprovalRequest, currentUser } = useApprovalStore()

  const approvalLine = getApprovalLine(documentType)
  const requiresApproval = isApprovalRequired(documentType)

  const filteredApprovers = useMemo(() => {
    if (!approvalLine?.approvers) return ""
    const approvers = (approvalLine.approvers as string).split(" → ")
    const currentUserIndex = POSITION_HIERARCHY.indexOf(currentUser.position)
    const filtered = approvers.filter(approver => {
      const approverIndex = POSITION_HIERARCHY.indexOf(approver)
      return approverIndex > currentUserIndex
    })
    return filtered.join(" → ")
  }, [approvalLine, currentUser.position])

  const checkAndSave = useCallback(
    (saveCallback: () => void, documentTitle: string) => {
      if (requiresApproval && approvalLine) {
        setPendingSaveCallback(() => saveCallback)
        setPendingDocumentTitle(documentTitle)
        setIsDialogOpen(true)
      } else {
        saveCallback()
      }
    },
    [requiresApproval, approvalLine]
  )

  const handleConfirmApproval = useCallback(
    (content: string) => {
      if (approvalLine) {
        const approvers = (approvalLine.approvers as string).split(" → ")
        addApprovalRequest(documentType, content, approvers)
        alert("결재가 요청되었습니다")
      }

      if (pendingSaveCallback) {
        pendingSaveCallback()
      }

      onApprovalConfirm?.()
      setIsDialogOpen(false)
      setPendingSaveCallback(null)
      setPendingDocumentTitle("")
    },
    [approvalLine, addApprovalRequest, documentType, pendingSaveCallback, onApprovalConfirm]
  )

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false)
    setPendingSaveCallback(null)
    setPendingDocumentTitle("")
  }, [])

  return {
    isDialogOpen,
    requiresApproval,
    approvalLine,
    approvalLineName: (approvalLine?.name as string) ?? "",
    approvers: filteredApprovers,
    defaultContent: "",
    checkAndSave,
    handleConfirmApproval,
    handleCancel,
  }
}
