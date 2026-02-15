import React, { useCallback, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import useFilterBar from "@/hooks/useFilterBar"
import Pagination from "@/components/common/base/Pagination"
import usePagination from "@/hooks/usePagination"
import useHandlers from "@/hooks/useHandlers"
import useTabNavigation from "@/hooks/useTabNavigation"
import CommitteeRegister from "./CommitteeRegister"
import { CirclePlus, Download, Trash2, Upload, ShieldAlert, FileSpreadsheet, Printer } from "lucide-react"
import { committeeMockData } from "@/data/mockData"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getContractSafetyList,
  deleteContractSafety,
  registContractSafety,
  ContractSafetyListPost,
  ContractSafetyListRequest,
  ContractSafetyFile,
} from "@/api/09_SupplyChainManagement/committee.api"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

const TAB_LABELS = ["수급업체 관리", "안전보건수준 평가", "안전보건협의체 회의록", "협동 안전보건점검", "안전보건 교육/훈련"]
const TAB_PATHS = [
  "/supply-chain-management/partners",
  "/supply-chain-management/evaluation",
  "/supply-chain-management/committee",
  "/supply-chain-management/siteaudit",
  "/supply-chain-management/training",
]

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "completionDate", label: "회의일시" },
  { key: "meetingPlace", label: "회의장소" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "proof", label: "회의록", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type CommitteeRow = DataRow & {
  id: number | string
  completionDate: string
  meetingPlace: string
  sitePhotos: string[]
  proof: ContractSafetyFile[] | boolean
  meetingContent: string
  attendeesContractor: string
  attendeesSubcontractor: string
  writer: string
  meetDate: string
  startTime: string
  endTime: string
  photoFiles: ContractSafetyFile[]
  proceedFiles: ContractSafetyFile[]
}

const DEFAULT_COMPANY = "(주)경인EPS 오창공장"

const generateDocNumber = (prefix: string, dateStr?: string) => {
  const date = dateStr ? new Date(dateStr.split(" ")[0]) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `${prefix}_${year}${month}${day}_${num}`
}

const parseDateTime = (dateTimeStr: string) => {
  const parts = dateTimeStr.split(" ")
  const date = parts[0] || "-"
  const time = parts[1] || "-"
  return { date, time }
}

const createCommitteeTemplate = (row: CommitteeRow): DocumentTemplate => {
  const { date, time } = parseDateTime(row.completionDate)
  return {
    id: `committee-${row.id}`,
    title: "안전보건협의체 회의록",
    companyName: DEFAULT_COMPANY,
    documentNumber: generateDocNumber("COM", row.completionDate),
    createdAt: row.completionDate,
    showApproval: true,
    fields: [
      { label: "회의일", value: date, type: "date", section: "overview" },
      { label: "회의시간", value: time, type: "text", section: "overview" },
      { label: "회의장소", value: row.meetingPlace || "-", type: "text", section: "overview" },
      { label: "작성자", value: row.writer || "-", type: "text", section: "overview" },
      { label: "참석자(도급인)", value: row.attendeesContractor || "-", type: "text", section: "overview", colSpan: 2 },
      { label: "참석자(수급인)", value: row.attendeesSubcontractor || "-", type: "text", section: "overview", colSpan: 2 },
      { label: "회의내용", value: row.meetingContent || "-", type: "textarea", section: "content" },
      { label: "회의록", value: Array.isArray(row.proof) ? row.proof.map(f => f.url) : ["-"], type: "files", section: "content" },
      { label: "현장사진", value: row.sitePhotos || [], type: "photos", section: "content" },
    ],
  }
}

// API response to table row mapping
const mapCommitteePostToRow = (post: ContractSafetyListPost): CommitteeRow => {
  const p = post as ContractSafetyListPost & { user_name?: string }
  return {
    id: post.id,
    completionDate: `${post.meet_date} ${post.start_time}~${post.end_time}`,
    meetingPlace: post.place,
    sitePhotos: (post.photofile || []).map(f => f.url),
    proof: post.proceedings,
    meetingContent: post.contents,
    attendeesContractor: post.contractor,
    attendeesSubcontractor: post.recipient,
    writer: p.user_name ?? "",
    meetDate: post.meet_date,
    startTime: post.start_time,
    endTime: post.end_time,
    photoFiles: post.photofile || [],
    proceedFiles: post.proceedings || [],
  }
}

export default function Committee() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<CommitteeRow | null>(null)

  // mock
  const [mockData, setMockData] = useState<CommitteeRow[]>(committeeMockData as CommitteeRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "completionDate", searchKeys: ["meetingPlace"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<CommitteeRow>(mockFilteredData as CommitteeRow[], 30)

  // BE API
  const [apiData, setApiData] = useState<CommitteeRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchCommitteeList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: ContractSafetyListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getContractSafetyList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapCommitteePostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("협의체 회의록 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchCommitteeList()
  }, [fetchCommitteeList])

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

  // data branching
  const data = USE_MOCK_DATA ? (mockFilteredData as CommitteeRow[]) : apiData
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

  const { handleDelete: mockHandleDelete, handleExcelDownload, handlePrint, isDownloading, isPrinting } = useHandlers<CommitteeRow>({
    data: data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
    createTemplate: createCommitteeTemplate,
  })

  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await deleteContractSafety({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchCommitteeList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("협의체 회의록 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleSave = async (item: {
    meetDate: string
    startTime: string
    endTime: string
    place: string
    contractor: string
    recipient: string
    contents: string
    newPhotoFiles: File[]
    keepPhotoIds: number[]
    newProceedFiles: File[]
    keepProceedIds: number[]
  }) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      const newRow: CommitteeRow = {
        id: isEditMode && selectedRow ? selectedRow.id : nextId,
        completionDate: `${item.meetDate} ${item.startTime}~${item.endTime}`,
        meetingPlace: item.place,
        sitePhotos: [],
        proof: false,
        meetingContent: item.contents,
        attendeesContractor: item.contractor,
        attendeesSubcontractor: item.recipient,
        writer: "",
        meetDate: item.meetDate,
        startTime: item.startTime,
        endTime: item.endTime,
        photoFiles: [],
        proceedFiles: [],
      }
      if (isEditMode && selectedRow) {
        setData(prev => prev.map(r => (r.id === selectedRow.id ? newRow : r)))
      } else {
        setData(prev => [newRow, ...prev])
      }
      setModalOpen(false)
      setIsEditMode(false)
      return
    }

    try {
      setLoading(true)
      const response = await registContractSafety({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        meet_date: item.meetDate,
        start_time: item.startTime,
        end_time: item.endTime,
        place: item.place,
        contractor: item.contractor,
        recipient: item.recipient,
        contents: item.contents,
        photo_id: item.keepPhotoIds,
        photofiles: item.newPhotoFiles,
        proceed_id: item.keepProceedIds,
        proceedings: item.newProceedFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setModalOpen(false)
        setIsEditMode(false)
        fetchCommitteeList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("협의체 회의록 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const hasOrganization = false

  return (
    <section className="w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-1">
        <TotalCount count={USE_MOCK_DATA ? data.length : apiTotalCount} />

        <div className="flex flex-nowrap gap-1 w-full justify-end sm:w-auto">
          <Button
            variant="action"
            onClick={() => {
              setIsEditMode(false)
              setSelectedRow(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-1"
          >
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
          <Button variant="action" onClick={() => {}} className="flex items-center gap-1">
            <Download size={16} />
            회의록 양식
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
            setSelectedRow(row as CommitteeRow)
            setIsEditMode(true)
            setModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      <PageTitle className="mt-8 mb-3">도급협의체 조직도</PageTitle>

      {!hasOrganization ? (
        <div className="flex flex-col items-center text-center text-gray-600 mt-16 mb-16">
          <div className="mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <ShieldAlert size={24} className="sm:w-8 sm:h-8 w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-sm sm:text-lg font-semibold mb-1">도급협의체 조직도가 등록되지 않았습니다.</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">조직도 이미지를 업로드한 후 조직관리를 시작해보세요</p>
          <Button variant="action" className="flex items-center justify-center gap-1 px-6">
            <Upload size={16} className="text-gray-500" />
            조직도 이미지 업로드
          </Button>
        </div>
      ) : (
        <div className="flex justify-center mb-6"></div>
      )}

      {modalOpen && (
        <CommitteeRegister
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setIsEditMode(false)
            setSelectedRow(null)
          }}
          onSave={handleSave}
          isEdit={isEditMode}
          initialData={
            selectedRow
              ? {
                  id: selectedRow.id,
                  meetDate: selectedRow.meetDate,
                  startTime: selectedRow.startTime,
                  endTime: selectedRow.endTime,
                  place: selectedRow.meetingPlace,
                  contractor: selectedRow.attendeesContractor,
                  recipient: selectedRow.attendeesSubcontractor,
                  contents: selectedRow.meetingContent,
                  photoFiles: selectedRow.photoFiles,
                  proceedFiles: selectedRow.proceedFiles,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
