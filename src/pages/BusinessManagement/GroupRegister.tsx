import React, { useState, useEffect } from "react"
import Button from "@/components/common/base/Button"
import { AttendeeGroup } from "@/data/mockBusinessData"
import { DataRow } from "@/components/common/tables/DataTable"
import { Trash2, X } from "lucide-react"
import { useGroupHandlers } from "@/hooks/useHandlers"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type GroupRegisterModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (groupName: string) => void
  onDelete: (groupId: number) => void
  existingGroups: AttendeeGroup[]
  attendees: DataRow[]
}

export default function GroupRegisterModal({ isOpen, onClose, onSave, onDelete, existingGroups, attendees }: GroupRegisterModalProps) {
  const [groupName, setGroupName] = useState("")

  const { getGroupMemberCount, handleGroupSave, handleGroupDelete } = useGroupHandlers({
    groups: existingGroups,
    attendees,
    onGroupSave: onSave,
    onGroupDelete: onDelete,
  })

  useEffect(() => {
    if (isOpen) {
      setGroupName("")
    }
  }, [isOpen])

  const handleSave = () => {
    if (handleGroupSave(groupName)) {
      setGroupName("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === " ") {
      e.preventDefault()
    }
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerSm}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>그룹관리</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className={DIALOG_STYLES.contentWithSpace}>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="그룹명 입력"
                className="flex-1 h-10 border border-[var(--border)] rounded-lg px-2 text-xs md:text-base focus:outline-none focus:border-[var(--primary)] placeholder:text-xs md:placeholder:text-base placeholder:text-gray-500"
              />
              <Button variant="primary" onClick={handleSave} className="h-10 text-xs md:text-sm">
                추가
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2">목록</h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[200px] overflow-y-auto">
              <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-400">기본그룹</span>
                  <span className="text-[10px] md:text-xs text-gray-300">{getGroupMemberCount("기본그룹")}</span>
                </div>
              </div>
              {existingGroups.map(group => (
                <div key={group.id} className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-gray-800">{group.name}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">{getGroupMemberCount(group.name)}</span>
                  </div>
                  <button onClick={() => handleGroupDelete(group)} className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                    <Trash2 size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
