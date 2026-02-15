import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import Pagination from "@/components/common/base/Pagination"
import usePagination from "@/hooks/usePagination"
import useTabNavigation from "@/hooks/useTabNavigation"
import useHandlers, { useQRSelectionHandlers } from "@/hooks/useHandlers"
import { CirclePlus, Trash2, FileSpreadsheet, Printer, QrCode } from "lucide-react"
import QRDialog from "@/components/QR/QRDialog"
import { DocumentTemplate } from "@/docExport"
import TotalCount from "@/components/common/base/TotalCount"
import { getEducationList, getEducationDelete, getEducationDetail, EducationPost, EducationDetailPost } from "@/api/03_SafetyEducation/education.api"
import { EDUCATION_COURSE_OPTIONS, EDUCATION_METHOD_OPTIONS, EDUCATION_TARGET_OPTIONS } from "@/constants/options/education"
import useFilterBar from "@/hooks/useFilterBar"
import { safetyEducationMockData } from "@/data/mockData"
import { formatDateWithDay } from "@/utils/date"
import { getFileNameFromUrl } from "@/utils/file"
import { useDocumentExport } from "@/hooks/useExport"
import { useLoadingStore } from "@/stores/loadingStore"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

type FileItem = {
  id?: number
  url: string
  name?: string
}

type EducationRow = DataRow & {
  id: number | string
  course: string
  targetGroup: string
  eduName: string
  date: string
  eduPeriod: string
  eduTime: string
  eduMethod: string
  eduManager: string
  externalInstructor: string
  trainer: string
  riskAssessment: string
  proof: FileItem[] | string
  sitePhotos: string[]
  eduMaterial?: FileItem | FileItem[]
  attachmentFiles?: FileItem[]
  manage?: string
}

const TAB_LABELS = ["안전보건교육"]
const TAB_PATHS = ["/safety-education/education"]

