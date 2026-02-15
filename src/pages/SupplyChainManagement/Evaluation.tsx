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
import EvaluationRegister from "./EvaluationRegister"
import { CirclePlus, Download, Trash2 } from "lucide-react"
import { evaluationMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getSafetyAssessmentList,
  deleteSafetyAssessment,
  registSafetyAssessment,
  SafetyAssessmentListPost,
  SafetyAssessmentListRequest,
  SafetyAssessmentFile,
} from "@/api/09_SupplyChainManagement/evaluation.api"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

// TODO: 백엔드 type 매핑 확인 필요
const EVALUATION_TYPE_LABELS = ["선정평가", "정기평가", "재평가", "수시평가", "기타"]

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
  { key: "company", label: "업체명" },
  { key: "evaluationName", label: "평가명" },
  { key: "evaluationType", label: "평가종류" },
  { key: "contractPeriod", label: "평가기간" },
  { key: "evaluator", label: "평가자" },
  { key: "externalEvaluator", label: "외부 평가업체" },
  { key: "evaluationFile", label: "평가지", type: "download" },
  { key: "attachmentFile", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type EvaluationRow = DataRow & {
  id: number | string
  company: string
  evaluationName: string
  evaluationType: string
  contractPeriod: string
  evaluator: string
  externalEvaluator: string
  evaluationFile: SafetyAssessmentFile[] | boolean
  attachmentFile: SafetyAssessmentFile[] | boolean
  typeNum: number
  startDate: string
  endDate: string
  sheetFiles: SafetyAssessmentFile[]
  attachFiles: SafetyAssessmentFile[]
}

// API response to table row mapping
const mapEvaluationPostToRow = (post: SafetyAssessmentListPost): EvaluationRow => {
  // TODO: 백엔드 evaluator 필드 확인 필요
  const p = post as SafetyAssessmentListPost & { evaluator?: string }
  return {
    id: post.id,
    company: post.name,
    evaluationName: post.title,
    evaluationType: EVALUATION_TYPE_LABELS[post.type] ?? `기타(${post.type})`,
    contractPeriod: post.start_date && post.end_date ? `${post.start_date} ~ ${post.end_date}` : "",
    evaluator: p.evaluator ?? "",
    externalEvaluator: post.external || "",
    evaluationFile: post.sheet,
    attachmentFile: post.file,
    typeNum: post.type,
    startDate: post.start_date,
    endDate: post.end_date,
    sheetFiles: post.sheet || [],
    attachFiles: post.file || [],
  }
}

export default function Evaluation() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<EvaluationRow | null>(null)

  // mock
  const [mockData, setMockData] = useState<EvaluationRow[]>(evaluationMockData as EvaluationRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "contractPeriod", searchKeys: ["company", "evaluator"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<EvaluationRow>(mockFilteredData as EvaluationRow[], 30)

  // BE API
  const [apiData, setApiData] = useState<EvaluationRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchEvaluationList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: SafetyAssessmentListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getSafetyAssessmentList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapEvaluationPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("안전보건수준 평가 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchEvaluationList()
  }, [fetchEvaluationList])

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
  const data = USE_MOCK_DATA ? (mockFilteredData as EvaluationRow[]) : apiData
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

  const { handleDelete: mockHandleDelete } = useHandlers<EvaluationRow>({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
  })

  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await deleteSafetyAssessment({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchEvaluationList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건수준 평가 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleSave = async (item: {
    name: string
    title: string
    type: number
    startDate: string
    endDate: string
    external: string
    newSheetFiles: File[]
    keepSheetIds: number[]
    newAttachFiles: File[]
    keepAttachIds: number[]
  }) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      const newRow: EvaluationRow = {
        id: isEditMode && selectedRow ? selectedRow.id : nextId,
        company: item.name,
        evaluationName: item.title,
        evaluationType: EVALUATION_TYPE_LABELS[item.type] ?? "기타",
        contractPeriod: `${item.startDate} ~ ${item.endDate}`,
        evaluator: "",
        externalEvaluator: item.external,
        evaluationFile: false,
        attachmentFile: false,
        typeNum: item.type,
        startDate: item.startDate,
        endDate: item.endDate,
        sheetFiles: [],
        attachFiles: [],
      }
      if (isEditMode && selectedRow) {
        setData(prev => prev.map(r => (r.id === selectedRow.id ? newRow : r)))
      } else {
        setData(prev => [newRow, ...prev])
      }
      setIsModalOpen(false)
      setIsEditMode(false)
      return
    }

    try {
      setLoading(true)
      const response = await registSafetyAssessment({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        name: item.name,
        title: item.title,
        type: item.type,
        start_date: item.startDate,
        end_date: item.endDate,
        external: item.external,
        sheet_id: item.keepSheetIds,
        sheet: item.newSheetFiles,
        file_id: item.keepAttachIds,
        file: item.newAttachFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setIsModalOpen(false)
        setIsEditMode(false)
        fetchEvaluationList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건수준 평가 저장 실패:", error)
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
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1"
          >
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" onClick={() => {}} className="flex items-center gap-1">
            <Download size={16} />
            평가지 양식
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
            setSelectedRow(row as EvaluationRow)
            setIsEditMode(true)
            setIsModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {isModalOpen && (
        <EvaluationRegister
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setIsEditMode(false)
            setSelectedRow(null)
          }}
          onSave={handleSave}
          isEdit={isEditMode}
          initialData={
            selectedRow
              ? {
                  id: selectedRow.id,
                  name: selectedRow.company,
                  title: selectedRow.evaluationName,
                  type: selectedRow.typeNum,
                  startDate: selectedRow.startDate,
                  endDate: selectedRow.endDate,
                  external: selectedRow.externalEvaluator,
                  sheetFiles: selectedRow.sheetFiles,
                  attachFiles: selectedRow.attachFiles,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
