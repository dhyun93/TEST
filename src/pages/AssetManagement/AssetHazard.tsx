import React, { useState, useCallback, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import AssetHazardRegister from "./AssetHazardRegister"
import Pagination from "@/components/common/base/Pagination"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useFilterBar from "@/hooks/useFilterBar"
import useHandlers from "@/hooks/useHandlers"
import { CirclePlus, Trash2 } from "lucide-react"
import { assetHazardMockData } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { getHazardList, deleteHazard, type HazardListPost } from "@/api/05_AssetManagement/hazard.api"
import { useLoadingStore } from "@/stores/loadingStore"

const USE_MOCK_DATA = false

const TAB_LABELS = ["위험기계/기구/설비", "유해/위험물질"]
const TAB_PATHS = ["/asset-management/machine", "/asset-management/hazard"]

const hazardColumns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "chemicalName", label: "화학물질명" },
  { key: "casNo", label: "CAS No" },
  { key: "exposureLimit", label: "노출기준" },
  { key: "dailyUsage", label: "일일사용량" },
  { key: "storageAmount", label: "저장량" },
  { key: "registrationDate", label: "등록일" },
  { key: "msds", label: "MSDS", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

const mapHazardPostToRow = (post: HazardListPost): DataRow => ({
  id: post.id,
  chemicalName: post.name,
  casNo: post.cas_number,
  exposureLimit: post.exposure_limit,
  dailyUsage: post.daily_usage,
  storageAmount: post.storage_limit,
  registrationDate: post.registration_date,
  msds: post.files,
})

export default function AssetHazard() {
  const [data, setData] = useState<DataRow[]>(assetHazardMockData)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const [apiData, setApiData] = useState<DataRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiTotalPages, setApiTotalPages] = useState(0)
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const { setLoading } = useLoadingStore()

  const activeData = USE_MOCK_DATA ? data : apiData

  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({
    data: activeData,
    dateKey: "registrationDate",
    searchKeys: ["chemicalName", "casNo"],
  })
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)

  const { currentPage, totalPages, currentData, onPageChange } = usePagination<DataRow>(
    USE_MOCK_DATA ? filteredData : apiData,
    30
  )

  const fetchHazardList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: apiCurrentPage }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (searchText) params.query = searchText

      const response = await getHazardList(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapHazardPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 0)
      }
    } catch (error) {
      console.error("유해물질 목록 조회 실패:", error)
    } finally {
      setLoading(false)
    }
  }, [apiCurrentPage, startDate, endDate, searchText, setLoading])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchHazardList()
  }, [fetchHazardList])

  const handleApiDelete = useCallback(async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await deleteHazard({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchHazardList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }, [checkedIds, fetchHazardList])

  const { handleCreate, handleDelete: handleMockDelete } = useHandlers({
    data,
    checkedIds,
    onCreate: () => {
      setIsEditMode(false)
      setIsModalOpen(true)
    },
    onDeleteSuccess: ids => setData(prev => prev.filter(row => !ids.includes(row.id))),
  })

  const handleSave = (newItem: Partial<DataRow>) => {
    if (!USE_MOCK_DATA) {
      fetchHazardList()
    } else {
      setData(prev => [{ id: prev.length + 1, ...newItem, msds: "", manage: "" }, ...prev])
    }
    setIsModalOpen(false)
    setIsEditMode(false)
  }

  const handleApiSearch = useCallback(() => {
    if (!USE_MOCK_DATA) {
      setApiCurrentPage(1)
      fetchHazardList()
    } else {
      handleSearch()
    }
  }, [fetchHazardList, handleSearch])

  return (
    <section className="asset-management-content w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />
      <div className="mb-3">
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          searchText={searchText}
          onSearchText={setSearchText}
          onSearch={handleApiSearch}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <TotalCount count={USE_MOCK_DATA ? filteredData.length : apiTotalCount} />
        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex gap-1 justify-end">
            <Button
              variant="action"
              onClick={() => {
                setIsEditMode(false)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-1"
            >
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" onClick={USE_MOCK_DATA ? handleMockDelete : handleApiDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button
            variant="action"
            onClick={() => {
              setIsEditMode(false)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1"
          >
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" onClick={USE_MOCK_DATA ? handleMockDelete : handleApiDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={hazardColumns}
          data={USE_MOCK_DATA ? currentData : apiData}
          onCheckedChange={setCheckedIds}
          onManageClick={() => {
            setIsEditMode(true)
            setIsModalOpen(true)
          }}
        />
      </div>
      <Pagination
        currentPage={USE_MOCK_DATA ? currentPage : apiCurrentPage}
        totalPages={USE_MOCK_DATA ? totalPages : apiTotalPages}
        onPageChange={USE_MOCK_DATA ? onPageChange : setApiCurrentPage}
      />
      {isModalOpen && (
        <AssetHazardRegister
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setIsEditMode(false)
          }}
          onSave={handleSave}
          isEdit={isEditMode}
        />
      )}
    </section>
  )
}
