import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import Pagination from "@/components/common/base/Pagination"
import FilterBar from "@/components/common/base/FilterBar"
import AttendeeRegisterModal from "./AttendeeRegister"
import GroupRegisterModal from "./GroupRegister"
import useHandlers from "@/hooks/useHandlers"
import usePagination from "@/hooks/usePagination"
import { CirclePlus, Trash2, FolderPlus, ArrowRightLeft, X } from "lucide-react"
import { attendeeMockData, attendeeGroupMockData, AttendeeData, AttendeeGroup } from "@/data/mockBusinessData"
import TotalCount from "@/components/common/base/TotalCount"

const TAB_LABELS = ["참석자 목록"]

export default function Attendee() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "참석자 목록" }, { replace: true })
    }
  }, [])

  const [attendees, setAttendees] = useState<DataRow[]>(attendeeMockData.map(item => ({ ...item }) as DataRow))
  const [groups, setGroups] = useState<AttendeeGroup[]>(attendeeGroupMockData)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [editData, setEditData] = useState<DataRow | null>(null)
  const [keyword, setKeyword] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")

  const renderWithExcluded = (key: string) => (row: DataRow) => <span className={row.excluded ? "line-through text-gray-400" : ""}>{String(row[key] || "")}</span>

  const columns: Column[] = [
    { key: "name", label: "이름", renderCell: renderWithExcluded("name") },
    { key: "group", label: "그룹", renderCell: renderWithExcluded("group") },
    { key: "position", label: "직급", renderCell: renderWithExcluded("position") },
    { key: "phone", label: "연락처", renderCell: renderWithExcluded("phone") },
    { key: "remark", label: "비고", renderCell: renderWithExcluded("remark") },
    { key: "excluded", label: "알림해제", type: "toggle" },
    { key: "createdAt", label: "등록일", renderCell: renderWithExcluded("createdAt") },
    { key: "manage", label: "관리", type: "manage" },
  ]

  const groupFilterOptions = useMemo(() => {
    const groupSet = new Set<string>(["기본그룹"])
    groups.forEach(g => groupSet.add(g.name))
    attendees.forEach(a => {
      if (a.group) groupSet.add(String(a.group))
    })
    const sorted = Array.from(groupSet).sort()
    return [{ value: "", label: "전체 그룹" }, ...sorted.map(g => ({ value: g, label: g }))]
  }, [attendees, groups])

  const filteredAttendees = useMemo(() => {
    let result = attendees

    if (selectedGroup) {
      result = result.filter(row => row.group === selectedGroup)
    }

    if (searchKeyword) {
      const lowerKeyword = searchKeyword.toLowerCase()
      result = result.filter(
        row =>
          String(row.name || "")
            .toLowerCase()
            .includes(lowerKeyword) ||
          String(row.group || "")
            .toLowerCase()
            .includes(lowerKeyword) ||
          String(row.position || "")
            .toLowerCase()
            .includes(lowerKeyword) ||
          String(row.phone || "")
            .toLowerCase()
            .includes(lowerKeyword) ||
          String(row.remark || "")
            .toLowerCase()
            .includes(lowerKeyword)
      )
    }

    return result
  }, [attendees, searchKeyword, selectedGroup])

  const { currentPage, totalPages, currentData, onPageChange } = usePagination<DataRow>(filteredAttendees, 10)

  const { handleCreate, handleDelete, handleOpenMoveModal, handleMoveGroup } = useHandlers({
    data: attendees,
    checkedIds,
    onCreate: () => {
      setEditData(null)
      setModalOpen(true)
    },
    onDeleteSuccess: ids => setAttendees(prev => prev.filter(row => !ids.includes(row.id))),
    onOpenMoveModal: () => setMoveModalOpen(true),
    onMoveSuccess: targetGroup => {
      setAttendees(prev => prev.map(row => (checkedIds.includes(row.id) ? { ...row, group: targetGroup } : row)))
      setMoveModalOpen(false)
      setCheckedIds([])
    },
    groupKey: "group",
  })

  const handleEdit = (row: DataRow) => {
    setEditData(row)
    setModalOpen(true)
  }

  const handleSave = (data: Partial<AttendeeData>) => {
    if (editData) {
      setAttendees(prev => prev.map(row => (row.id === editData.id ? { ...row, ...data } : row)))
    } else {
      setAttendees(prev => [{ id: Date.now(), createdAt: new Date().toISOString().split("T")[0], excluded: false, ...data } as DataRow, ...prev])
    }
    setModalOpen(false)
    setEditData(null)
  }

  const handleGroupSave = (groupName: string) => {
    setGroups(prev => [...prev, { id: Date.now(), name: groupName, createdAt: new Date().toISOString().split("T")[0] }])
  }

  const handleGroupDelete = (groupId: number) => {
    const groupToDelete = groups.find(g => g.id === groupId)
    if (groupToDelete) {
      setAttendees(prev => prev.map(row => (row.group === groupToDelete.name ? { ...row, group: "기본그룹" } : row)))
    }
    setGroups(prev => prev.filter(g => g.id !== groupId))
  }

  const handleSearch = () => {
    setSearchKeyword(keyword)
  }

  const handleToggleChange = (id: number | string, key: string, value: boolean) => {
    setAttendees(prev => prev.map(row => (row.id === id ? { ...row, [key]: value } : row)))
  }

  const getGroupMemberCount = (groupName: string) => {
    return attendees.filter(a => a.group === groupName).length
  }

  const moveGroupOptions = useMemo(
    () => [{ value: "기본그룹", label: "기본그룹", count: getGroupMemberCount("기본그룹") }, ...groups.map(g => ({ value: g.name, label: g.name, count: getGroupMemberCount(g.name) }))],
    [groups, attendees]
  )

  return (
    <section className="mypage-content w-full">
      <PageTitle>참석자관리</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={0} onTabClick={() => {}} className="mb-6" />

      <FilterBar
        showDateRange={false}
        keyword={keyword}
        onKeywordChange={setKeyword}
        groupFilter={selectedGroup}
        onGroupFilterChange={setSelectedGroup}
        groupOptions={groupFilterOptions}
        onSearch={handleSearch}
      />

      <div className="flex justify-between items-center mb-3">
        <TotalCount count={filteredAttendees.length} />
        <div className="flex gap-1">
          <Button variant="action" onClick={handleCreate} className="flex items-center gap-1">
            <CirclePlus size={16} />
            참석자 추가
          </Button>
          <Button variant="action" onClick={() => setGroupModalOpen(true)} className="flex items-center gap-1">
            <FolderPlus size={16} />
            그룹관리
          </Button>
          <Button variant="action" onClick={handleOpenMoveModal} className="flex items-center gap-1">
            <ArrowRightLeft size={16} />
            그룹이동
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable columns={columns} data={currentData} onCheckedChange={setCheckedIds} onManageClick={handleEdit} onToggleChange={handleToggleChange} />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      <AttendeeRegisterModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditData(null)
        }}
        onSave={handleSave}
        editData={editData}
        groups={groups}
      />

      <GroupRegisterModal isOpen={groupModalOpen} onClose={() => setGroupModalOpen(false)} onSave={handleGroupSave} onDelete={handleGroupDelete} existingGroups={groups} attendees={attendees} />

      {moveModalOpen && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-[400px] max-w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setMoveModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">그룹이동</h2>
            <p className="text-sm text-gray-600 mb-4">{checkedIds.length}명 선택됨</p>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
              {moveGroupOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleMoveGroup(opt.value)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <span>{opt.label}</span>
                  <span className="text-xs text-gray-400">{opt.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
