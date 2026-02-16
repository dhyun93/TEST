import { useState, useEffect, useCallback } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import Pagination from "@/components/common/base/Pagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import { Search } from "lucide-react"
import { searchLaws, type LawItem } from "@/api/08_NoticeBoard/law.api"
import LawBoardView from "./LawBoardView"
import TotalCount from "@/components/common/base/TotalCount"

const TAB_LABELS = ["공지사항", "자료실", "중대재해처벌법"]
const TAB_PATHS = ["/notice-board/notice", "/notice-board/resources", "/notice-board/law"]

const PAGE_SIZE = 20

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "title", label: "제목" },
  { key: "organization", label: "소관기관" },
  { key: "date", label: "시행일자" },
  { key: "view", label: "보기", type: "detail" },
]

export default function LawBoard() {
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [data, setData] = useState<DataRow[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("중대재해")
  const [loading, setLoading] = useState(false)
  const [viewItem, setViewItem] = useState<DataRow | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchLaws = useCallback(async (query: string, page: number) => {
    setLoading(true)
    try {
      const result = await searchLaws({ query, page, display: PAGE_SIZE })
      const rows: DataRow[] = (result.data || []).map((item: LawItem) => ({
        id: item.id,
        title: item.title,
        organization: item.organization,
        date: item.date,
        content: item.content,
        fileAttach: item.fileAttach,
        link: item.link,
      }))
      setData(rows)
      setTotal(result.total || 0)
    } catch {
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLaws(searchText, 1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLaws(searchText, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchLaws(searchText, page)
  }

  return (
    <section className="w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-3 flex gap-2 items-end">
        <div className="flex-1">
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="법률 검색어 입력 (예: 중대재해, 산업안전)"
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <Button variant="primary" onClick={handleSearch} disabled={loading} className="h-10 flex items-center gap-1">
          <Search size={16} />
          {loading ? "검색 중..." : "검색"}
        </Button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-1">
        <TotalCount count={total} />
      </div>

      <div className="overflow-x-auto bg-white">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">법률 정보를 불러오는 중...</div>
        ) : (
          <DataTable columns={columns} data={data} onDetailClick={row => setViewItem(row)} />
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {viewItem && <LawBoardView isOpen={true} onClose={() => setViewItem(null)} initialData={viewItem} />}
    </section>
  )
}
