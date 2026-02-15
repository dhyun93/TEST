import React, { useState, useMemo, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import FilterBar from "@/components/common/base/FilterBar"
import Pagination from "@/components/common/base/Pagination"
import usePagination from "@/hooks/usePagination"
import useFilterBar from "@/hooks/useFilterBar"
import { Save, Trash2 } from "lucide-react"
import ApprovalDetail, { type SentDetail } from "@/components/snippet/ApprovalDetail"
import { useApprovalStore } from "@/stores/approvalStore"
import { sentApprovalMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { getApprovalDelete, getReceivedApprovalList } from "@/api/13_ApprovalBox/approval"
import { formatDateWithDay } from "@/utils/date"
import { APPROVAL_TYPE_OPTIONS, getApprovalTypeLabelById } from "@/constants/options/approval"

const TAB_LABELS = ["받은결재함", "보낸결재함"]
const TAB_PATHS = ["/approval-box/received", "/approval-box/sent"]
const USE_MOCK_DATA = false

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "date", label: "기안일" },
  { key: "document", label: "결재유형", align: "left" },
  { key: "status", label: "상태", type: "badge" },
  { key: "progress", label: "결재진행" },
  { key: "finalApprover", label: "최종결재자" },
  { key: "detail", label: "보기", type: "detail" },
]

const mapApprovalStatus = (state?: number) => {
  const normalized = Number(state)
  if (normalized === 0) return { text: "결재대기", color: "orange" }
  if (normalized === 1) return { text: "결재중", color: "green" }
  if (normalized === 2) return { text: "결재완료", color: "blue" }
  if (normalized === 3) return { text: "반려", color: "red" }
  return { text: "결재대기", color: "orange" }
}

export default function SentApproval() {
  const navigate = useNavigate()
  const activeIndex = TAB_PATHS.findIndex(p => window.location.pathname.startsWith(p))

  const { sentApprovals, deleteSentApproval } = useApprovalStore()

  const combinedData = useMemo(() => {
    const storeData: DataRow[] = sentApprovals.map(item => ({
      id: item.id,
      date: item.date,
      document: item.documentType,
      content: item.document,
      status: item.status,
      progress: item.progress,
      finalApprover: item.finalApprover,
    }))
    const mockData: DataRow[] = sentApprovalMockData.map(item => ({
      id: item.id,
      date: item.date,
      document: item.documentType || item.document,
      content: item.content || item.document,
      status: item.status,
      progress: item.progress,
      finalApprover: item.finalApprover,
    }))
    return [...storeData, ...mockData]
  }, [sentApprovals])

  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [detail, setDetail] = useState<SentDetail | null>(null)
  const [listData, setListData] = useState<DataRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalPages, setApiTotalPages] = useState(0)
  const [apiTotalCount, setApiTotalCount] = useState(0)

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({
    data: combinedData,
    dateKey: "date",
    searchKeys: ["document", "finalApprover"],
  })
  const { currentPage: mockPage, totalPages: mockTotalPages, currentData: mockData, onPageChange: onMockPageChange } = usePagination<DataRow>(filteredData, 30)

  useEffect(() => {
    if (USE_MOCK_DATA) {
      handleSearch()
    }
  }, [searchText, handleSearch])

  const fetchList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getReceivedApprovalList({
        page: apiCurrentPage,
        start_date: apiFilters.startDate || undefined,
        end_date: apiFilters.endDate || undefined,
        query: apiFilters.searchText || undefined,
        is_send: 1,
      })
      if (response.code === 200) {
        const mapped = response.posts.map((post: any) => ({
          id: post.id,
          date: formatDateWithDay((post.drafting_date || "").slice(0, 10)),
          document: typeof post.category === "number" ? getApprovalTypeLabelById(APPROVAL_TYPE_OPTIONS, post.category) : post.title || "-",
          content: post.contents || post.title || "",
          status: mapApprovalStatus(post.state),
          progress: post.progress !== undefined && post.total_progress !== undefined ? `${post.progress}/${post.total_progress}` : post.progress !== undefined ? String(post.progress) : "-",
          finalApprover: post.final || "-",
        }))
        setListData(mapped)
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 0)
      }
    } catch (error) {
      console.error("보낸결재함 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    const timer = window.setTimeout(() => {
      setApiCurrentPage(1)
      setApiFilters({ startDate, endDate, searchText })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [startDate, endDate, searchText])

  const handleSearchClick = () => {
    if (USE_MOCK_DATA) {
      handleSearch()
      return
    }
    setApiCurrentPage(1)
    setApiFilters({ startDate, endDate, searchText })
  }

  const handleTabClick = (i: number) => {
    navigate(TAB_PATHS[i])
    setCheckedIds([])
  }

  const handleDelete = async () => {
    if (!checkedIds.length) return alert("삭제할 항목을 선택하세요")
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    if (USE_MOCK_DATA) {
      deleteSentApproval(checkedIds)
      setCheckedIds([])
      return
    }
    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getApprovalDelete({ post_id: postIds, is_send: 1 })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("보낸결재함 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDetailClick = (row: DataRow) => {
    const statusText = typeof row.status === "string" ? row.status : row.status?.text
    setDetail({
      id: row.id,
      date: String(row.date),
      document: String(row.document),
      content: String(row.content || row.document),
      status: statusText || "",
      progress: String(row.progress),
      finalApprover: String(row.finalApprover),
    })
  }

  const pageData = USE_MOCK_DATA ? mockData : listData
  const pageTotalCount = USE_MOCK_DATA ? filteredData.length : apiTotalCount
  const pageTotalPages = USE_MOCK_DATA ? mockTotalPages : Math.max(1, apiTotalPages)
  const pageCurrent = USE_MOCK_DATA ? mockPage : apiCurrentPage

  const handlePageChange = (page: number) => {
    if (USE_MOCK_DATA) {
      onMockPageChange(page)
    } else {
      setApiCurrentPage(page)
    }
  }

  return (
    <section className="w-full bg-white">
      <PageTitle>{TAB_LABELS[activeIndex === -1 ? 1 : activeIndex]}</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={activeIndex === -1 ? 1 : activeIndex} onTabClick={handleTabClick} className="mb-6" />

      <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearchClick} />

      <div className="mb-3 flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-2">
        <TotalCount count={pageTotalCount} />
        <div className="flex gap-1 justify-end w-full sm:w-auto">
          <Button variant="action" className="flex gap-1 items-center">
            <Save size={16} />
            다운로드
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex gap-1 items-center">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable columns={columns} data={pageData} onCheckedChange={setCheckedIds} onDetailClick={handleDetailClick} />
      </div>

      <Pagination currentPage={pageCurrent} totalPages={pageTotalPages} onPageChange={handlePageChange} />

      {detail && <ApprovalDetail variant="sent" row={detail} onClose={() => setDetail(null)} />}
    </section>
  )
}
