import React, { useState, useMemo } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import { Trash2, Plus, Send, Users, X } from "lucide-react"
import useHandlers from "@/hooks/useHandlers"
import { attendeeMockData, attendeeGroupMockData } from "@/data/mockBusinessData"
import { formatPhoneNumber } from "@/utils/phone"

interface Attendee {
  name: string
  phone: string
  group?: string
}
interface Props {
  attendees: Attendee[]
  onAdd: (att: Attendee) => void
  onRemove: (idx: number) => void
  onAddMultiple?: (atts: Attendee[]) => void
  isModified?: boolean
  modifiedRowIndices?: number[]
}

const BORDER_STYLE = { borderWidth: "1px", borderStyle: "solid" as const, borderColor: "var(--border)" }
const TEXT_PRIMARY = "text-gray-800"
const TEXT_SIZE = "text-xs md:text-base"
const INPUT_HEIGHT = "h-10"
const BTN_HEIGHT = "h-10"
const BG_MODIFIED_CLASS = "bg-[#E9F0FE]"

const tableStyle = `
<style>
.hide-select-col table thead th:first-child, .hide-select-col table tbody td:first-child {display:none!important;}
.no-row-hover table tbody tr:hover {pointer-events:none;}
.no-row-hover table tbody tr button {pointer-events:auto;}
</style>
`