const educationColumns: Column[] = [
  { key: "index", label: "번호", type: "index" },
  { key: "course", label: "교육과정" },
  { key: "targetGroup", label: "교육대상" },
  { key: "eduName", label: "교육명" },
  { key: "date", label: "교육일자" },
  { key: "trainer", label: "강사" },
  { key: "sitePhotos", label: "현장사진", type: "photo" },
  { key: "eduMaterial", label: "교육자료", type: "download" },
  { key: "proof", label: "첨부파일", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

const DEFAULT_COMPANY = "(주)경인EPS 오창공장"

type OptionWithId = { value: string; label: string; id?: number }

const educationCourseOptions: ReadonlyArray<OptionWithId> = EDUCATION_COURSE_OPTIONS
const educationTargetOptions: ReadonlyArray<OptionWithId> = EDUCATION_TARGET_OPTIONS

const getOptionIdByValue = (options: ReadonlyArray<OptionWithId>, value: string) => options.find(opt => opt.value === value)?.id

const getOptionLabelById = (options: ReadonlyArray<OptionWithId>, id: number) => options.find(opt => opt.id === id)?.label || ""

const toNumberId = (value: number | string) => {
  if (typeof value === "number") return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const methodOptions = EDUCATION_METHOD_OPTIONS.map(option => option.label)
const getMethodLabelById = (id: number) => EDUCATION_METHOD_OPTIONS.find(option => option.id === id)?.label || ""

const normalizeFileName = (file: FileItem) => file.name || getFileNameFromUrl(file.url) || "file"

const toFileList = (value?: FileItem | FileItem[]) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const generateDocNumber = (prefix: string, dateStr?: string) => {
  const date = dateStr ? new Date(dateStr.split("(")[0]) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `${prefix}_${year}${month}${day}_${num}`
}

const createEducationTemplate = (row: EducationRow): DocumentTemplate => ({
  id: `education-${row.id}`,
  title: "안전보건교육",
  companyName: DEFAULT_COMPANY,
  documentNumber: generateDocNumber("EDU", row.date),
  createdAt: row.date,
  showApproval: true,
  fields: [
    { label: "교육명", value: row.eduName, type: "text", section: "overview", colSpan: 2 },
    { label: "교육대상", value: row.targetGroup, type: "text", section: "overview" },
    { label: "교육과정", value: row.course, type: "text", section: "overview" },
    { label: "교육기간", value: row.eduPeriod, type: "text", section: "overview" },
    { label: "교육시간", value: row.eduTime, type: "text", section: "overview" },
    { label: "교육방식", value: row.eduMethod, type: "text", section: "overview" },
    { label: "교육담당자", value: row.eduManager, type: "text", section: "overview" },
    { label: "외부강사", value: row.externalInstructor || row.trainer || "-", type: "text", section: "overview" },
    { label: "위험성평가", value: row.riskAssessment || "-", type: "text", section: "overview" },
    ...(row.manage ? [{ label: "비고", value: row.manage, type: "textarea" as const, section: "content" as const }] : []),
    ...(toFileList(row.eduMaterial).length ? [{ label: "교육자료", value: toFileList(row.eduMaterial).map(normalizeFileName), type: "files" as const, section: "content" as const }] : []),
    ...(row.attachmentFiles?.length ? [{ label: "첨부파일", value: row.attachmentFiles.map(normalizeFileName), type: "files" as const, section: "content" as const }] : []),
    ...(row.sitePhotos?.length ? [{ label: "현장사진", value: row.sitePhotos, type: "photos" as const, section: "content" as const }] : []),
  ],
})

const mapEducationPostToRow = (post: EducationPost): EducationRow => ({
  id: post.id,
  course: (() => {
    const courseId = toNumberId(post.type)
    return typeof courseId === "number" ? getOptionLabelById(educationCourseOptions, courseId) : ""
  })(),
  targetGroup: (() => {
    const targetId = toNumberId(post.category)
    return typeof targetId === "number" ? getOptionLabelById(educationTargetOptions, targetId) : ""
  })(),
  eduName: post.title,
  date: formatDateWithDay(post.training_start),
  eduPeriod: `${post.training_start} ~ ${post.training_end}`,
  eduTime: "",
  eduMethod: "",
  eduManager: post.name,
  externalInstructor: "",
  trainer: post.teacher,
  riskAssessment: "",
  proof: post.files,
  sitePhotos: post.photofile.map(p => p.url),
  eduMaterial: post.education_data,
  attachmentFiles: post.files,
})

const mapEducationDetailToRow = (detail: EducationDetailPost): EducationRow => {
  const courseId = toNumberId(detail.type)
  const targetId = toNumberId(detail.training_target ?? detail.category)
  const methodId = toNumberId(detail.category)
  const startTime = detail.start_time ? detail.start_time.slice(0, 5) : ""
  const endTime = detail.end_time ? detail.end_time.slice(0, 5) : ""
  const eduTime = startTime && endTime ? `${startTime} ~ ${endTime}` : ""
  const riskAssessment = detail.risk_id ? String(detail.risk_id) : detail.business_id_id ? String(detail.business_id_id) : ""

  return {
    id: detail.id,
    course: typeof courseId === "number" ? getOptionLabelById(educationCourseOptions, courseId) : "",
    targetGroup: typeof targetId === "number" ? getOptionLabelById(educationTargetOptions, targetId) : "",
    eduName: detail.title,
    date: formatDateWithDay(detail.training_start),
    eduPeriod: `${detail.training_start} ~ ${detail.training_end}`,
    eduTime,
    eduMethod: typeof methodId === "number" ? getMethodLabelById(methodId) : "",
    eduManager: detail.name,
    externalInstructor: "",
    trainer: detail.teacher,
    riskAssessment,
    proof: detail.files,
    sitePhotos: detail.photofile.map(p => p.url),
    eduMaterial: detail.education_data,
    attachmentFiles: detail.files,
  }
}

export default function EducationList() {
  const navigate = useNavigate()
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrSelectedId, setQrSelectedId] = useState<number | string | null>(null)

  const qrUrl = qrSelectedId ? `${window.location.origin}/public/education?id=${qrSelectedId}` : `${window.location.origin}/public/education`
  const { currentIndex, handleTabClick } = useTabNavigation(TAB_PATHS)

    // dummy data
    const [mockData, setMockData] = useState<EducationRow[]>(safetyEducationMockData as EducationRow[])
  const {
    educationCourse: mockEducationCourse,
    setEducationCourse: setMockEducationCourse,
    educationTarget: mockEducationTarget,
    setEducationTarget: setMockEducationTarget,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({ data: mockData, dateKey: "date", searchKeys: ["eduName", "trainer", "course"] })
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<EducationRow>(mockFilteredData as EducationRow[], 30)

    // BE API
    const [apiData, setApiData] = useState<EducationRow[]>([])
  const { setLoading } = useLoadingStore()
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiEducationCourse, setApiEducationCourse] = useState("")
  const [apiEducationTarget, setApiEducationTarget] = useState("")
  const [apiFilters, setApiFilters] = useState({ educationCourse: "", educationTarget: "" })
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)
  const [exportRows, setExportRows] = useState<EducationRow[]>([])
  const [exportAction, setExportAction] = useState<"excel" | "print" | null>(null)

  const fetchEducationList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    setLoading(true)
    try {
      const categoryId = getOptionIdByValue(educationCourseOptions, apiFilters.educationCourse)
      const targetId = getOptionIdByValue(educationTargetOptions, apiFilters.educationTarget)

      const params: Record<string, number> = { page: apiCurrentPage }
      if (typeof categoryId === "number") params.category = categoryId
      if (typeof targetId === "number") params.training_target = targetId

      const response = await getEducationList(params)

      if (response.code === 200) {
        const mappedData = response.posts.map(mapEducationPostToRow)
        setApiData(mappedData)
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 0)
      }
    } catch (error) {
      console.error("교육 목록 조회 실패:", error)
    } finally {
      setLoading(false)
    }
  }, [apiCurrentPage, apiFilters])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchEducationList()
    }
  }, [fetchEducationList])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    const timer = window.setTimeout(() => {
      setApiCurrentPage(1)
      setApiFilters({ educationCourse: apiEducationCourse, educationTarget: apiEducationTarget })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [apiEducationCourse, apiEducationTarget])

  const apiHandleSearch = () => {
    setApiCurrentPage(1)
    setApiFilters({ educationCourse: apiEducationCourse, educationTarget: apiEducationTarget })
  }

  const { currentData: apiCurrentData } = usePagination<EducationRow>(apiData, 30)

  // API 삭제 함수
  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getEducationDelete({ post_id: postIds })

      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchEducationList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

    // 데이터 분기
    const data = USE_MOCK_DATA ? (mockFilteredData as EducationRow[]) : apiData
  const setData = USE_MOCK_DATA ? setMockData : setApiData
  const currentPage = USE_MOCK_DATA ? mockCurrentPage : apiCurrentPage
  const totalPages = USE_MOCK_DATA ? mockTotalPages : Math.max(1, apiTotalPages)
  const currentData = USE_MOCK_DATA ? mockCurrentData : apiCurrentData
  const onPageChange = USE_MOCK_DATA ? mockOnPageChange : setApiCurrentPage
  const educationCourse = USE_MOCK_DATA ? mockEducationCourse : apiEducationCourse
  const setEducationCourse = USE_MOCK_DATA ? setMockEducationCourse : setApiEducationCourse
  const educationTarget = USE_MOCK_DATA ? mockEducationTarget : apiEducationTarget
  const setEducationTarget = USE_MOCK_DATA ? setMockEducationTarget : setApiEducationTarget
  const handleSearch = USE_MOCK_DATA ? mockHandleSearch : apiHandleSearch

  const {
    handleDelete: mockHandleDelete,
    handleExcelDownload,
    handlePrint,
    isDownloading,
    isPrinting,
  } = useHandlers<EducationRow>({
    data,
    checkedIds,
    onDeleteSuccess: ids => setData(prev => prev.filter(r => !ids.includes(r.id))),
    createTemplate: createEducationTemplate,
  })

  const { handleExcelDownload: handleDetailExcelDownload, handlePrint: handleDetailPrint } = useDocumentExport<EducationRow>({
    data: exportRows,
    checkedIds,
    createTemplate: createEducationTemplate,
  })

  const fetchDetailRows = async (): Promise<EducationRow[]> => {
    const selectedRows = currentData.filter(row => checkedIds.includes(row.id))
    if (selectedRows.length === 0) return []

    const detailResponses = await Promise.all(
      selectedRows.map(async row => {
        const response = await getEducationDetail({ post_id: Number(row.id) })
        const detail = response.post || response.posts?.[0]
        return detail ? mapEducationDetailToRow(detail) : null
      })
    )

    return detailResponses.filter((item): item is EducationRow => Boolean(item))
  }

  const handleExportWithDetails = async (action: "excel" | "print") => {
    if (checkedIds.length === 0) {
      alert("항목을 선택하세요")
      return
    }
    try {
      setLoading(true)
      const details = await fetchDetailRows()
      if (details.length === 0) {
        alert("상세 데이터를 불러오지 못했습니다.")
        return
      }
      setExportRows(details)
      setExportAction(action)
    } catch (error) {
      console.error("상세 데이터 조회 실패:", error)
      alert("상세 데이터를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!exportAction || exportRows.length === 0) return
    if (exportAction === "excel") {
      void handleDetailExcelDownload()
    } else {
      void handleDetailPrint()
    }
    setExportRows([])
    setExportAction(null)
  }, [exportAction, exportRows, handleDetailExcelDownload, handleDetailPrint])

  // 모드에 따른 삭제 함수 선택
  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const { handleOpenQRSelection } = useQRSelectionHandlers<EducationRow>({
    data,
    checkedIds,
    onOpenQRModal: id => {
      setQrSelectedId(id)
      setQrDialogOpen(true)
    },
  })

  return (
    <section className="education-content w-full bg-white">
      <PageTitle>안전보건교육</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />
      <div className="mb-3">
        <FilterBar
          showDateRange={false}
          educationCourse={educationCourse}
          onEducationCourseChange={setEducationCourse}
          educationTarget={educationTarget}
          onEducationTargetChange={setEducationTarget}
          onSearch={handleSearch}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <TotalCount count={USE_MOCK_DATA ? data.length : apiTotalCount} />
        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex gap-1 justify-end">
            <Button variant="action" onClick={() => navigate("/safety-education/register", { state: { mode: "create" } })} className="flex items-center gap-1">
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" loading={isPrinting} onClick={() => handleExportWithDetails("print")} className="flex items-center gap-1">
              <Printer size={16} />
              인쇄
            </Button>
            <Button variant="action" loading={isDownloading} onClick={() => handleExportWithDetails("excel")} className="flex items-center gap-1">
              <FileSpreadsheet size={16} />
              Excel
            </Button>
            <Button variant="action" onClick={() => handleOpenQRSelection("education")} className="flex items-center gap-1">
              <QrCode size={16} />
              QR
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button variant="action" onClick={() => navigate("/safety-education/register", { state: { mode: "create" } })} className="flex items-center gap-1">
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" loading={isPrinting} onClick={() => handleExportWithDetails("print")} className="flex items-center gap-1">
            <Printer size={16} />
            인쇄
          </Button>
          <Button variant="action" loading={isDownloading} onClick={() => handleExportWithDetails("excel")} className="flex items-center gap-1">
            <FileSpreadsheet size={16} />
            Excel
          </Button>
          <Button variant="action" onClick={() => handleOpenQRSelection("education")} className="flex items-center gap-1">
            <QrCode size={16} />
            QR
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={educationColumns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onManageClick={row => navigate("/safety-education/register", { state: { mode: "edit", postId: row.id } })}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <QRDialog
        open={qrDialogOpen}
        onClose={() => {
          setQrDialogOpen(false)
          setQrSelectedId(null)
        }}
        url={qrUrl}
        title="안전보건교육 QR코드"
      />
    </section>
  )
}
