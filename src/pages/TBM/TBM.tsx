import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import Pagination from "@/components/common/base/Pagination"
import AttendeeListDialog from "@/components/dialog/AttendeeListDialog"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useFilterBar from "@/hooks/useFilterBar"
import useHandlers, { useQRSelectionHandlers } from "@/hooks/useHandlers"
import { CirclePlus, Trash2, FileSpreadsheet, Printer, QrCode } from "lucide-react"
import QRDialog from "@/components/QR/QRDialog"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"
import { getTBMList, getTBMDelete, getTBMDetail, TBMListPost, TBMDetailPost } from "@/api/15_TBM/tbm.api"
import { formatDateWithDay } from "@/utils/date"
import { tbmListMockData } from "@/data/mockData"
import { useLoadingStore } from "@/stores/loadingStore"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

interface Attendee {
  name: string
  phone: string
  signed: boolean
  signature?: string
}
interface AttachmentFile {
  name: string
  url: string
}
type TBMRow = DataRow & {
  id: number | string
  tbm: string
  eduDate: string
  eduTime: string
  leader: string
  sitePhotos: string[]
  attendees: Attendee[]
  place: string
  riskAssessment: string
  supervisor: string
  workContent: string
  note: string
  attachmentFiles?: AttachmentFile[]
}

const TAB_LABELS = ["TBM"]
const TAB_PATHS = ["/tbm"]