export default function AttendeePanel({ attendees, onAdd, onRemove, onAddMultiple, isModified = false, modifiedRowIndices = [] }: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [demoRows, setDemoRows] = useState<Attendee[]>([])

  const groupOptions = useMemo(() => {
    const groups = new Set<string>(["기본그룹"])
    attendeeGroupMockData.forEach(g => groups.add(g.name))
    attendeeMockData.forEach(a => {
      if (a.group) groups.add(a.group)
    })
    return Array.from(groups)
  }, [])

  const handleSelectAll = () => {
    if (selectedGroups.length === groupOptions.length) {
      setSelectedGroups([])
    } else {
      setSelectedGroups([...groupOptions])
    }
  }

  const handleLoadByGroups = () => {
    if (selectedGroups.length === 0) {
      alert("불러올 그룹을 선택해주세요.")
      return
    }
    const filtered = attendeeMockData.filter(a => selectedGroups.includes(a.group) && !a.excluded)
    const newAttendees = filtered.map(a => ({ name: a.name, phone: formatPhoneNumber(a.phone), group: a.group }))
    if (newAttendees.length === 0) {
      alert("선택한 그룹에 참석자가 없습니다.")
      return
    }
    if (onAddMultiple) {
      onAddMultiple(newAttendees)
    } else {
      newAttendees.forEach(a => onAdd(a))
    }
    if (isDemo) setDemoRows(prev => [...prev, ...newAttendees])
    setLoadModalOpen(false)
    setSelectedGroups([])
  }

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => (prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]))
  }

  const isDemo = attendees.length === 0
  const currentList = isDemo ? demoRows : attendees

  const { handleSendNotification } = useHandlers({ data: currentList, checkedIds: [] })

  const formatPhone = (v: string) => formatPhoneNumber(v)

  const handleAddClick = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요")
      return
    }
    const phoneDigits = phone.replace(/[^0-9]/g, "")
    if (phoneDigits.length !== 11) {
      alert("연락처를 정확히 입력해주세요 (11자리)")
      return
    }
    const formattedPhone = formatPhoneNumber(phone)
    onAdd({ name, phone: formattedPhone })
    if (isDemo) setDemoRows(prev => [...prev, { name, phone: formattedPhone }])
    setName("")
    setPhone("")
  }

  const handleDelete = (idx: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    if (isDemo) setDemoRows(rows => rows.filter((_, i) => i !== idx))
    else onRemove(idx)
  }

  const handleSendClick = () => {
    alert("전송 방식 미정 ::: 결정 후 공유/적용 예정") //[TODO]:카톡/앱푸시 방식 고려중이라고하심
    // handleSendNotification(currentList.length)
  }

  const columns: Column[] = [
    { key: "name", label: "이름", minWidth: 60, maxWidth: 90 },
    { key: "phone", label: "연락처", minWidth: 100, maxWidth: 130 },
    { key: "group", label: "그룹", minWidth: 70, maxWidth: 100 },
    { key: "actions", label: "삭제", minWidth: 40, maxWidth: 50, align: "right" },
  ]

  const data: DataRow[] = currentList.map((att, idx) => ({
    id: idx,
    name: att.name,
    phone: formatPhoneNumber(att.phone),
    group: att.group || "-",
    actions: (
      <button aria-label="삭제" className="p-1 rounded hover:bg-gray-100 relative z-10" style={{ pointerEvents: "auto" }} onClick={() => handleDelete(idx)}>
        <Trash2 className="w-4 h-4 text-gray-600" />
      </button>
    ),
  }))

  return (
    <div className="flex flex-col h-full">
      <div dangerouslySetInnerHTML={{ __html: tableStyle }} />
      <div className="border border-gray-100 rounded-xl md:rounded-2xl p-3 md:p-4">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className={`${TEXT_PRIMARY} font-semibold ${TEXT_SIZE}`}>참석자 지정</h3>
          <Button variant="action" onClick={() => setLoadModalOpen(true)} className={`h-8 md:h-10 ${TEXT_SIZE} flex items-center justify-center gap-1`}>
            <Users size={16} className="md:w-[18px] md:h-[18px]" />
            불러오기
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 items-end mb-3 md:mb-4">
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <label className={`${TEXT_SIZE} font-medium ${TEXT_PRIMARY} mb-1 block`}>이름</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름 입력"
              maxLength={20}
              className={`rounded-lg px-2 md:px-3 ${INPUT_HEIGHT} w-full ${TEXT_SIZE} focus:outline-none focus:border-[var(--primary)]`}
              style={BORDER_STYLE}
              onKeyDown={e => {
                if (!/[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/.test(e.key) && !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(e.key)) e.preventDefault()
              }}
              onPaste={e => e.preventDefault()}
            />
          </div>
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <label className={`${TEXT_SIZE} font-medium ${TEXT_PRIMARY} mb-1 block`}>연락처</label>
            <input
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="010-1234-5678"
              maxLength={13}
              className={`rounded-lg px-2 md:px-3 ${INPUT_HEIGHT} w-full ${TEXT_SIZE} focus:outline-none focus:border-[var(--primary)]`}
              style={BORDER_STYLE}
              inputMode="numeric"
              onKeyDown={e => {
                if (!/[0-9]/.test(e.key) && !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(e.key)) e.preventDefault()
              }}
            />
          </div>
          <Button variant="primary" onClick={handleAddClick} className={`${BTN_HEIGHT} ${TEXT_SIZE} shrink-0 w-full lg:w-auto flex items-center justify-center gap-1`}>
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            추가
          </Button>
        </div>

        <div className="border-t border-gray-100 pt-3 hide-select-col no-row-hover">
          <DataTable
            columns={columns}
            data={data}
            selectable={false}
            rowClassName={(_, rowIdx) => (modifiedRowIndices.includes(rowIdx) ? BG_MODIFIED_CLASS : "")}
          />
          {data.length === 0 && <div className={`w-full text-center text-gray-400 mt-6 ${TEXT_SIZE} select-none`}>등록된 참석자가 없습니다</div>}
          <div className="flex justify-end mt-3 md:mt-4">
            <Button variant="action" onClick={handleSendClick} className={`h-8 md:h-10 ${TEXT_SIZE} flex items-center gap-1`}>
              <Send size={16} className="md:w-[18px] md:h-[18px]" />
              전송하기
            </Button>
          </div>
        </div>
      </div>

      {loadModalOpen && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-[400px] max-w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setLoadModalOpen(false)
                setSelectedGroups([])
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">참석자 불러오기</h2>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[250px] overflow-y-auto">
              <label className="flex items-center px-4 py-3 text-xs md:text-base text-gray-800 font-medium bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <input type="checkbox" checked={selectedGroups.length === groupOptions.length} onChange={handleSelectAll} className="w-4 h-4 mr-3 accent-[var(--primary)]" />
                전체 선택
              </label>
              {groupOptions.map(group => (
                <label key={group} className="flex items-center px-4 py-3 text-xs md:text-base text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer">
                  <input type="checkbox" checked={selectedGroups.includes(group)} onChange={() => toggleGroup(group)} className="w-4 h-4 mr-3 accent-[var(--primary)]" />
                  {group}
                </label>
              ))}
            </div>
            <Button variant="primary" onClick={handleLoadByGroups} className="w-full mt-3 h-10 text-xs md:text-base">
              불러오기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
