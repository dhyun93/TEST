import React, { useCallback, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import { CirclePlus, Trash2, QrCode, FileSpreadsheet, Printer } from "lucide-react"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import NearMissRegisterModal from "@/pages/NearMiss/NearMissRegister"
import QRDialog from "@/components/QR/QRDialog"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import useTabNavigation from "@/hooks/useTabNavigation"
import usePagination from "@/hooks/usePagination"
import useHandlers from "@/hooks/useHandlers"
import { nearMissMockData } from "@/data/mockData"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"
import { check_NearMiss, getNearMissDelete, getNearMissList, regist_NearMiss, NearMissListPost, NearMissListRequest } from "@/api/07_NearMiss/nearMiss.api"
import { formatDateWithDay } from "@/utils/date"
import { useLoadingStore } from "@/stores/loadingStore"
import { useAlerts } from "@/hooks/useAlerts"

// true = dummy, false = BE API
const USE_MOCK_DATA = false
const ENABLE_MODIFIED_ROW_HIGHLIGHT = true
const ALWAYS_ENABLE_SAVE_BUTTON = true

type NearMissRow = DataRow & { id: number | string; danger: string; place: string; registrant: string; date: string; result: string; reason: string; sitePhotos: string[] }

const TAB_LABELS = ["아차사고", "안전보이스"]
const TAB_PATHS = ["/nearmiss/incident", "/nearmiss/safevoice"]

const nearMissColumns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "place", label: "장소" },
  { key: "danger", label: "유해위험요인" },
  { key: "registrant", label: "등록인" },
  { key: "date", label: "등록일" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "result", label: "처리결과", type: "stateToggleNearMiss", stateOptions: { left: { text: "채택", color: "sky" }, right: { text: "미채택", color: "red" } } },
  { key: "reason", label: "미채택 사유", type: "textarea", disabledWhenKey: "result", disabledWhenValue: "채택" },
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

const createNearMissTemplate = (row: NearMissRow): DocumentTemplate => ({
  id: `nearmiss-${row.id}`,
  title: "아차사고",
  companyName: DEFAULT_COMPANY,
  documentNumber: generateDocNumber("NM", row.date),
  createdAt: row.date,
  showApproval: true,
  fields: [
    { label: "장소", value: row.place, type: "text", section: "overview", colSpan: 2 },
    { label: "유해위험요인", value: row.danger, type: "textarea", section: "overview", colSpan: 2 },
    { label: "등록인", value: row.registrant, type: "text", section: "overview" },
    { label: "등록일", value: row.date, type: "date", section: "overview" },
    { label: "처리결과", value: { text: row.result, color: row.result === "채택" ? "blue" : "red" }, type: "badge", section: "overview" },
    { label: "미채택 사유", value: row.reason || "-", type: "text", section: "overview" },
    { label: "현장사진", value: row.sitePhotos || [], type: "photos", section: "content" },
  ],
})

const mapNearMissPostToRow = (post: NearMissListPost): NearMissRow => {
  const createdDate = post.created_at ? post.created_at.slice(0, 10) : ""
  return {
    id: post.id,
    danger: post.risk_factor,
    place: post.place,
    registrant: post.user_name,
    date: formatDateWithDay(createdDate),
    result: post.is_wrap_up === 1 ? "채택" : "미채택",
    reason: post.memo || "",
    sitePhotos: post.photofile?.map(file => file.url) || [],
  }
}

export default function NearMiss() {
  const { setLoading } = useLoadingStore()
  const { alertNoChanges } = useAlerts()
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modifiedIds, setModifiedIds] = useState<Set<number | string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

    // dummy data
    const [mockData, setMockData] = useState<NearMissRow[]>(nearMissMockData as NearMissRow[])
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
    searchKeys: ["danger", "place", "registrant"],
  })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<NearMissRow>(mockFilteredData as NearMissRow[], 30)

    // BE API
    const [apiData, setApiData] = useState<NearMissRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchNearMissList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: NearMissListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getNearMissList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapNearMissPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
        setModifiedIds(new Set())
      }
    } catch (error) {
      console.error("아차사고 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchNearMissList()
    }
  }, [fetchNearMissList])

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

  const { currentData: apiCurrentData } = usePagination<NearMissRow>(apiData, 30)

    // 데이터 분기
    const data = USE_MOCK_DATA ? (mockFilteredData as NearMissRow[]) : apiData
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

  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const {
    handleDelete: mockHandleDelete,
    handleSave: mockHandleSave,
    handleExcelDownload,
    handlePrint,
    isDownloading,
    isPrinting,
  } = useHandlers<NearMissRow>({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
    onSave: () => {
      console.log("아차사고 저장", data)
      setModifiedIds(new Set())
    },
    createTemplate: createNearMissTemplate,
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
        is_wrap_up: row.result === "채택" ? 1 : 0,
        memo: row.reason || "",
      }))
      const response = await check_NearMiss(payload)
      if (response.code === 200) {
        alert("저장되었습니다.")
        fetchNearMissList()
        setCheckedIds([])
        setModifiedIds(new Set())
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("아차사고 저장 실패:", error)
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
      const response = await getNearMissDelete({ post_id: postIds })

      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchNearMissList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("아차사고 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete
  const handleSave = USE_MOCK_DATA ? handleMockSave : handleApiSave
  const canSave = ALWAYS_ENABLE_SAVE_BUTTON || modifiedIds.size > 0
  const rowHighlightClassName = (row: NearMissRow) => {
    if (!ENABLE_MODIFIED_ROW_HIGHLIGHT || !modifiedIds.has(row.id)) return ""
    return row.result === "채택" ? "bg-sky-50" : "bg-red-50"
  }

  const handleOpenQR = () => {
    setQrUrl(`${window.location.origin}/public/nearmiss`)
    setQrDialogOpen(true)
  }
  const handleStateToggle = (id: number | string, newValue: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, result: newValue, reason: newValue === "채택" ? "채택 완료" : "" } : r)))
    setModifiedIds(prev => new Set(prev).add(id))
  }
  const handleInputChange = (id: number | string, key: string, value: string) => {
    setData(prev => prev.map(r => (r.id === id ? { ...r, [key]: value } : r)))
    setModifiedIds(prev => new Set(prev).add(id))
  }
  const handleSaveRow = async (newItem: { risk_factor: string; place: string; photofiles: File[] }) => {
    if (USE_MOCK_DATA) {
      const sourceData = mockData
      const nextId = sourceData.length ? Math.max(...sourceData.map(r => Number(r.id))) + 1 : 1
      setData(prev => [
        {
          id: nextId,
          result: "미채택",
          reason: "",
          sitePhotos: [],
          danger: newItem.risk_factor,
          place: newItem.place,
          registrant: "",
          date: "",
        },
        ...prev,
      ])
      setModalOpen(false)
      return
    }

    try {
      setLoading(true)
      const response = await regist_NearMiss({
        post_id: 0,
        risk_factor: newItem.risk_factor,
        place: newItem.place,
        photofiles: newItem.photofiles,
      })
      if (response.code === 200) {
        alert("등록되었습니다.")
        setModalOpen(false)
        fetchNearMissList()
      } else {
        alert(response.msg || "등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("아차사고 등록 실패:", error)
      alert("등록에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="nearmiss-content w-full bg-white">
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
          columns={nearMissColumns}
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
      {modalOpen && <NearMissRegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveRow} />}
      <QRDialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} url={qrUrl} title="아차사고 QR코드" />
    </section>
  )
}
