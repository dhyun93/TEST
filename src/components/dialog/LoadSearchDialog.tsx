import React, { useState, useEffect, useMemo } from "react"
import { X, Search } from "lucide-react"
import { DIALOG_STYLES } from "./DialogCommon"

export interface SearchItem {
  id: string | number
  name: string
  [key: string]: any
}

interface LoadSearchDialogProps {
  isOpen: boolean
  title: string
  items: SearchItem[]
  onSelect: (item: SearchItem) => void
  onClose: () => void
  placeholder?: string
  emptyMessage?: string
}

export default function LoadSearchDialog({ isOpen, title, items, onSelect, onClose, placeholder = "검색", emptyMessage = "검색 결과가 없습니다." }: LoadSearchDialogProps) {
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    if (isOpen) {
      setSearchText("")
    }
  }, [isOpen])

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items
    const search = searchText.toLowerCase()
    return items.filter(item => item.name.toLowerCase().includes(search))
  }, [items, searchText])

  const handleSelect = (item: SearchItem) => {
    onSelect(item)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlayHighZ}>
      <div className={DIALOG_STYLES.containerSearch}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>{title}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder={placeholder} className={`${DIALOG_STYLES.input} pr-10`} autoFocus />
            <Search size={18} className={DIALOG_STYLES.searchIcon} />
          </div>
        </div>

        <div className={DIALOG_STYLES.listContainer}>
          {filteredItems.length > 0 ? (
            <ul className={DIALOG_STYLES.listDivider}>
              {filteredItems.map(item => (
                <li key={item.id} onClick={() => handleSelect(item)} className={DIALOG_STYLES.listItem}>
                  <div className={DIALOG_STYLES.listItemText}>{item.name}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={DIALOG_STYLES.emptyState}>{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}
