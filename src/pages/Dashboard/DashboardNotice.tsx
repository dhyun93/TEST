import React from "react"
import { FileText, ChevronRight, ExternalLink, Image as ImageIcon } from "lucide-react"
import Pagination from "@/components/common/base/Pagination"
import { useNavigate } from "react-router-dom"
import SitePhotoViewer from "@/components/snippet/SitePhotoViewer"
import { noticeMockData, resourcesMockData, lawMockData } from "@/data/mockData"
import type { DataRow } from "@/components/common/tables/DataTable"
import NoticeRegister from "@/pages/NoticeBoard/NoticeRegister"
import ResourcesListRegister from "@/pages/NoticeBoard/ResourcesListRegister"
import LawBoardView from "@/pages/NoticeBoard/LawBoardView"

type RiskPhotoItem = { id: number; kind: "아차사고" | "안전보이스" | "TBM" | "위험성평가"; updated: string; images: string[] }
const riskPhotos: RiskPhotoItem[] = [
  { id: 1, kind: "TBM", updated: "2025-07-15", images: ["/images/photo1.jpg", "/images/photo2.jpg", "/images/photo3.jpg"] },
  { id: 2, kind: "안전보이스", updated: "2025-07-14", images: ["/images/photo4.jpg", "/images/photo5.jpg"] },
  { id: 3, kind: "아차사고", updated: "2025-07-13", images: ["/images/photo6.jpg", "/images/photo7.jpg", "/images/photo8.jpg", "/images/photo9.jpg"] },
  { id: 4, kind: "안전보이스", updated: "2025-07-12", images: ["/images/photo10.jpg"] },
  { id: 5, kind: "아차사고", updated: "2025-07-11", images: ["/images/photo1.jpg", "/images/photo3.jpg", "/images/photo5.jpg"] },
  { id: 6, kind: "위험성평가", updated: "2025-07-10", images: ["/images/photo2.jpg", "/images/photo4.jpg"] },
  { id: 7, kind: "아차사고", updated: "2025-07-09", images: ["/images/photo6.jpg", "/images/photo8.jpg", "/images/photo10.jpg"] },
  { id: 8, kind: "위험성평가", updated: "2025-07-08", images: ["/images/photo7.jpg"] },
  { id: 9, kind: "아차사고", updated: "2025-07-07", images: ["/images/photo9.jpg", "/images/photo1.jpg"] },
  { id: 10, kind: "위험성평가", updated: "2025-07-06", images: ["/images/photo2.jpg", "/images/photo3.jpg", "/images/photo4.jpg", "/images/photo5.jpg", "/images/photo6.jpg"] },
  { id: 11, kind: "아차사고", updated: "2025-07-05", images: ["/images/photo7.jpg", "/images/photo8.jpg"] },
  { id: 12, kind: "안전보이스", updated: "2025-07-04", images: ["/images/photo9.jpg", "/images/photo10.jpg", "/images/photo1.jpg"] },
  { id: 13, kind: "아차사고", updated: "2025-07-03", images: ["/images/photo2.jpg"] },
  { id: 14, kind: "안전보이스", updated: "2025-07-02", images: ["/images/photo3.jpg", "/images/photo4.jpg"] },
  { id: 15, kind: "아차사고", updated: "2025-07-01", images: ["/images/photo5.jpg", "/images/photo6.jpg", "/images/photo7.jpg"] },
  { id: 16, kind: "TBM", updated: "2025-06-30", images: ["/images/photo8.jpg", "/images/photo9.jpg"] },
  { id: 17, kind: "TBM", updated: "2025-06-29", images: ["/images/photo10.jpg", "/images/photo1.jpg", "/images/photo2.jpg", "/images/photo3.jpg"] },
  { id: 18, kind: "안전보이스", updated: "2025-06-28", images: ["/images/photo4.jpg", "/images/photo5.jpg", "/images/photo6.jpg"] },
]

function useIsMdUp() {
  const q = "(min-width: 768px)"
  const [ok, setOk] = React.useState(typeof window !== "undefined" ? window.matchMedia(q).matches : false)
  React.useEffect(() => {
    const mql = window.matchMedia(q)
    const on = (e: MediaQueryListEvent) => setOk(e.matches)
    if (mql.addEventListener) mql.addEventListener("change", on)
    else mql.addListener(on)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", on)
      else mql.removeListener(on)
    }
  }, [])
  return ok
}
function usePagination<T>(items: T[], size: number) {
  const [p, setP] = React.useState(1)
  const total = Math.max(1, Math.ceil(items.length / size))
  React.useEffect(() => {
    if (p > total) p > total && setP(total)
  }, [total, p])
  const start = (p - 1) * size
  return { currentPage: p, setCurrentPage: setP, totalPages: total, pageItems: items.slice(start, start + size), start }
}

