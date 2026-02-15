import React from "react"

export interface TabMenuProps {
  tabs: string[]
  activeIndex: number
  onTabClick: (idx: number) => void
  className?: string
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs, activeIndex, onTabClick, className = "" }) => {
  return (
    <nav className={`flex overflow-x-auto sm:overflow-visible border-b border-[var(--border)] ${className}`} aria-label="탭 메뉴">
      <div className="flex space-x-1 min-w-max">
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIndex
          return (
            <button
              key={tab}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabClick(idx)}
              className={`whitespace-nowrap py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 text-[11px] sm:text-xs md:text-sm font-medium ${isActive ? "border-b-2 border-[var(--secondary)] text-[var(--secondary)]" : "border-b-2 border-transparent text-gray-500 hover:text-gray-900"} focus:outline-none`}
            >
              {tab}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default TabMenu
