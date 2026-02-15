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
import PartnerRegister from "./PartnersRegister"
import { CirclePlus, Trash2 } from "lucide-react"
import { partnersMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getConsultativeList,
  deleteConsultative,
  registConsultative,
  ConsultativeListPost,
  ConsultativeListRequest,
  ConsultativeFile,
} from "@/api/09_SupplyChainManagement/partners.api"

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
  { key: "company", label: "업체명" },
  { key: "contractPeriod", label: "계약기간" },
  { key: "manager", label: "현장관리자" },
  { key: "contact", label: "연락처" },
  { key: "planFile", label: "안전보건계획서", type: "download" },
  { key: "etcFile", label: "계약서류", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type PartnerRow = DataRow & {
  id: number | string
  company: string
  contractPeriod: string
  manager: string
  contact: string
  planFile: ConsultativeFile[] | boolean
  etcFile: ConsultativeFile[] | boolean
  startDate: string
  endDate: string
  planFiles: ConsultativeFile[]
  etcFiles: ConsultativeFile[]
}

// API response to table row mapping
const mapPartnerPostToRow = (post: ConsultativeListPost): PartnerRow => ({
  id: post.id,
  company: post.name,
  contractPeriod: post.start_date && post.end_date ? `${post.start_date} ~ ${post.end_date}` : "",
  manager: post.manager || "",
  contact: post.phone || "",
  planFile: post.planfile,
  // photofile = 계약서류 (backend naming)
  etcFile: post.photofile,
  startDate: post.start_date,
  endDate: post.end_date,
  planFiles: post.planfile || [],
  etcFiles: post.photofile || [],
})

export default function Partners() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<PartnerRow | null>(null)

  // mock
  const [mockData, setMockData] = useState<PartnerRow[]>(partnersMockData as PartnerRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "contractPeriod", searchKeys: ["company", "manager", "contact"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<PartnerRow>(mockFilteredData as PartnerRow[], 30)

  // BE API
  const [apiData, setApiData] = useState<PartnerRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchPartnerList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: ConsultativeListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getConsultativeList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapPartnerPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("수급업체 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchPartnerList()
  }, [fetchPartnerList])

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
  const data = USE_MOCK_DATA ? (mockFilteredData as PartnerRow[]) : apiData
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
      const response = await deleteConsultative({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchPartnerList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("수급업체 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleSave = async (item: {
    name: string
    startDate: string
    endDate: string
    manager: string
    phone: string
    newPlanFiles: File[]
    keepPlanIds: number[]
    newEtcFiles: File[]
    keepEtcIds: number[]
  }) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      const newRow: PartnerRow = {
        id: isEditMode && selectedRow ? selectedRow.id : nextId,
        company: item.name,
        contractPeriod: `${item.startDate} ~ ${item.endDate}`,
        manager: item.manager,
        contact: item.phone,
        planFile: false,
        etcFile: false,
        startDate: item.startDate,
        endDate: item.endDate,
        planFiles: [],
        etcFiles: [],
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
      const response = await registConsultative({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        name: item.name,
        start_date: item.startDate,
        end_date: item.endDate,
        manager: item.manager,
        phone: item.phone,
        plan_id: item.keepPlanIds,
        planfiles: item.newPlanFiles,
        // photofiles/photo_id = 계약서류 (backend naming)
        photo_id: item.keepEtcIds,
        photofiles: item.newEtcFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setModalOpen(false)
        setIsEditMode(false)
        fetchPartnerList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("수급업체 저장 실패:", error)
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
            setSelectedRow(row as PartnerRow)
            setIsEditMode(true)
            setModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {modalOpen && (
        <PartnerRegister
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
                  name: selectedRow.company,
                  startDate: selectedRow.startDate,
                  endDate: selectedRow.endDate,
                  manager: selectedRow.manager,
                  phone: selectedRow.contact,
                  planFiles: selectedRow.planFiles,
                  etcFiles: selectedRow.etcFiles,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
