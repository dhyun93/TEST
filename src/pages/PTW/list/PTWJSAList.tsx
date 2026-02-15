import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column } from "@/components/common/tables/DataTable"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useHandlers from "@/hooks/useHandlers"
import { CirclePlus, Trash2 } from "lucide-react"
import { JSAItem } from "@/types/ptw"
import { jsaMockData } from "@/data/mockPtw"

const TAB_LABELS = ["PTW 그룹", "위험작업허가서", "작업위험분석(JSA)", "현장 위험성평가", "TBM"]
const TAB_PATHS = ["/ptw/list", "/ptw/work-permit", "/ptw/jsa", "/ptw/site-evaluation", "/ptw/tbm"]

const columns: Column<JSAItem>[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "jsaNo", label: "JSA No." },
  { key: "workName", label: "작업명" },
  { key: "workDate", label: "작업일" },
  { key: "team", label: "분임조" },
  { key: "applicationDate", label: "신청일자" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "fileAttach", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" }
]

export default function PTWJSAList() {
  const navigate = useNavigate()
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [data, setData] = useState<JSAItem[]>(jsaMockData)
  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({data, dateKey:"workDate", searchKeys:["jsaNo","workName","team"]})
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const { currentPage, totalPages, currentData, onPageChange } = usePagination<JSAItem>(filteredData as JSAItem[], 30)

  const { handleCreate, handleDelete } = useHandlers({
    data,
    checkedIds,
    onCreate: () => navigate("/ptw/register", { state: { activeTab: 1 } }),
    onDeleteSuccess: ids => setData(prev => prev.filter(r => !ids.includes(r.id)))
  })

  return (
    <section className="w-full bg-white">
      <PageTitle>작업위험분석(JSA) 목록</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />
      <div className="mb-3">
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          searchText={searchText}
          onSearchText={setSearchText}
          onSearch={handleSearch}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-1">
        <span className="text-gray-600 text-sm leading-none pt-[3px] mt-2 sm:mt-0">총 {filteredData.length}건</span>
        <div className="flex flex-nowrap gap-1 w-full justify-end sm:w-auto">
          <Button variant="action" onClick={handleCreate} className="flex items-center gap-1"><CirclePlus size={16} />신규등록</Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1"><Trash2 size={16} />삭제</Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <DataTable<JSAItem>
          columns={columns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onManageClick={() => navigate("/ptw/manage", { state: { activeTab: 1 } })}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  )
}