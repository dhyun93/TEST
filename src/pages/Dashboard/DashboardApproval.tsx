import React, { useMemo } from "react"
import { ClipboardCheck, Inbox, Send, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ApprovalDetail, { type ReceivedDetail, type SentDetail } from "@/components/snippet/ApprovalDetail"
import { useApprovalStore } from "@/stores/approvalStore"
import { receivedApprovalMockData, sentApprovalMockData } from "@/data/mockData"

type ApprovalStatus = "결재대기" | "결재완료" | "결재중" | "반려"
type ApprovalItem = { id: number | string; title: string; counterpart: string; date: string; status: ApprovalStatus; documentType?: string; content?: string }
type ModalState = { variant: "received"; row: ReceivedDetail } | { variant: "sent"; row: SentDetail }

const statusChip = (st: ApprovalStatus) =>
  ({ 결재대기: "bg-[#FFF8EF] text-[#EE680F]", 결재완료: "bg-[#E8F4FD] text-[#1E5A99]", 결재중: "bg-[#DEFBE8] text-[#1F5F36]", 반려: "bg-[#FEE2E2] text-[#DC2626]" })[st]

const ApprovalsTrayCard: React.FC = () => {
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<"inbox" | "sent">("inbox")
  const [modal, setModal] = React.useState<ModalState | null>(null)

  const { receivedApprovals, sentApprovals } = useApprovalStore()

  const inbox: ApprovalItem[] = useMemo(() => {
    const storeItems = receivedApprovals.map(item => ({
      id: item.id,
      title: item.content,
      counterpart: item.drafter,
      date: item.date,
      status: item.status.text as ApprovalStatus,
    }))
    const mockItems = receivedApprovalMockData.map(item => ({
      id: item.id as number,
      title: String(item.content),
      counterpart: String(item.drafter),
      date: String(item.date),
      status: (item.status as { text: string }).text as ApprovalStatus,
    }))
    return [...storeItems, ...mockItems]
  }, [receivedApprovals])

  const sent: ApprovalItem[] = useMemo(() => {
    const storeItems = sentApprovals.map(item => ({
      id: item.id,
      title: item.document,
      documentType: item.documentType,
      content: item.document,
      counterpart: item.finalApprover,
      date: item.date,
      status: item.status.text as ApprovalStatus,
    }))
    const mockItems = sentApprovalMockData.map(item => ({
      id: item.id as number,
      title: String(item.content || item.document),
      documentType: String(item.documentType || item.document),
      content: String(item.content || item.document),
      counterpart: String(item.finalApprover),
      date: String(item.date),
      status: (item.status as { text: string }).text as ApprovalStatus,
    }))
    return [...storeItems, ...mockItems]
  }, [sentApprovals])

  const allowedByTab: Record<"inbox" | "sent", Set<ApprovalStatus>> = {
    inbox: new Set<ApprovalStatus>(["결재완료", "결재대기", "반려"]),
    sent: new Set<ApprovalStatus>(["결재중", "결재대기", "결재완료", "반려"]),
  }

  const raw = tab === "inbox" ? inbox : sent
  const visible = raw.filter(it => allowedByTab[tab].has(it.status))
  const limit = Math.min(10, visible.length)
  const goAll = () => navigate(tab === "inbox" ? "/approval-box/received" : "/approval-box/sent")

  const openDetail = (item: ApprovalItem) => {
    if (tab === "inbox") {
      const row: ReceivedDetail = { id: item.id, date: item.date, type: "결재문서", content: item.title, drafter: item.counterpart, status: item.status as "결재대기" | "결재완료" | "반려" }
      setModal({ variant: "received", row })
    } else {
      const row: SentDetail = {
        id: item.id,
        date: item.date,
        document: item.documentType || item.title,
        content: item.content || item.title,
        status: item.status,
        progress: "-",
        finalApprover: item.counterpart,
      }
      setModal({ variant: "sent", row })
    }
  }

  return (
    <section className="bg-white rounded-[16px] p-2 sm:p-3 shadow-sm border border-[#E0E6EA] flex flex-col lg:h-[623px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5 text-[#1E3C6B]" />
          <h3 className="text-[13px] font-semibold text-gray-800">결재함</h3>
        </div>
        <button type="button" onClick={goAll} className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition">
          <span>전체보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <button
          onClick={() => setTab("inbox")}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 border ${tab === "inbox" ? "bg-[#F3F6FB] border-[#C9D6EE] text-[#1E3C6B]" : "bg-white border-[#E5E7EB] text-gray-600"}`}
        >
          <Inbox className="w-3.5 h-3.5" /> 받은결재함
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 border ${tab === "sent" ? "bg-[#F3F6FB] border-[#C9D6EE] text-[#1E3C6B]" : "bg-white border-[#E5E7EB] text-gray-600"}`}
        >
          <Send className="w-3.5 h-3.5" /> 보낸결재함
        </button>
      </div>
      <div className="mt-2 rounded-xl border border-[#EEF2F6]">
        <ul className="divide-y divide-gray-100">
          {visible.slice(0, limit).map(it => (
            <li
              key={it.id}
              role="button"
              tabIndex={0}
              onClick={() => openDetail(it)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openDetail(it)
                }
              }}
              className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">{it.title}</div>
                  <div className="text-[11px] text-gray-500">
                    {it.counterpart}
                    <span className="px-1.5 opacity-50">|</span>
                    {it.date}
                  </div>
                </div>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusChip(it.status)}`}>{it.status}</span>
            </li>
          ))}
        </ul>
      </div>
      {modal && <ApprovalDetail variant={modal.variant} row={modal.row as any} onClose={() => setModal(null)} />}
    </section>
  )
}

const DashboardApproval: React.FC = () => (
  <div className="flex flex-col">
    <ApprovalsTrayCard />
  </div>
)

export default DashboardApproval
