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
import SiteAuditRegister from "@/pages/SupplyChainManagement/SiteAuditRegister"
import { CirclePlus, Download, Trash2 } from "lucide-react"
import { siteAuditMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getInspectionList,
  deleteInspection,
  registInspection,
  InspectionListPost,
  InspectionListRequest,
  InspectionFile,
} from "@/api/09_SupplyChainManagement/siteAudit.api"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

// TODO: 백엔드 type 매핑 확인 필요
const INSPECTION_TYPE_LABELS = ["정기점검", "수시점검", "특별점검", "합동점검", "기타"]
// TODO: 백엔드 result 매핑 확인 필요
const INSPECTION_RESULT_LABELS = ["이상없음", "경미한 지적사항", "중대 위험요인", "시정조치 완료"]

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
  { key: "inspectionDate", label: "점검일" },
  { key: "inspectionType", label: "점검종류" },
  { key: "inspectionName", label: "점검명(계획명)" },
  { key: "inspectionResult", label: "점검결과" },
  { key: "note", label: "비고" },
  { key: "inspector", label: "점검자" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "fileAttach", label: "점검표", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type SiteAuditRow = DataRow & {
  id: number | string
  inspectionDate: string
  inspectionType: string
  inspectionName: string
  inspectionResult: string
  note: string
  inspector: string
  sitePhotos: string[]
  fileAttach: InspectionFile[] | boolean
  typeNum: number
  resultNum: number
  photoFiles: InspectionFile[]
  infoFiles: InspectionFile[]
}

// API response to table row mapping
const mapSiteAuditPostToRow = (post: InspectionListPost): SiteAuditRow => ({
  id: post.id,
  inspectionDate: post.inspection_date,
  inspectionType: INSPECTION_TYPE_LABELS[post.type] ?? `기타(${post.type})`,
  inspectionName: post.title,
  inspectionResult: INSPECTION_RESULT_LABELS[post.result] ?? `기타(${post.result})`,
  note: post.contents || "",
  inspector: post.name || "",
  sitePhotos: (post.photofile || []).map(f => f.url),
  fileAttach: post.inspection_info,
  typeNum: post.type,
  resultNum: post.result,
  photoFiles: post.photofile || [],
  infoFiles: post.inspection_info || [],
})

export default function SiteManagement() {
  const { setLoading } = useLoadingStore()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<SiteAuditRow | null>(null)

  // mock
  const [mockData, setMockData] = useState<SiteAuditRow[]>(siteAuditMockData as SiteAuditRow[])
  const {
    startDate: mockStartDate,
    endDate: mockEndDate,
    searchText: mockSearchText,
    setStartDate: setMockStartDate,
    setEndDate: setMockEndDate,
    setSearchText: setMockSearchText,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "inspectionDate", searchKeys: ["inspectionName", "inspector", "note"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<SiteAuditRow>(mockFilteredData as SiteAuditRow[], 30)

  // BE API
  const [apiData, setApiData] = useState<SiteAuditRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiStartDate, setApiStartDate] = useState("")
  const [apiEndDate, setApiEndDate] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiFilters, setApiFilters] = useState({ startDate: "", endDate: "", searchText: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchSiteAuditList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const params: InspectionListRequest = { page: apiCurrentPage }
      if (apiFilters.startDate) params.start_date = apiFilters.startDate
      if (apiFilters.endDate) params.end_date = apiFilters.endDate
      if (apiFilters.searchText) params.query = apiFilters.searchText

      const response = await getInspectionList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapSiteAuditPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("안전보건점검 목록 조회 실패:", error)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchSiteAuditList()
  }, [fetchSiteAuditList])

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
  const data = USE_MOCK_DATA ? (mockFilteredData as SiteAuditRow[]) : apiData
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

  const { handleDelete: mockHandleDelete } = useHandlers<SiteAuditRow>({
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
      const response = await deleteInspection({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchSiteAuditList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건점검 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const handleSave = async (item: {
    inspectionDate: string
    type: number
    title: string
    result: number
    contents: string
    name: string
    newPhotoFiles: File[]
    keepPhotoIds: number[]
    newInfoFiles: File[]
    keepInfoIds: number[]
  }) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      const nextId = Math.max(...data.map(r => Number(r.id)), 0) + 1
      const newRow: SiteAuditRow = {
        id: isEditMode && selectedRow ? selectedRow.id : nextId,
        inspectionDate: item.inspectionDate,
        inspectionType: INSPECTION_TYPE_LABELS[item.type] ?? "기타",
        inspectionName: item.title,
        inspectionResult: INSPECTION_RESULT_LABELS[item.result] ?? "기타",
        note: item.contents,
        inspector: item.name,
        sitePhotos: [],
        fileAttach: false,
        typeNum: item.type,
        resultNum: item.result,
        photoFiles: [],
        infoFiles: [],
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
      const response = await registInspection({
        post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
        inspection_date: item.inspectionDate,
        type: item.type,
        title: item.title,
        result: item.result,
        contents: item.contents,
        name: item.name,
        photo_id: item.keepPhotoIds,
        photofiles: item.newPhotoFiles,
        info_id: item.keepInfoIds,
        inspection_info: item.newInfoFiles,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setIsModalOpen(false)
        setIsEditMode(false)
        fetchSiteAuditList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건점검 저장 실패:", error)
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
            점검표 양식
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
            setSelectedRow(row as SiteAuditRow)
            setIsEditMode(true)
            setIsModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {isModalOpen && (
        <SiteAuditRegister
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
                  inspectionDate: selectedRow.inspectionDate,
                  type: selectedRow.typeNum,
                  title: selectedRow.inspectionName,
                  result: selectedRow.resultNum,
                  contents: selectedRow.note,
                  name: selectedRow.inspector,
                  photoFiles: selectedRow.photoFiles,
                  infoFiles: selectedRow.infoFiles,
                }
              : undefined
          }
        />
      )}
    </section>
  )
}
