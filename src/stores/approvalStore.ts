import { create } from "zustand"
import { documentApprovalSettingsMockData, approvalLineMockData, DocumentApprovalSetting } from "@/data/mockBusinessData"
import { DataRow } from "@/components/common/tables/DataTable"

interface SentApprovalItem {
  id: number
  date: string
  document: string
  documentType: string
  status: { text: string; color: string }
  progress: string
  finalApprover: string
  approvers: string[]
  currentStep: number
}

interface ReceivedApprovalItem {
  id: number
  date: string
  type: string
  content: string
  drafter: string
  status: { text: string; color: string }
  sentApprovalId: number
}

interface ApprovalState {
  currentUser: { name: string; position: string }
  settings: DocumentApprovalSetting[]
  approvalLines: DataRow[]
  sentApprovals: SentApprovalItem[]
  receivedApprovals: ReceivedApprovalItem[]

  setCurrentUser: (user: { name: string; position: string }) => void
  updateSetting: (id: number, updates: Partial<DocumentApprovalSetting>) => void
  isApprovalRequired: (documentType: string) => boolean
  getApprovalLine: (documentType: string) => DataRow | null
  addApprovalRequest: (documentType: string, documentTitle: string, approvers: string[]) => void
  approveRequest: (receivedId: number) => void
  rejectRequest: (receivedId: number) => void
  deleteReceivedApproval: (ids: (number | string)[]) => void
  deleteSentApproval: (ids: (number | string)[]) => void
}

const POSITION_HIERARCHY = ["관리감독자", "안전관리자", "보건관리자", "안전보건관리책임자", "경영책임자"]

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  currentUser: { name: "박대표", position: "경영책임자" },
  settings: documentApprovalSettingsMockData,
  approvalLines: approvalLineMockData,
  sentApprovals: [],
  receivedApprovals: [],

  setCurrentUser: user => set({ currentUser: user }),

  updateSetting: (id, updates) =>
    set(state => ({
      settings: state.settings.map(s => (s.id === id ? { ...s, ...updates } : s)),
    })),

  isApprovalRequired: documentType => {
    const setting = get().settings.find(s => s.approvalType === documentType)
    return setting?.useApproval ?? false
  },

  getApprovalLine: documentType => {
    const setting = get().settings.find(s => s.approvalType === documentType)
    if (!setting?.approvalLineId) return null
    return get().approvalLines.find(line => line.id === setting.approvalLineId) ?? null
  },

  addApprovalRequest: (documentType, documentTitle, approvers) => {
    const { currentUser } = get()
    const today = new Date().toISOString().split("T")[0]
    const sentId = Date.now()

    // 현재 사용자 직위 이후의 결재자만 필터링
    const currentUserIndex = POSITION_HIERARCHY.indexOf(currentUser.position)
    const filteredApprovers = approvers.filter(approver => {
      const approverIndex = POSITION_HIERARCHY.indexOf(approver)
      return approverIndex > currentUserIndex
    })

    if (filteredApprovers.length === 0) {
      alert("결재할 상위 결재자가 없습니다.")
      return
    }

    const sentItem: SentApprovalItem = {
      id: sentId,
      date: today,
      document: documentTitle,
      documentType,
      status: { text: "결재대기", color: "orange" },
      progress: `0/${filteredApprovers.length}`,
      finalApprover: filteredApprovers[filteredApprovers.length - 1],
      approvers: filteredApprovers,
      currentStep: 0,
    }

    const receivedItem: ReceivedApprovalItem = {
      id: Date.now() + 1,
      date: today,
      type: documentType,
      content: documentTitle,
      drafter: currentUser.name,
      status: { text: "결재대기", color: "orange" },
      sentApprovalId: sentId,
    }

    set(state => ({
      sentApprovals: [sentItem, ...state.sentApprovals],
      receivedApprovals: [receivedItem, ...state.receivedApprovals],
    }))
  },

  approveRequest: receivedId => {
    const state = get()
    const received = state.receivedApprovals.find(r => r.id === receivedId)
    if (!received) return

    const sent = state.sentApprovals.find(s => s.id === received.sentApprovalId)
    if (!sent) return

    const newStep = sent.currentStep + 1
    const isComplete = newStep >= sent.approvers.length

    set(state => ({
      receivedApprovals: state.receivedApprovals.map(r => (r.id === receivedId ? { ...r, status: { text: "결재완료", color: "blue" } } : r)),
      sentApprovals: state.sentApprovals.map(s =>
        s.id === received.sentApprovalId
          ? {
              ...s,
              currentStep: newStep,
              progress: `${newStep}/${s.approvers.length}`,
              status: isComplete ? { text: "결재완료", color: "blue" } : { text: "결재중", color: "green" },
            }
          : s
      ),
    }))

    if (!isComplete && sent.approvers[newStep]) {
      const today = new Date().toISOString().split("T")[0]
      const newReceived: ReceivedApprovalItem = {
        id: Date.now(),
        date: today,
        type: sent.documentType,
        content: sent.document,
        drafter: state.currentUser.name,
        status: { text: "결재대기", color: "orange" },
        sentApprovalId: sent.id,
      }

      set(state => ({
        receivedApprovals: [newReceived, ...state.receivedApprovals],
      }))
    }
  },

  rejectRequest: receivedId => {
    const state = get()
    const received = state.receivedApprovals.find(r => r.id === receivedId)
    if (!received) return

    set(state => ({
      receivedApprovals: state.receivedApprovals.map(r => (r.id === receivedId ? { ...r, status: { text: "반려", color: "red" } } : r)),
      sentApprovals: state.sentApprovals.map(s => (s.id === received.sentApprovalId ? { ...s, status: { text: "반려", color: "red" } } : s)),
    }))
  },

  deleteReceivedApproval: ids =>
    set(state => ({
      receivedApprovals: state.receivedApprovals.filter(r => !ids.includes(r.id)),
    })),

  deleteSentApproval: ids =>
    set(state => ({
      sentApprovals: state.sentApprovals.filter(s => !ids.includes(s.id)),
    })),
}))
