import { useState } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import FilterBar from "@/components/common/base/FilterBar"
import Pagination from "@/components/common/base/Pagination"
import useFilterBar from "@/hooks/useFilterBar"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useHandlers from "@/hooks/useHandlers"
import { Trash2 } from "lucide-react"
import { lawMockData } from "@/data/mockData"
import LawBoardView from "./LawBoardView"
import TotalCount from "@/components/common/base/TotalCount"

// TODO: 법률 스크래핑 API 연동 예정
const USE_MOCK_DATA = true

const TAB_LABELS = ["공지사항", "자료실", "중대재해처벌법"]
const TAB_PATHS = ["/notice-board/notice", "/notice-board/resources", "/notice-board/law"]

const columns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "title", label: "제목" },
  { key: "organization", label: "소관기관" },
  { key: "date", label: "발표일" },
  { key: "fileAttach", label: "첨부파일", type: "download" },
  { key: "view", label: "보기", type: "detail" },
]

export default function LawBoard() {
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)
  const [data, setData] = useState<DataRow[]>(lawMockData)
  const { startDate, endDate, searchText, setStartDate, setEndDate, setSearchText, filteredData, handleSearch } = useFilterBar({ data, dateKey: "date", searchKeys: ["title", "organization"] })
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [viewItem, setViewItem] = useState<DataRow | null>(null)

  const { currentPage, totalPages, currentData, onPageChange } = usePagination<DataRow>(filteredData, 30)

  const { handleDelete } = useHandlers({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(r => !ids.includes(r.id))),
  })

  return (
    <section className="w-full bg-white">
      <PageTitle>{TAB_LABELS[currentIndex]}</PageTitle>

      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-3">
        <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} searchText={searchText} onSearchText={setSearchText} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-1">
        <TotalCount count={filteredData.length} />
        <div className="flex flex-nowrap gap-1 w-full justify-end sm:w-auto">
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable columns={columns} data={currentData} onCheckedChange={setCheckedIds} onDetailClick={row => setViewItem(row)} />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {viewItem && <LawBoardView isOpen={true} onClose={() => setViewItem(null)} initialData={viewItem} />}
    </section>
  )
}
