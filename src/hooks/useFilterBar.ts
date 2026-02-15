import { useState, useMemo, useCallback } from "react"

export interface FilterConfig {
  dateKey?: string
  searchKeys?: string[]
  selectFilters?: {
    key: string
    value: string
  }[]
}

export interface UseFilterBarOptions<T> {
  data: T[]
  dateKey?: string
  searchKeys?: string[]
}

export default function useFilterBar<T extends Record<string, any>>(options: UseFilterBarOptions<T> = { data: [] }) {
  const { data = [], dateKey = "date", searchKeys = [] } = options

  const today = new Date()
  const koreaToday = new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchText, setSearchText] = useState("")
  const [appliedSearchText, setAppliedSearchText] = useState("")

  const [educationCourse, setEducationCourse] = useState("")
  const [educationTarget, setEducationTarget] = useState("")
  const [inspectionField, setInspectionField] = useState("")
  const [inspectionKind, setInspectionKind] = useState("")
  const [reportDocumentType, setReportDocumentType] = useState("")

  const handleStartDateChange = useCallback(
    (date: string) => {
      if (endDate && date > endDate) {
        setEndDate(date)
      }
      setStartDate(date)
    },
    [endDate]
  )

  const handleEndDateChange = useCallback(
    (date: string) => {
      if (startDate && date < startDate) {
        setStartDate(date)
      }
      setEndDate(date)
    },
    [startDate]
  )

  const parseDate = (dateStr: string): string => {
    if (!dateStr) return ""
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (match) return `${match[1]}-${match[2]}-${match[3]}`
    const koreanMatch = dateStr.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
    if (koreanMatch) {
      return `${koreanMatch[1]}-${koreanMatch[2].padStart(2, "0")}-${koreanMatch[3].padStart(2, "0")}`
    }
    return ""
  }

  const filteredData = useMemo(() => {
    let result = [...data]

    if (startDate || endDate) {
      result = result.filter(item => {
        const itemDateStr = item[dateKey]
        if (!itemDateStr) return true
        const itemDate = parseDate(String(itemDateStr))
        if (!itemDate) return true

        if (startDate && itemDate < startDate) return false
        if (endDate && itemDate > endDate) return false
        return true
      })
    }

    if (appliedSearchText && searchKeys.length > 0) {
      const lowerSearch = appliedSearchText.toLowerCase()
      result = result.filter(item =>
        searchKeys.some(key =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(lowerSearch)
        )
      )
    }

    if (educationCourse) {
      result = result.filter(item => String(item.course ?? item.educationCourse ?? "").includes(educationCourse))
    }

    if (educationTarget) {
      result = result.filter(item => String(item.target ?? item.educationTarget ?? "").includes(educationTarget))
    }

    if (inspectionField) {
      result = result.filter(item => String(item.field ?? item.inspectionField ?? "").includes(inspectionField))
    }

    if (inspectionKind) {
      result = result.filter(item => String(item.kind ?? item.inspectionKind ?? item.type ?? "").includes(inspectionKind))
    }

    if (reportDocumentType) {
      result = result.filter(item => {
        const docType = item.documentType
        const typeValue = typeof docType === "object" ? docType?.text : docType
        return String(typeValue ?? item.type ?? "").includes(reportDocumentType)
      })
    }

    return result
  }, [data, startDate, endDate, dateKey, appliedSearchText, searchKeys, educationCourse, educationTarget, inspectionField, inspectionKind, reportDocumentType])

  const resetFilters = useCallback(() => {
    setStartDate("")
    setEndDate("")
    setSearchText("")
    setAppliedSearchText("")
    setEducationCourse("")
    setEducationTarget("")
    setInspectionField("")
    setInspectionKind("")
    setReportDocumentType("")
  }, [])

  const handleSearch = useCallback(() => {
    setAppliedSearchText(searchText)
  }, [searchText])

  return {
    startDate,
    endDate,
    searchText,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    setSearchText,

    educationCourse,
    setEducationCourse,
    educationTarget,
    setEducationTarget,
    inspectionField,
    setInspectionField,
    inspectionKind,
    setInspectionKind,
    reportDocumentType,
    setReportDocumentType,

    resetFilters,
    handleSearch,
    filteredData,
  }
}
