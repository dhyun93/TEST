import React from "react"
import Button from "@/components/common/base/Button"
import CustomSelect from "./CustomSelect"
import DatePicker from "@/components/common/inputs/DatePicker"
import { EDUCATION_COURSE_OPTIONS, EDUCATION_TARGET_OPTIONS } from "@/constants/options/education"
import {
  CONTRACTOR_DOCUMENT_TYPE_OPTIONS,
  INSPECTION_FIELD_OPTIONS,
  INSPECTION_KIND_OPTIONS,
  REPORT_DOCUMENT_TYPE_OPTIONS,
} from "@/constants/options/inspection"

interface FilterBarProps {
  showDateRange?: boolean
  startDate?: string
  endDate?: string
  onStartDate?: (date: string) => void
  onEndDate?: (date: string) => void
  keyword?: string
  onKeywordChange?: (value: string) => void
  searchText?: string
  onSearchText?: (value: string) => void
  educationCourse?: string
  onEducationCourseChange?: (value: string) => void
  educationTarget?: string
  onEducationTargetChange?: (value: string) => void
  inspectionField?: string
  onInspectionFieldChange?: (value: string) => void
  inspectionKind?: string
  onInspectionKindChange?: (value: string) => void
  reportDocumentType?: string
  onReportDocumentTypeChange?: (value: string) => void
  reportDocumentTypeOptionsList?: { value: string; label: string }[]
  groupFilter?: string
  onGroupFilterChange?: (value: string) => void
  groupOptions?: { value: string; label: string }[]
  onSearch: () => void
  rightContent?: React.ReactNode
}

const TEXT_CLASS = "text-gray-800"
const INPUT_CLASS = `h-[32px] md:h-[36px] border border-[var(--border)] rounded-[8px] px-2 md:px-3 bg-white focus:outline-none focus:border-[var(--primary)] text-xs md:text-sm font-normal ${TEXT_CLASS} placeholder:text-xs placeholder:md:text-sm placeholder:text-gray-500`
const SELECT_WIDTH = "w-full sm:w-[220px]"
const DATE_WIDTH = "flex-1 sm:w-[130px] w-full"

const courseOptions = EDUCATION_COURSE_OPTIONS
const targetOptions = EDUCATION_TARGET_OPTIONS

export const inspectionFieldOptions = INSPECTION_FIELD_OPTIONS
export const inspectionKindOptions = INSPECTION_KIND_OPTIONS
export const reportDocumentTypeOptions = REPORT_DOCUMENT_TYPE_OPTIONS
export const contractorDocumentTypeOptions = CONTRACTOR_DOCUMENT_TYPE_OPTIONS

const FilterBar: React.FC<FilterBarProps> = ({
  showDateRange = true,
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  keyword,
  onKeywordChange,
  searchText,
  onSearchText,
  educationCourse,
  onEducationCourseChange,
  educationTarget,
  onEducationTargetChange,
  inspectionField,
  onInspectionFieldChange,
  inspectionKind,
  onInspectionKindChange,
  reportDocumentType,
  onReportDocumentTypeChange,
  reportDocumentTypeOptionsList,
  groupFilter,
  onGroupFilterChange,
  groupOptions,
  onSearch,
  rightContent,
}) => {
  const shouldShowDate = Boolean(showDateRange && startDate !== undefined && endDate !== undefined && onStartDate && onEndDate)
  const hasSearchInput = (keyword !== undefined && onKeywordChange) || (searchText !== undefined && onSearchText)

  return (
    <section className="tbm-filter w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-2 px-2 md:px-3 py-2 md:py-3 mb-2 md:mb-3 bg-white border border-[var(--border)] rounded-[10px]">
      <div className="flex flex-wrap items-center gap-2 flex-grow min-w-0 w-full md:w-auto">
        {shouldShowDate && (
          <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto min-w-0">
            <span className="text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap shrink-0">기간</span>
            <div className="flex items-center gap-1 md:gap-2 flex-1 sm:flex-none w-full sm:w-auto">
              <DatePicker value={startDate || ""} onChange={onStartDate!} placeholder="시작일" className={DATE_WIDTH} />
              <span className="text-xs md:text-sm font-normal text-gray-800 select-none shrink-0">~</span>
              <DatePicker value={endDate || ""} onChange={onEndDate!} placeholder="종료일" className={DATE_WIDTH} />
            </div>
          </div>
        )}
        {((educationCourse !== undefined && onEducationCourseChange) || (educationTarget !== undefined && onEducationTargetChange)) && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            {educationCourse !== undefined && onEducationCourseChange && <CustomSelect value={educationCourse} onChange={onEducationCourseChange} options={courseOptions} className={SELECT_WIDTH} />}
            {educationTarget !== undefined && onEducationTargetChange && <CustomSelect value={educationTarget} onChange={onEducationTargetChange} options={targetOptions} className={SELECT_WIDTH} />}
          </div>
        )}
        {((inspectionField !== undefined && onInspectionFieldChange) || (inspectionKind !== undefined && onInspectionKindChange)) && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            {inspectionKind !== undefined && onInspectionKindChange && (
              <CustomSelect value={inspectionKind} onChange={onInspectionKindChange} options={inspectionKindOptions} className={SELECT_WIDTH} />
            )}
            {inspectionField !== undefined && onInspectionFieldChange && (
              <CustomSelect value={inspectionField} onChange={onInspectionFieldChange} options={inspectionFieldOptions} className={SELECT_WIDTH} />
            )}
          </div>
        )}
        {reportDocumentType !== undefined && onReportDocumentTypeChange && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            <CustomSelect value={reportDocumentType} onChange={onReportDocumentTypeChange} options={reportDocumentTypeOptionsList || reportDocumentTypeOptions} className={SELECT_WIDTH} />
          </div>
        )}
        {groupFilter !== undefined && onGroupFilterChange && groupOptions && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            <CustomSelect value={groupFilter} onChange={onGroupFilterChange} options={groupOptions} className={SELECT_WIDTH} />
          </div>
        )}
        {hasSearchInput ? (
          <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto">
              <input
                type="text"
                className={`${INPUT_CLASS} flex-1 w-full sm:w-[250px]`}
                placeholder="검색어 입력"
                value={keyword ?? searchText ?? ""}
                onChange={e => {
                  if (onKeywordChange) onKeywordChange(e.target.value)
                  else if (onSearchText) onSearchText(e.target.value)
                }}
              />
              <Button variant="primary" className="h-[32px] md:h-[36px] px-3 md:px-5 text-xs md:text-sm shrink-0" onClick={onSearch}>
                검색
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto">
            <Button variant="primary" className="h-[32px] md:h-[36px] px-3 md:px-5 text-xs md:text-sm w-full sm:w-auto" onClick={onSearch}>
              검색
            </Button>
          </div>
        )}
      </div>
      {rightContent && <div className="flex items-center shrink-0">{rightContent}</div>}
    </section>
  )
}

export default FilterBar
