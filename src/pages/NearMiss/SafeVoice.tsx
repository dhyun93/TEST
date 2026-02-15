import React, { useCallback, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import SafeVoiceRegisterModal from "@/pages/NearMiss/SafeVoiceRegister"
import QRDialog from "@/components/QR/QRDialog"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import useTabNavigation from "@/hooks/useTabNavigation"
import usePagination from "@/hooks/usePagination"
import useHandlers from "@/hooks/useHandlers"
import { CirclePlus, Trash2, QrCode, FileSpreadsheet, Printer } from "lucide-react"
import { safeVoiceMockData } from "@/data/mockData"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"
import { check_SafeVoice, getSafeVoiceDelete, getSafeVoiceList, regist_SafeVoice, SafeVoiceListPost, SafeVoiceListRequest } from "@/api/07_NearMiss/safeVoice.api"
import { formatDateWithDay } from "@/utils/date"
import { useLoadingStore } from "@/stores/loadingStore"
import { useAlerts } from "@/hooks/useAlerts"

// true = dummy, false = BE API
const USE_MOCK_DATA = false
const ENABLE_MODIFIED_ROW_HIGHLIGHT = true
const ALWAYS_ENABLE_SAVE_BUTTON = true

type SafeVoiceRow = DataRow & { id: number | string; content: string; registrant: string; date: string; status: string; reason: string; sitePhotos: string[] }

const TAB_LABELS = ["아차사고", "안전보이스"]
const TAB_PATHS = ["/nearmiss/incident", "/nearmiss/safevoice"]

const safeVoiceColumns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "content", label: "내용" },
  { key: "registrant", label: "작성자" },
  { key: "date", label: "등록일" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "status", label: "조치여부", type: "stateToggleSafetyVoice", stateOptions: { left: { text: "조치", color: "green" }, right: { text: "미조치", color: "orange" } } },
  { key: "reason", label: "미조치 사유", type: "textarea", disabledWhenKey: "status", disabledWhenValue: "조치" },
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

const createSafeVoiceTemplate = (row: SafeVoiceRow): DocumentTemplate => ({
  id: `safevoice-${row.id}`,
  title: "안전보이스",
  companyName: DEFAULT_COMPANY,
  documentNumber: generateDocNumber("SV", row.date),
  createdAt: row.date,
  showApproval: true,
  fields: [
    { label: "내용", value: row.content, type: "textarea", section: "overview", colSpan: 2 },
    { label: "작성자", value: row.registrant, type: "text", section: "overview" },
    { label: "등록일", value: row.date, type: "date", section: "overview" },
    { label: "조치여부", value: { text: row.status, color: row.status === "조치" ? "green" : "orange" }, type: "badge", section: "overview" },
    { label: "미조치 사유", value: row.reason || "-", type: "text", section: "overview" },
    { label: "현장사진", value: row.sitePhotos || [], type: "photos", section: "content" },
  ],
})

const mapSafeVoicePostToRow = (post: SafeVoiceListPost): SafeVoiceRow => {
  const createdDate = post.created_at ? post.created_at.slice(0, 10) : ""
  return {
    id: post.id,
    content: post.contents,
    registrant: post.is_anonymous === 1 ? "익명" : post.user_name,
    date: formatDateWithDay(createdDate),
    status: post.is_wrap_up === 1 ? "조치" : "미조치",
    reason: post.memo || "",
    sitePhotos: post.photofile?.map(file => file.url) || [],
  }
}