const DashboardNotice: React.FC = () => {
  const navigate = useNavigate()
  const TABS = [
    { key: "공지사항", match: "공지사항" },
    { key: "자료실", match: "자료실" },
    { key: "중대재해처벌법", match: "중대재해" },
  ] as const
  const [active, setActive] = React.useState<(typeof TABS)[number]["key"]>("공지사항")
  const [photoViewer, setPhotoViewer] = React.useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 })
  const [viewModal, setViewModal] = React.useState<{ open: boolean; item: DataRow | null; category: string }>({ open: false, item: null, category: "" })
  const getData = (): DataRow[] => (active === "공지사항" ? noticeMockData : active === "자료실" ? resourcesMockData : lawMockData)
  const kindBadgeClass = () => "bg-gray-100 text-gray-700 border border-gray-300"
  const LEFT_PAGE_SIZE = 8
  const leftItems = getData()
  const { currentPage: leftPage, setCurrentPage: leftSet, totalPages: leftTotal, pageItems: leftPageItems } = usePagination<DataRow>(leftItems, LEFT_PAGE_SIZE)
  React.useEffect(() => {
    leftSet(1)
  }, [active])
  const isMdUp = useIsMdUp()
  const rightSize = isMdUp ? 15 : 9
  const { currentPage: rightPage, setCurrentPage: rightSet, totalPages: rightTotal, pageItems: rightItems } = usePagination(riskPhotos, rightSize)
  const handlePhotoClick = (cardImages: string[]) => {
    setPhotoViewer({ open: true, images: cardImages, index: 0 })
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
      <div className="bg-white rounded-[16px] shadow-sm border border-[#E0E6EA] p-2 sm:p-4 flex flex-col md:h-[600px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E3C6B]" />
            <h3 className="text-sm font-semibold text-gray-800">공지/게시판</h3>
          </div>
          <button
            onClick={() => {
              if (active === "공지사항") navigate("/notice-board/notice")
              else if (active === "자료실") navigate("/notice-board/resources")
              else navigate("/notice-board/law")
            }}
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700"
          >
            <span>전체보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] mb-2">
          {TABS.map(t => {
            const c = t.key === "공지사항" ? noticeMockData.length : t.key === "자료실" ? resourcesMockData.length : lawMockData.length
            const a = active === t.key ? "bg-[#F3F6FB] border-[#C9D6EE] text-[#1E3C6B]" : "bg-white border-[#E5E7EB] text-gray-600"
            return (
              <button key={t.key} onClick={() => setActive(t.key)} className={`px-2 py-1 rounded-md border ${a}`}>
                {t.key}
                <span className="ml-1 text-[11px] text-gray-400">{c}</span>
              </button>
            )
          })}
        </div>
        <div className="rounded-xl border border-[#EEF2F6] flex-1 overflow-auto">
          <ul className="divide-y divide-gray-100">
            {leftPageItems.map(item => {
              const handleView = () => setViewModal({ open: true, item, category: active })
              const getSubInfo = () => {
                if (active === "중대재해처벌법")
                  return (
                    <>
                      {item.date}
                      <span className="px-1.5 opacity-50">|</span>
                      {(item as any).organization}
                    </>
                  )
                return (
                  <>
                    {item.date}
                    <span className="px-1.5 opacity-50">|</span>
                    {(item as any).author}
                  </>
                )
              }
              return (
                <li key={item.id} className="px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-gray-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{getSubInfo()}</div>
                    </div>
                    <div className="shrink-0">
                      <button onClick={handleView} className="text-[11px] border border-[#C9D6EE] bg-[#F3F6FB] text-[#1E3C6B] px-2 py-1 rounded-md flex items-center gap-1">
                        <ExternalLink size={13} />
                        보기
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="mt-3 flex justify-center">
          <Pagination currentPage={leftPage} totalPages={leftTotal} onPageChange={leftSet} />
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-sm border border-[#E0E6EA] p-2 sm:p-4 flex flex-col md:h-[600px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#1E3C6B]" />
            <h3 className="text-sm font-semibold text-gray-800">사진게시판</h3>
          </div>
          <span className="text-[11px] text-gray-500">총 {riskPhotos.length}건</span>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {rightItems.map(r => (
              <div key={r.id} className="relative flex flex-col rounded-lg border border-[#EEF2F6] bg-white hover:shadow-md transition overflow-hidden">
                <div className="relative w-full h-24 bg-gray-100 cursor-pointer" onClick={() => handlePhotoClick(r.images)}>
                  <img src={r.images[0]} alt={r.kind} className="w-full h-full object-cover" />
                  {r.images.length > 1 && <span className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">+{r.images.length - 1}</span>}
                </div>
                <div className="p-1 flex flex-col">
                  <span className={`inline-flex w-fit items-center px-1 py-0.5 rounded-md text-[10px] ${kindBadgeClass()}`}>{r.kind}</span>
                  <div className="text-[10px] md:text-[11px] text-gray-500 mt-0.5 truncate">{r.updated}</div>
                </div>
              </div>
            ))}
            {riskPhotos.length === 0 && <div className="col-span-full py-6 text-center text-[12px] text-gray-500">등록된 위험접수가 없습니다</div>}
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <Pagination currentPage={rightPage} totalPages={rightTotal} onPageChange={p => rightSet(Math.min(Math.max(1, p), rightTotal))} />
        </div>
      </div>

      <SitePhotoViewer
        open={photoViewer.open}
        images={photoViewer.images}
        index={photoViewer.index}
        onClose={() => setPhotoViewer({ open: false, images: [], index: 0 })}
        onPrev={() => setPhotoViewer(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }))}
        onNext={() => setPhotoViewer(prev => ({ ...prev, index: Math.min(prev.images.length - 1, prev.index + 1) }))}
      />

      {viewModal.open && viewModal.item && viewModal.category === "공지사항" && (
        <NoticeRegister isOpen={true} onClose={() => setViewModal({ open: false, item: null, category: "" })} userName="" initialData={viewModal.item} />
      )}

      {viewModal.open && viewModal.item && viewModal.category === "자료실" && (
        <ResourcesListRegister isOpen={true} onClose={() => setViewModal({ open: false, item: null, category: "" })} userName="" initialData={viewModal.item} />
      )}

      {viewModal.open && viewModal.item && viewModal.category === "중대재해처벌법" && (
        <LawBoardView isOpen={true} onClose={() => setViewModal({ open: false, item: null, category: "" })} initialData={viewModal.item} />
      )}
    </section>
  )
}

export default DashboardNotice
