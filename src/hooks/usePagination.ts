import { useState, useMemo } from "react"

export default function usePagination<T>(data: T[], perPage: number = 30) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalCount = data.length
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return data.slice(start, start + perPage)
  }, [data, currentPage, perPage])

  const onPageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return { currentPage, totalPages, totalCount, currentData, onPageChange, perPage }
}