const getColumns = (onAttendeeClick: (row: TBMRow) => void): Column<TBMRow>[] => [
  { key: "index", label: "번호", type: "index" },
  { key: "tbm", label: "TBM명" },
  { key: "eduDate", label: "실시일" },
  { key: "eduTime", label: "진행시간" },
  {
    key: "attendees",
    label: "참석자",
    align: "center",
    renderCell: row => {
      const attendees = row.attendees || []
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs md:text-[13px] text-gray-800">{attendees.length}명</span>
          <Button
            variant="mutedGray"
            onClick={e => {
              e.stopPropagation()
              onAttendeeClick(row)
            }}
            className="text-[11px] h-[26px] px-2 border cursor-pointer hover:opacity-80"
          >
            보기
          </Button>
        </div>
      )
    },
  },
  { key: "leader", label: "실시자" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "attachments", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

const DEFAULT_COMPANY = "(주)경인EPS 오창공장"

const generateDocNumber = (prefix: string, dateStr?: string) => {
  const date = dateStr ? new Date(dateStr.split("(")[0]) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `${prefix}_${year}${month}${day}_${num}`
}

const createTBMTemplate = (row: TBMRow): DocumentTemplate => ({
  id: `tbm-${row.id}`,
  title: "TBM",
  companyName: DEFAULT_COMPANY,
  documentNumber: generateDocNumber("TBM", row.eduDate),
  createdAt: row.eduDate,
  showApproval: true,
  fields: [
    { label: "작업명", value: row.tbm, type: "text", section: "overview", colSpan: 2 },
    { label: "TBM 일자", value: row.eduDate, type: "date", section: "overview" },
    { label: "TBM 장소", value: row.place || "-", type: "text", section: "overview" },
    { label: "진행시간", value: row.eduTime, type: "text", section: "overview" },
    { label: "위험성평가표", value: row.riskAssessment || "-", type: "text", section: "overview" },
    { label: "관리감독자", value: row.supervisor || "-", type: "text", section: "overview" },
    { label: "참석인원", value: `${row.attendees?.length || 0}명`, type: "text", section: "overview" },
    { label: "작업내용", value: row.workContent || "-", type: "textarea", section: "content" },
    { label: "비고", value: row.note || "-", type: "textarea", section: "content" },
    { label: "첨부파일", value: row.attachmentFiles?.length ? row.attachmentFiles.map(f => f.name) : ["-"], type: "files", section: "content" },
    { label: "현장사진", value: row.sitePhotos || [], type: "photos", section: "content" },
  ],
  participants: row.attendees?.map(a => ({ name: a.name, contact: a.phone, signature: a.signed ? a.signature : undefined })) || [],
})

const mapTbmPostToRow = (post: TBMListPost): TBMRow => {
  const startTime = post.start_time ? post.start_time.slice(0, 5) : ""
  const endTime = post.end_time ? post.end_time.slice(0, 5) : ""
  const eduTime = startTime && endTime ? `${startTime} ~ ${endTime}` : ""
  const attendees: Attendee[] = (post.tbm_target_list || []).map(t => ({
    name: t.target_name,
    phone: t.target_phone,
    signed: t.is_wrap_up === 1,
  }))

  return {
    id: post.id,
    tbm: post.title,
    eduDate: formatDateWithDay(post.tbm_date),
    eduTime,
    leader: post.user_name,
    place: post.place,
    riskAssessment: "",
    supervisor: "",
    workContent: post.contents,
    note: post.memo,
    sitePhotos: (post.photofile || []).map(p => p.url),
    attachments: (post.files || []).length > 0,
    attachmentFiles: (post.files || []).map(f => ({ name: f.url.split("/").pop() || "file", url: f.url })),
    attendees,
  }
}

export default function TBMContent() {
  const navigate = useNavigate()
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [photoPreview, setPhotoPreview] = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 })
  const [attendeeDialog, setAttendeeDialog] = useState<{ open: boolean; attendees: Attendee[] }>({ open: false, attendees: [] })
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrSelectedId, setQrSelectedId] = useState<number | string | null>(null)
  const qrUrl = qrSelectedId ? `${window.location.origin}/public/tbm?id=${qrSelectedId}` : `${window.location.origin}/public/tbm`

  const handleAttendeeClick = (row: TBMRow) => {
    setAttendeeDialog({ open: true, attendees: row.attendees || [] })
  }

  const tbmColumns = getColumns(handleAttendeeClick)
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)


  // 목데이터 모드
  const [mockData, setMockData] = useState<TBMRow[]>(tbmListMockData as TBMRow[])
  const { startDate: mockStartDate, endDate: mockEndDate, searchText: mockSearchText, setStartDate: setMockStartDate, setEndDate: setMockEndDate, setSearchText: setMockSearchText, filteredData: mockFilteredData, handleSearch: mockHandleSearch } = useFilterBar({ data: mockData, dateKey: "eduDate", searchKeys: ["tbm", "leader"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<TBMRow>(mockFilteredData as TBMRow[], 30)

  // API 모드
  const [apiData, setApiData] = useState<TBMRow[]>([])
  const { setLoading } = useLoadingStore()
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchTBMList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getTBMList(params)

      if (response.code === 200) {
        const mappedData = response.posts.map(mapTbmPostToRow)
        setApiData(mappedData)
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 0)
      }
    } catch (error) {
      console.error("TBM 목록 조회 실패:", error)
    } finally {
      setLoading(false)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchTBMList()
    }
  }, [fetchTBMList])

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

  const { currentData: apiCurrentData } = usePagination<TBMRow>(apiData, 30)

  // API 삭제 함수
  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getTBMDelete({ post_id: postIds })

      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchTBMList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }


  // 모드에 따른 변수 선택
  const data = USE_MOCK_DATA ? (mockFilteredData as TBMRow[]) : apiData
  const currentPage = USE_MOCK_DATA ? mockCurrentPage : apiCurrentPage
  const totalPages = USE_MOCK_DATA ? mockTotalPages : Math.max(1, apiTotalPages)
  const currentData = USE_MOCK_DATA ? mockCurrentData : apiCurrentData
  const onPageChange = USE_MOCK_DATA ? mockOnPageChange : setApiCurrentPage
  const startDate = USE_MOCK_DATA ? mockStartDate : apiStartDate
  const endDate = USE_MOCK_DATA ? mockEndDate : apiEndDate
  const searchText = USE_MOCK_DATA ? mockSearchText : apiSearchText
  const setStartDate = USE_MOCK_DATA ? setMockStartDate : setApiStartDate
  const setEndDate = USE_MOCK_DATA ? setMockEndDate : setApiEndDate
  const setSearchText = USE_MOCK_DATA ? setMockSearchText : setApiSearchText
  const handleSearch = USE_MOCK_DATA ? mockHandleSearch : apiHandleSearch

  const {
    handleDelete: mockHandleDelete,
    handleExcelDownload,
    handlePrint,
    isDownloading,
    isPrinting,
  } = useHandlers<TBMRow>({
    data,
    checkedIds: checkedIds,
    onDeleteSuccess: ids => {
      if (USE_MOCK_DATA) {
        setMockData(prev => prev.filter(r => !ids.includes(r.id)))
      }
    },
    createTemplate: createTBMTemplate,
  })

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const { handleOpenQRSelection } = useQRSelectionHandlers<TBMRow>({
    data,
    checkedIds: checkedIds,
    onOpenQRModal: id => {
      setQrSelectedId(id)
      setQrDialogOpen(true)
    },
  })

  return (
    <section className="tbm-content w-full bg-white">
      <PageTitle>TBM</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />
      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <TotalCount count={USE_MOCK_DATA ? data.length : apiTotalCount} />
        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex gap-1 justify-end">
            <Button variant="action" onClick={() => navigate("/tbm/register", { state: { mode: "create" } })} className="flex items-center gap-1">
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
              <Printer size={16} />
              인쇄
            </Button>
            <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
              <FileSpreadsheet size={16} />
              Excel
            </Button>
            <Button variant="action" onClick={() => handleOpenQRSelection("tbm")} className="flex items-center gap-1">
              <QrCode size={16} />
              QR
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button variant="action" onClick={() => navigate("/tbm/register", { state: { mode: "create" } })} className="flex items-center gap-1">
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
            <Printer size={16} />
            인쇄
          </Button>
          <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
            <FileSpreadsheet size={16} />
            Excel
          </Button>
          <Button variant="action" onClick={() => handleOpenQRSelection("tbm")} className="flex items-center gap-1">
            <QrCode size={16} />
            QR
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={tbmColumns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onPhotoClick={row => {
            const imgs = row.sitePhotos || []
            if (imgs.length > 0) setPhotoPreview({ open: true, images: imgs, index: 0 })
          }}
          onManageClick={row => navigate("/tbm/register", { state: { mode: "edit", postId: row.id } })}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <AttendeeListDialog isOpen={attendeeDialog.open} onClose={() => setAttendeeDialog({ open: false, attendees: [] })} attendees={attendeeDialog.attendees} />
      <QRDialog
        open={qrDialogOpen}
        onClose={() => {
          setQrDialogOpen(false)
          setQrSelectedId(null)
        }}
        url={qrUrl}
        title="TBM QR코드"
      />
    </section>
  )
}