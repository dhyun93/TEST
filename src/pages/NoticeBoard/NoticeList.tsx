import React, { useCallback, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import FilterBar from "@/components/common/base/FilterBar"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useHandlers from "@/hooks/useHandlers"
import NoticeRegister from "./NoticeRegister"
import { CirclePlus, Trash2 } from "lucide-react"
import { noticeMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { formatDateWithDay } from "@/utils/date"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getNoticeList,
  deleteNotice,
  registNotice,
  NoticeListPost,
  NoticeListRequest,
  NoticeFile,
} from "@/api/08_NoticeBoard/noticeList.api"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

const TAB_LABELS = ["공지사항", "자료실", "중대재해처벌법"]
const TAB_PATHS = ["/notice-board/notice", "/notice-board/resources", "/notice-board/law"]

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "title", label: "제목" },
  { key: "author", label: "작성자" },
  { key: "date", label: "작성일" },
  { key: "views", label: "조회수" },
  { key: "fileAttach", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type NoticeRow = DataRow & {
  id: number | string
  title: string
  author: string
  content: string
  date: string
  dateRaw: string
  views: number
  fileAttach: NoticeFile[] | boolean
  files: NoticeFile[]
}

// API response to table row mapping
const mapNoticePostToRow = (post: NoticeListPost): NoticeRow => {
  const rawDate = post.date || (post.created_at ? post.created_at.slice(0, 10) : "")
  const p = post as NoticeListPost & { user_name?: string; view_count?: number }
  return {
    id: post.id,
    title: post.title,
    author: p.user_name ?? "",   // 백엔드 응답 대기 (user_name)
    content: post.contents || "",
    date: formatDateWithDay(rawDate),
    dateRaw: rawDate,
    views: p.view_count ?? 0,    // 백엔드 응답 대기 (view_count)
    fileAttach: post.photofile,
    files: post.photofile || [],
  }
}

export default function NoticeBoard() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<NoticeRow | null>(null)
  const userName = "관리자"

  // mock
  const [mockData, setMockData] = useState<NoticeRow[]>(noticeMockData as NoticeRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "date", searchKeys: ["title", "author"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<NoticeRow>(mockFilteredData, 30)

  // BE API
  const [apiData, setApiData] = useState<NoticeRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchNoticeList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: NoticeListRequest = { page: apiCurrentPage, is_notice: 1 }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getNoticeList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapNoticePostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("공지사항 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchNoticeList()
  }, [fetchNoticeList])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    const timer = window.setTimeout(() => {
      setApiCurrentPage(1)
      setApiFilters({ startDate: apiStartDate, endDate: apiEndDate, searchText: apiSearchText })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [apiStartDate, apiEndDate, apiSearchText])

  const apiHandleSearch = () => {
    setApiCurrentPage(1)
    setApiFilters({ startDate: apiStartDate, endDate: apiEndDate, searchText: apiSearchText })
  }

  // 데이터 분기
  const data = USE_MOCK_DATA ? (mockFilteredData as NoticeRow[]) : apiData
  const setData = USE_MOCK_DATA ? setMockData : setApiData
  const currentPage = USE_MOCK_DATA ? mockCurrentPage : apiCurrentPage
  const totalPages = USE_MOCK_DATA ? mockTotalPages : Math.max(1, apiTotalPages)
  const currentData = USE_MOCK_DATA ? mockCurrentData : apiData
  const onPageChange = USE_MOCK_DATA ? mockOnPageChange : setApiCurrentPage
  const startDate = USE_MOCK_DATA ? mockStartDate : apiStartDate
  const endDate = USE_MOCK_DATA ? mockEndDate : apiEndDate
  const searchText = USE_MOCK_DATA ? mockSearchText : apiSearchText
  const setStartDate = USE_MOCK_DATA ? setMockStartDate : setApiStartDate
  const setEndDate = USE_MOCK_DATA ? setMockEndDate : setApiEndDate
  const setSearchText = USE_MOCK_DATA ? setMockSearchText : setApiSearchText
  const handleSearch = USE_MOCK_DATA ? mockHandleSearch : apiHandleSearch

  const { handleDelete: mockHandleDelete } = useHandlers({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(r => !ids.includes(r.id))),
  })

  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await deleteNotice({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchNoticeList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("공지사항 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleCreate = () => {
    setIsEditMode(false)
    setSelectedRow(null)
    setModalOpen(true)
  }

  const handleSave = async (item: { title: string; content: string; newFiles: File[]; keepFileIds: number[] }) => {
    if (!window.confirm("저장하시겠습니까?")) return
    const today = new Date().toISOString().slice(0, 10)

    if (USE_MOCK_DATA) {
      if (isEditMode && selectedRow) {
        setData(prev => prev.map(row => (row.id === selectedRow.id ? { ...row, title: item.title, content: item.content, author: userName } : row)))
      } else {
        const newId = data.length > 0 ? Math.max(...data.map(d => Number(d.id))) + 1 : 1
        const newData: NoticeRow = {
          id: newId,
          title: item.title,
          author: userName,
          content: item.content,
          date: formatDateWithDay(today),
          dateRaw: today,
          views: 0,
          fileAttach: item.newFiles.length > 0,
          files: [],
        }
        setData(prev => [newData, ...prev])
      }
      setModalOpen(false)
      setIsEditMode(false)
      return
    }

    try {
      setLoading(true)
      const response = await registNotice({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        title: item.title,
        contents: item.content,
        date: selectedRow?.dateRaw || today,
        is_notice: 1,
        photo_id: item.keepFileIds,
        photofiles: item.newFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setModalOpen(false)
        setIsEditMode(false)
        fetchNoticeList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("공지사항 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-1">
        <TotalCount count={USE_MOCK_DATA ? data.length : apiTotalCount} />

        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex flex-nowrap gap-1 justify-end">
            <Button variant="action" onClick={handleCreate} className="flex items-center gap-1">
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>

        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button variant="action" onClick={handleCreate} className="flex items-center gap-1">
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={columns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onManageClick={row => {
            setSelectedRow(row as NoticeRow)
            setIsEditMode(true)
            setModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {modalOpen && (
        <NoticeRegister
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setIsEditMode(false)
            setSelectedRow(null)
          }}
          onSave={handleSave}
          userName={userName}
          isEdit={isEditMode}
          initialData={
            selectedRow
              ? {
                  id: selectedRow.id,
                  title: selectedRow.title,
                  author: selectedRow.author,
                  content: selectedRow.content,
                  files: selectedRow.files,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
