import React from "react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPages = () => {
    const pages: number[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const pages = getPages()

  return (
    <div className="flex justify-center items-center gap-1 md:gap-1.5 mt-2 md:mt-3 text-xs md:text-sm flex-wrap">
      <button
        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-[var(--border)] rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft size={16} className="md:w-[18px] md:h-[18px]" />
      </button>

      <button
        className="h-8 md:h-9 px-3 md:px-4 border border-[var(--border)] rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border rounded-lg transition ${
            page === currentPage ? "bg-[var(--primary)] border-[var(--primary)] text-white font-semibold" : "border-[var(--border)] hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        className="h-8 md:h-9 px-3 md:px-4 border border-[var(--border)] rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </button>

      <button
        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-[var(--border)] rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight size={16} className="md:w-[18px] md:h-[18px]" />
      </button>
    </div>
  )
}
