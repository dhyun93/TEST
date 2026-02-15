import React, { useCallback, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import Pagination from "@/components/common/base/Pagination"
import usePagination from "@/hooks/usePagination"
import useFilterBar from "@/hooks/useFilterBar"
import useHandlers from "@/hooks/useHandlers"
import useTabNavigation from "@/hooks/useTabNavigation"
import TrainingRegister from "./TrainingRegister"
import { CirclePlus, Trash2 } from "lucide-react"
import { trainingMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getTrainingList,
  deleteTraining,
  registTraining,
  TrainingListPost,
  TrainingListRequest,
  TrainingFile,
} from "@/api/09_SupplyChainManagement/training.api"

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
  { key: "name", label: "도급협의체명" },
  { key: "riskAssessment", label: "위험성평가 확인", type: "badge" },
  { key: "hazardousMaterial", label: "유해물질 확인", type: "badge" },
  { key: "responseManual", label: "대응매뉴얼 확인", type: "badge" },
  { key: "allSigned", label: "전체서류 서명", type: "badge" },
  { key: "updatedAt", label: "최종 등록일" },
  { key: "fileAttach", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type TrainingRow = DataRow & {
  id: number | string
  name: string
  riskAssessment: { text: string; color: string }
  hazardousMaterial: { text: string; color: string }
  responseManual: { text: string; color: string }
  allSigned: { text: string; color: string }
  updatedAt: string
  fileAttach: TrainingFile[] | boolean
  files: TrainingFile[]
  isDanger: number
  isHazardous: number
  isManual: number
  memo: string
}

const toBadge = (v: number) => (v === 1 ? { text: "완료", color: "gray" } : { text: "미완료", color: "red" })

// API response to table row mapping
const mapTrainingPostToRow = (post: TrainingListPost): TrainingRow => ({
  id: post.id,
  name: post.name,
  riskAssessment: toBadge(post.is_danger),
  hazardousMaterial: toBadge(post.is_hazardous),
  responseManual: toBadge(post.is_manual),
  allSigned: toBadge(post.is_danger === 1 && post.is_hazardous === 1 && post.is_manual === 1 ? 1 : 0),
  updatedAt: post.updated_at || (post.created_at ? post.created_at.slice(0, 10) : ""),
  fileAttach: post.files,
  files: post.files || [],
  isDanger: post.is_danger,
  isHazardous: post.is_hazardous,
  isManual: post.is_manual,
  memo: post.memo || "",
})

export default function PartnerTraining() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TrainingRow | null>(null)

  // mock
  const [mockData, setMockData] = useState<TrainingRow[]>(trainingMockData as TrainingRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "updatedAt", searchKeys: ["name"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<TrainingRow>(mockFilteredData as TrainingRow[], 30)

  // BE API
  const [apiData, setApiData] = useState<TrainingRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchTrainingList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: TrainingListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getTrainingList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapTrainingPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("교육/훈련 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchTrainingList()
  }, [fetchTrainingList])

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
  const data = USE_MOCK_DATA ? (mockFilteredData as TrainingRow[]) : apiData
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
      const response = await deleteTraining({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchTrainingList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("교육/훈련 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleSave = async (item: {
    name: string
    isDanger: number
    isHazardous: number
    isManual: number
    updatedAt: string
    memo: string
    newFiles: File[]
    keepFileIds: number[]
  }) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      const newRow: TrainingRow = {
        id: isEditMode && selectedRow ? selectedRow.id : nextId,
        name: item.name,
        riskAssessment: toBadge(item.isDanger),
        hazardousMaterial: toBadge(item.isHazardous),
        responseManual: toBadge(item.isManual),
        allSigned: toBadge(item.isDanger === 1 && item.isHazardous === 1 && item.isManual === 1 ? 1 : 0),
        updatedAt: item.updatedAt,
        fileAttach: false,
        files: [],
        isDanger: item.isDanger,
        isHazardous: item.isHazardous,
        isManual: item.isManual,
        memo: item.memo,
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
      const response = await registTraining({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        name: item.name,
        updated_at: item.updatedAt,
        is_danger: item.isDanger,
        is_hazardous: item.isHazardous,
        is_manual: item.isManual,
        memo: item.memo,
        files_id: item.keepFileIds,
        files: item.newFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setModalOpen(false)
        setIsEditMode(false)
        fetchTrainingList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("교육/훈련 저장 실패:", error)
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
            setSelectedRow(row as TrainingRow)
            setIsEditMode(true)
            setModalOpen(true)
          }}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      {modalOpen && (
        <TrainingRegister
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
                  name: selectedRow.name,
                  isDanger: selectedRow.isDanger,
                  isHazardous: selectedRow.isHazardous,
                  isManual: selectedRow.isManual,
                  updatedAt: selectedRow.updatedAt,
                  memo: selectedRow.memo,
                  files: selectedRow.files,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