export default function SafeVoice() {
  const { setLoading } = useLoadingStore()
  const { alertNoChanges } = useAlerts()
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modifiedIds, setModifiedIds] = useState<Set<number | string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)

    // dummy data
    const [mockData, setMockData] = useState<SafeVoiceRow[]>(safeVoiceMockData as SafeVoiceRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({
    data: mockData,
    dateKey: "date",
    searchKeys: ["content", "registrant"],
  })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<SafeVoiceRow>(mockFilteredData as SafeVoiceRow[], 30)

    // BE API
    const [apiData, setApiData] = useState<SafeVoiceRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchSafeVoiceList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: SafeVoiceListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getSafeVoiceList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapSafeVoicePostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
        setModifiedIds(new Set())
      }
    } catch (error) {
      console.error("안전보이스 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchSafeVoiceList()
    }
  }, [fetchSafeVoiceList])

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

  const { currentData: apiCurrentData } = usePagination<SafeVoiceRow>(apiData, 30)

    // 데이터 분기
    const data = USE_MOCK_DATA ? (mockFilteredData as SafeVoiceRow[]) : apiData
  const setData = USE_MOCK_DATA ? setMockData : setApiData
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
    handleSave: mockHandleSave,
    handleExcelDownload,
    handlePrint,
    isDownloading,
    isPrinting,
  } = useHandlers<SafeVoiceRow>({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
    onSave: () => {
      console.log("안전보이스 저장", data)
      setModifiedIds(new Set())
    },
    createTemplate: createSafeVoiceTemplate,
  })

  const handleMockSave = async () => {
    if (modifiedIds.size === 0) {
      alertNoChanges()
      return
    }
    await mockHandleSave()
  }

  const handleApiSave = async () => {
    const targetRows = data.filter(row => modifiedIds.has(row.id))
    if (targetRows.length === 0) {
      alertNoChanges()
      return
    }

    if (!window.confirm("저장하시겠습니까?")) return

    try {
      setLoading(true)
      const payload = targetRows.map(row => ({
        id: Number(row.id),
        is_wrap_up: row.status === "조치" ? 1 : 0,
        memo: row.reason || "",
      }))
      const response = await check_SafeVoice(payload)
      if (response.code === 200) {
        alert("저장되었습니다.")
        fetchSafeVoiceList()
        setCheckedIds([])
        setModifiedIds(new Set())
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보이스 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getSafeVoiceDelete({ post_id: postIds })

      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchSafeVoiceList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보이스 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete
  const handleSave = USE_MOCK_DATA ? handleMockSave : handleApiSave
  const canSave = ALWAYS_ENABLE_SAVE_BUTTON || modifiedIds.size > 0
  const rowHighlightClassName = (row: SafeVoiceRow) => {
    if (!ENABLE_MODIFIED_ROW_HIGHLIGHT || !modifiedIds.has(row.id)) return ""
    return row.status === "조치" ? "bg-green-50" : "bg-orange-50"
  }

  const handleOpenQR = () => {
    setQrUrl(`${window.location.origin}/public/safevoice`)
    setQrDialogOpen(true)
  }
  const handleStateToggle = (id: number | string, newValue: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, status: newValue, reason: newValue === "조치" ? "조치 완료" : "" } : r)))
    setModifiedIds(prev => new Set(prev).add(id))
  }
  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, [key]: value } : r)))
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSaveRow = async (newItem: { contents: string; is_anonymous: number; photofiles: File[] }) => {
    if (USE_MOCK_DATA) {
      const sourceData = mockData
      const nextId = sourceData.length ? Math.max(...sourceData.map(r => Number(r.id))) + 1 : 1
      setData(prev => [
        {
          id: nextId,
          status: "미조치",
          reason: "",
          sitePhotos: [],
          content: newItem.contents,
          registrant: newItem.is_anonymous === 1 ? "익명" : "",
          date: "",
        },
        ...prev,
      ])
      setModalOpen(false)
      return
    }

    try {
      setLoading(true)
      const response = await regist_SafeVoice({
        post_id: 0,
        contents: newItem.contents,
        is_anonymous: newItem.is_anonymous,
        photofiles: newItem.photofiles,
      })
      if (response.code === 200) {
        alert("등록되었습니다.")
        setModalOpen(false)
        fetchSafeVoiceList()
      } else {
        alert(response.msg || "등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보이스 등록 실패:", error)
      alert("등록에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="safevoice-content w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />
      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>
      <div className="mb-3 flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-2">
        <TotalCount count={USE_MOCK_DATA ? data.length : apiTotalCount} />
        <div className="flex gap-1 justify-end w-full sm:w-auto">
          <Button variant="action" onClick={() => setModalOpen(true)} className="flex gap-1 items-center">
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex gap-1 items-center">
            <Printer size={16} />
            인쇄
          </Button>
          <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex gap-1 items-center">
            <FileSpreadsheet size={16} />
            Excel
          </Button>
          <Button variant="action" onClick={handleOpenQR} className="flex gap-1 items-center">
            <QrCode size={16} />
            QR
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex gap-1 items-center">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={safeVoiceColumns}
          data={currentData}
          rowClassName={rowHighlightClassName}
          onCheckedChange={setCheckedIds}
          onStateToggleChange={handleStateToggle}
          onInputChange={handleInputChange}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <div className="flex justify-end mt-5">
        <Button variant="primary" onClick={handleSave} disabled={!canSave}>
          저장하기
        </Button>
      </div>
      {modalOpen && <SafeVoiceRegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveRow} />}
      <QRDialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} url={qrUrl} title="안전보이스 QR코드" />
    </section>
  )
}
