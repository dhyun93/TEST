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
import ApprovalDetail, { type ReceivedDetail } from "@/components/snippet/ApprovalDetail"
import { useApprovalStore } from "@/stores/approvalStore"
import { receivedApprovalMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { getApprovalDelete, getReceivedApprovalList, sign_receivedApproval } from "@/api/13_ApprovalBox/approval"
import { formatDateWithDay } from "@/utils/date"
import { APPROVAL_TYPE_OPTIONS, getApprovalTypeLabelById } from "@/constants/options/approval"
import { getBaseManageInfo } from "@/api/10_BusinessManagement/01_Basic"
import { buildMediaUrl } from "@/utils/media"

const TAB_LABELS = ["받은결재함", "보낸결재함"]
const TAB_PATHS = ["/approval-box/received", "/approval-box/sent"]
const USE_MOCK_DATA = false

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "date", label: "요청일" },
  { key: "type", label: "결재유형" },
  { key: "content", label: "결재내용", align: "left" },
  { key: "drafter", label: "기안자" },
  { key: "status", label: "상태", type: "badge" },
  { key: "detail", label: "보기", type: "detail" },
]

const mapReceivedApprovalStatus = (state?: number) => {
  const normalized = Number(state)
  if (normalized === 0) return { text: "결재대기", color: "orange" }
  if (normalized === 1) return { text: "결재완료", color: "blue" }
  if (normalized === 2) return { text: "반려", color: "red" }
  return { text: "결재대기", color: "orange" }
}

const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [header, body] = dataUrl.split(",")
  if (!header || !body) return null
  const match = header.match(/data:(.*);base64/)
  if (!match) return null
  const mime = match[1]
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], fileName, { type: mime })
}

export default function ReceivedApproval() {
  const navigate = useNavigate()
  const activeIndex = TAB_PATHS.findIndex(p => window.location.pathname.startsWith(p))

  const { receivedApprovals, approveRequest, rejectRequest, deleteReceivedApproval } = useApprovalStore()

  const combinedData = useMemo(() => {
    const storeData: DataRow[] = receivedApprovals.map(item => ({
      id: item.id,
      date: item.date,
      type: item.type,
      content: item.content,
      drafter: item.drafter,
      status: item.status,
    }))
    return [...storeData, ...receivedApprovalMockData]
  }, [receivedApprovals])

  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [detail, setDetail] = useState<ReceivedDetail | null>(null)
  const [listData, setListData] = useState<DataRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalPages, setApiTotalPages] = useState(0)
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [signatureUrl, setSignatureUrl] = useState("")

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({
    data: combinedData,
    dateKey: "date",
    searchKeys: ["type", "content", "drafter"],
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
        is_send: 0,
      })
      if (response.code === 200) {
        const mapped = response.posts.map((post: any) => ({
          id: post.id,
          date: formatDateWithDay((post.drafting_date || "").slice(0, 10)),
          type: typeof post.category === "number" ? getApprovalTypeLabelById(APPROVAL_TYPE_OPTIONS, post.category) : "-",
          content: post.contents || post.title || "",
          drafter: post.dafter || post.final || "",
          status: mapReceivedApprovalStatus(post.is_wrap_up),
        }))
        setListData(mapped)
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 0)
      }
    } catch (error) {
      console.error("받은결재함 목록 조회 실패:", error)
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

  useEffect(() => {
    if (USE_MOCK_DATA) return
    const fetchSignature = async () => {
      try {
        const response = await getBaseManageInfo()
        if (response.code === 200) {
          setSignatureUrl(buildMediaUrl(response.posts?.seal || ""))
        }
      } catch (error) {
        console.error("기본사업장 서명 조회 실패:", error)
      }
    }
    fetchSignature()
  }, [])

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
      deleteReceivedApproval(checkedIds)
      setCheckedIds([])
      return
    }
    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getApprovalDelete({ post_id: postIds, is_send: 0 })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("받은결재함 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDetailClick = (row: DataRow) => {
    const statusText = typeof row.status === "string" ? row.status : row.status?.text
    setDetail({
      id: row.id,
      date: String(row.date),
      type: String(row.type),
      content: String(row.content),
      drafter: String(row.drafter),
      status: (statusText || "결재대기") as "결재대기" | "결재완료" | "반려",
    })
  }

  const fileFromUrl = async (url: string) => {
    const resolvedUrl = buildMediaUrl(url)
    const res = await fetch(resolvedUrl)
    const blob = await res.blob()
    const contentType = blob.type || "image/png"
    const name = resolvedUrl.split("/").pop() || "seal.png"
    return new File([blob], name, { type: contentType })
  }

  const resolveSignatureFile = async (signature: string) => {
    if (!signature) return null
    if (signature.startsWith("data:")) return dataUrlToFile(signature, "seal.png")
    return fileFromUrl(signature)
  }

  const handleApprove = async (id: number | string, signature: string, mode: "draw" | "load") => {
    if (USE_MOCK_DATA) {
      approveRequest(id as number)
      setDetail(null)
      return
    }
    try {
      if (mode === "load") {
        const response = await sign_receivedApproval({ post_id: Number(id), my_seal: 1, is_wrap_up: 1 })
        if (response.code === 200) {
          alert(response.msg || "결재가 승인되었습니다")
          setDetail(null)
          fetchList()
        } else {
          alert(response.msg || "결재 승인에 실패했습니다.")
        }
        return
      }

      const file = await resolveSignatureFile(signature)
      if (!file) {
        alert("서명 파일을 생성할 수 없습니다.")
        return
      }
      const response = await sign_receivedApproval({ post_id: Number(id), seal: file, my_seal: 0, is_wrap_up: 1 })
      if (response.code === 200) {
        alert(response.msg || "결재가 승인되었습니다")
        setDetail(null)
        fetchList()
      } else {
        alert(response.msg || "결재 승인에 실패했습니다.")
      }
    } catch (error) {
      console.error("결재 승인 실패:", error)
      alert("결재 승인에 실패했습니다.")
    }
  }

  const handleReject = async (id: number | string) => {
    if (USE_MOCK_DATA) {
      rejectRequest(id as number)
      setDetail(null)
      return
    }
    try {
      const response = await sign_receivedApproval({ post_id: Number(id), my_seal: 1, is_wrap_up: 2 })
      if (response.code === 200) {
        alert(response.msg || "결재가 반려되었습니다")
        setDetail(null)
        fetchList()
      } else {
        alert(response.msg || "결재 반려에 실패했습니다.")
      }
    } catch (error) {
      console.error("결재 반려 실패:", error)
      alert("결재 반려에 실패했습니다.")
    }
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
      <PageTitle>{TAB_LABELS[activeIndex === -1 ? 0 : activeIndex]}</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={activeIndex === -1 ? 0 : activeIndex} onTabClick={handleTabClick} className="mb-6" />

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

      {detail && <ApprovalDetail variant="received" row={detail} onClose={() => setDetail(null)} onApprove={handleApprove} onReject={handleReject} signatureLoadUrl={signatureUrl} />}
    </section>
  )
}
