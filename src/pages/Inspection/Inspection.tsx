import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Button from "@/components/common/base/Button"
import FilterBar from "@/components/common/base/FilterBar"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import Pagination from "@/components/common/base/Pagination"
import InspectionLog from "@/pages/Inspection/InspectionLog"
import InspectionPlanRegister from "@/pages/Inspection/InspectionPlanRegister"
import InspectionRoutine from "@/pages/Inspection/InspectionRoutine"
import usePagination from "@/hooks/usePagination"
import useHandlers from "@/hooks/useHandlers"
import useFilterBar from "@/hooks/useFilterBar"
import { CirclePlus, CalendarCheck, List, Trash2, QrCode, Printer } from "lucide-react"
import QRDialog from "@/components/QR/QRDialog"
import InfoBox from "@/components/common/base/InfoBox"
import { inspectionResultsMockData, inspectionPlanMockData, inspectionLogViewItems, InspectionCheckItem } from "@/data/mockData"
import TotalCount from "@/components/common/base/TotalCount"
import { getPlans } from "@/api/04_Inspection/inspection.api"
import { INSPECTION_FIELD_OPTIONS, INSPECTION_KIND_OPTIONS } from "@/constants/options/inspection"
import { formatDateYMD } from "@/utils/date"

const TAB_LABELS = ["점검목록", "점검표(체크리스트)관리"]

// true = dummy, false = BE API
const USE_MOCK_DATA = false

type InspectionRow = DataRow & {
  id: number | string
  template: string
  workplace: string
  field: string
  kind: string
  inspector: string
  schedule: string
  registeredAt: string
  status: "예정" | "진행중" | "완료"
  notes?: string
}

type OptionWithId = { value: string; label: string; id?: number }
const inspectionFieldOptions: ReadonlyArray<OptionWithId> = INSPECTION_FIELD_OPTIONS
const inspectionKindOptions: ReadonlyArray<OptionWithId> = INSPECTION_KIND_OPTIONS

const getOptionIdByValue = (options: ReadonlyArray<OptionWithId>, value: string) => options.find(opt => opt.value === value)?.id
const getOptionLabelById = (options: ReadonlyArray<OptionWithId>, id: number) => options.find(opt => opt.id === id)?.label || ""

const convertPlanToInspection = (plan: DataRow): InspectionRow => {
  const progressMap: Record<string, "예정" | "진행중" | "완료"> = {
    미점검: "예정",
    진행중: "진행중",
    완료: "완료",
  }

  return {
    id: `plan-${plan.id}`,
    template: plan.planName as string,
    workplace: plan.site as string,
    field: plan.area as string,
    kind: plan.kind as string,
    inspector: plan.inspector as string,
    schedule: plan.schedule as string,
    registeredAt: formatDateYMD("2025-01-05"),
    status: progressMap[plan.progress as string] || "예정",
    notes: "",
  }
}

const convertResultToInspection = (result: DataRow): InspectionRow => {
  const dateStr = result.inspectedAt as string
  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
  const formattedSchedule = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : dateStr

  return {
    id: `result-${result.id}`,
    template: result.template as string,
    workplace: result.workplace as string,
    field: result.field as string,
    kind: result.kind as string,
    inspector: result.inspector as string,
    schedule: formattedSchedule,
    registeredAt: formatDateYMD(dateStr.split("(")[0]),
    status: "완료",
    notes: result.notes as string,
  }
}

const mapInspectionPostToRow = (post: any): InspectionRow => {
  const schedule = post.end_date ? `${formatDateYMD(post.start_date)} ~ ${formatDateYMD(post.end_date)}` : formatDateYMD(post.start_date)
  const fieldId = typeof post.category === "number" ? post.category : Number(post.category)
  const kindId = typeof post.type === "number" ? post.type : Number(post.type)
  return {
    id: post.id,
    template: post.title,
    workplace: post.place,
    field: Number.isNaN(fieldId) ? "" : getOptionLabelById(inspectionFieldOptions, fieldId),
    kind: Number.isNaN(kindId) ? "" : getOptionLabelById(inspectionKindOptions, kindId),
    inspector: post.name || post.person || "",
    schedule,
    registeredAt: formatDateYMD(post.start_date),
    status: post.is_wrap_up === 1 ? "완료" : "예정",
    notes: "",
  }
}

export default function Inspection() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get("tab")
  const currentIndex = tabParam === TAB_LABELS[1] ? 1 : 0

  const handleTabClick = (idx: number) => {
    const tabName = TAB_LABELS[idx]
    if (idx === 0) {
      navigate(`/inspection?tab=${encodeURIComponent(tabName)}`)
    } else if (idx === 1) {
      navigate(`/inspection/checklist?tab=${encodeURIComponent(tabName)}`)
    }
  }

  useEffect(() => {
    if (!tabParam) {
      navigate(`/inspection?tab=${encodeURIComponent(TAB_LABELS[0])}`, { replace: true })
    }
  }, [])

  const [isRoutineRegisterOpen, setIsRoutineRegisterOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const qrUrl = `${window.location.origin}/public/inspection`

  const allInspectionData = useMemo(() => {
    const planData = inspectionPlanMockData.map(convertPlanToInspection)
    const resultData = inspectionResultsMockData.map(convertResultToInspection)
    const filteredPlanData = planData.filter(p => p.status !== "완료")
    return [...filteredPlanData, ...resultData]
  }, [])

  const [data, setData] = useState<InspectionRow[]>(allInspectionData)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isResultViewOpen, setIsResultViewOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<InspectionRow | null>(null)
  const [resultViewMode, setResultViewMode] = useState<"view" | "edit">("view")
  const [isPlanRegisterOpen, setIsPlanRegisterOpen] = useState(false)
  const [isRoutineListOpen, setIsRoutineListOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const {
    searchText: mockSearchText,
    setSearchText: setMockSearchText,
    inspectionField: mockInspectionField,
    setInspectionField: setMockInspectionField,
    inspectionKind: mockInspectionKind,
    setInspectionKind: setMockInspectionKind,
    filteredData: mockFilteredData,
    handleSearch: mockHandleSearch,
  } = useFilterBar({
    data,
    dateKey: "registeredAt",
    searchKeys: ["template", "workplace", "inspector"],
  })

  const [apiData, setApiData] = useState<InspectionRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiInspectionField, setApiInspectionField] = useState("")
  const [apiInspectionKind, setApiInspectionKind] = useState("")
  const [apiSearchText, setApiSearchText] = useState("")
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)
  const [isListLoading, setIsListLoading] = useState(false)

  const sortedData = useMemo(() => {
    return [...(mockFilteredData as InspectionRow[])].sort((a, b) => {
      if (a.status !== "완료" && b.status === "완료") return -1
      if (a.status === "완료" && b.status !== "완료") return 1
      return 0
    })
  }, [mockFilteredData])

  const { currentPage, totalPages, currentData: pagedData, onPageChange } = usePagination(sortedData, 30)

  const fetchInspectionList = async (pageOverride?: number) => {
    if (USE_MOCK_DATA) return
    setIsListLoading(true)
    try {
      const fieldId = getOptionIdByValue(inspectionFieldOptions, apiInspectionField)
      const kindId = getOptionIdByValue(inspectionKindOptions, apiInspectionKind)

      const params: Record<string, string | number> = { page: pageOverride ?? apiCurrentPage }
      if (typeof fieldId === "number") params.category = fieldId
      if (typeof kindId === "number") params.type = kindId
      if (apiSearchText.trim()) params.query = apiSearchText.trim()

      const response = await getPlans(params)
      if (response.code === 200) {
        setApiData(response.posts.map(mapInspectionPostToRow))
        setApiTotalCount(response.all_count || 0)
        setApiTotalPages(response.all_page_count || 0)
      }
    } catch (error) {
      console.error("점검 목록 조회 실패:", error)
    } finally {
      setIsListLoading(false)
    }
  }

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchInspectionList()
    }
  }, [apiCurrentPage])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    setApiCurrentPage(1)
    fetchInspectionList(1)
  }, [apiInspectionField, apiInspectionKind])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    const timer = window.setTimeout(() => {
      setApiCurrentPage(1)
      fetchInspectionList(1)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [apiSearchText])

  const apiHandleSearch = () => {
    setApiCurrentPage(1)
    fetchInspectionList()
  }

  const { handleDelete } = useHandlers({
    data: USE_MOCK_DATA ? data : apiData,
    checkedIds,
    onDeleteSuccess: deletedIds => {
      if (USE_MOCK_DATA) {
        setData(prev => prev.filter(item => !deletedIds.includes(item.id)))
      } else {
        fetchInspectionList()
      }
      setCheckedIds([])
    },
  })

  const generatePrintHtml = (row: InspectionRow, items: InspectionCheckItem[]) => {
    const groupedItems = items.reduce(
      (acc, item) => {
        const cat = item.category || ""
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
      },
      {} as Record<string, InspectionCheckItem[]>
    )

    return `
<div style="page-break-after: always; padding: 20px; font-family: 'Malgun Gothic', sans-serif; color: #1f2937;">
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
<div style="width: 100px;"></div>
<div style="flex: 1; text-align: center;">
<h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #111827;">점검일지</h1>
</div>
<table style="border-collapse: collapse; border: 1px solid #DFDFDF;">
<tbody>
<tr>
<td rowspan="2" style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; text-align: center; background: #f9fafb; width: 32px; vertical-align: middle; color: #374151;">
<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
<span>결</span><span>재</span>
</div>
</td>
<td style="border: 1px solid #DFDFDF; background: #f9fafb; padding: 4px 12px; font-size: 12px; font-weight: 500; text-align: center; width: 64px; color: #6b7280;">담당</td>
<td style="border: 1px solid #DFDFDF; background: #f9fafb; padding: 4px 12px; font-size: 12px; font-weight: 500; text-align: center; width: 64px; color: #6b7280;">검토</td>
<td style="border: 1px solid #DFDFDF; background: #f9fafb; padding: 4px 8px; font-size: 12px; font-weight: 500; text-align: center; white-space: nowrap; color: #6b7280;">관리책임자</td>
</tr>
<tr>
<td style="border: 1px solid #DFDFDF; height: 40px; width: 64px;"></td>
<td style="border: 1px solid #DFDFDF; height: 40px; width: 64px;"></td>
<td style="border: 1px solid #DFDFDF; height: 40px; width: 64px;"></td>
</tr>
</tbody>
</table>
</div>

<table style="width: 100%; border-collapse: collapse; border: 1px solid #DFDFDF; margin-bottom: 14px;">
<tbody>
<tr>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 11%;">점검표명</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; width: 28%; color: #1f2937;">${row.template}</td>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 11%;">점검종류</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; width: 12%; color: #1f2937;">${row.kind}</td>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 11%;">점검일</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; width: 27%; color: #1f2937;">${row.schedule}</td>
</tr>
<tr>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center;">점검장소</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; color: #1f2937;">${row.workplace}</td>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center;">점검분야</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; color: #1f2937;">${row.field}</td>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center;">점검자</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; color: #1f2937;">${row.inspector} <span style="color: #9ca3af;">(인)</span></td>
</tr>
</tbody>
</table>

<table style="width: 100%; border-collapse: collapse; border: 1px solid #DFDFDF; margin-bottom: 14px;">
<thead>
<tr style="background: #f9fafb;">
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 8%;">구분</th>
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 42%;">점검항목</th>
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 5%;">양호</th>
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 5%;">불량</th>
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 34%;">비고/조치사항</th>
<th style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 6%;">사진</th>
</tr>
</thead>
<tbody>
${Object.entries(groupedItems)
  .map(([category, categoryItems]) =>
    categoryItems
      .map(
        (item, idx) => `
<tr>
${idx === 0 && category ? `<td rowspan="${categoryItems.length}" style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; text-align: center; background: #f9fafb; vertical-align: middle; color: #1f2937;">${category}</td>` : ""}
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; color: #1f2937;">${item.content}</td>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; text-align: center; color: #03386D; font-weight: 600;">${item.status === "양호" ? "○" : ""}</td>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; text-align: center; color: #b91c1c; font-weight: 600;">${item.status === "불량" ? "✕" : ""}</td>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; color: #1f2937;">${item.note || "-"}</td>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; text-align: center; color: #1f2937;">${item.photos.length > 0 ? item.photos.length + "장" : "-"}</td>
</tr>
`
      )
      .join("")
  )
  .join("")}
</tbody>
</table>

<table style="width: 100%; border-collapse: collapse; border: 1px solid #DFDFDF;">
<tbody>
<tr>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; width: 22%; vertical-align: middle;">특이사항 및 위험요인<br/>(일자, 장소 표시 후 기록)</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; min-height: 56px; color: #1f2937;">${row.notes || "-"}</td>
</tr>
<tr>
<th style="background: #f9fafb; border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; font-weight: 500; color: #6b7280; text-align: center; vertical-align: middle;">관리책임자<br/>안전점검 지시사항</th>
<td style="border: 1px solid #DFDFDF; padding: 8px; font-size: 12px; min-height: 56px; color: #1f2937;">-</td>
</tr>
</tbody>
</table>
</div>
`
  }

  const handlePrint = () => {
    if (checkedIds.length === 0) {
      alert("인쇄할 항목을 선택해주세요.")
      return
    }
    const selectedItems = sortedData.filter(item => checkedIds.includes(item.id))
    setIsPrinting(true)

    const printContent = selectedItems.map(row => generatePrintHtml(row, inspectionLogViewItems)).join("")

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>점검일지</title>
<style>
@media print {
body { margin: 0; padding: 0; }
@page { size: A4; margin: 10mm; }
}
body { font-family: 'Malgun Gothic', sans-serif; }
</style>
</head>
<body>
${printContent}
</body>
</html>
`)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }
    }
    setIsPrinting(false)
  }

  const handleProgressClick = (row: InspectionRow) => {
    setSelectedResult(row)
    setResultViewMode(row.status === "완료" ? "view" : "edit")
    setIsResultViewOpen(true)
  }

  const columns: Column<InspectionRow>[] = [
    { key: "index", label: "번호", type: "index" },
    { key: "kind", label: "점검종류" },
    { key: "template", label: "점검표명", minWidth: 180 },
    { key: "workplace", label: "장소" },
    { key: "field", label: "점검분야" },
    { key: "schedule", label: "점검일정", minWidth: 150 },
    { key: "inspector", label: "점검자" },
    { key: "registeredAt", label: "최종등록일", minWidth: 120 },
    {
      key: "status",
      label: "진행여부",
      type: "progress",
      minWidth: 90,
      progressOptions: { doneValue: "완료", doneText: "점검완료", doingText: "점검하기" },
    },
  ]

  const inspectionField = USE_MOCK_DATA ? mockInspectionField : apiInspectionField
  const setInspectionField = USE_MOCK_DATA ? setMockInspectionField : setApiInspectionField
  const inspectionKind = USE_MOCK_DATA ? mockInspectionKind : apiInspectionKind
  const setInspectionKind = USE_MOCK_DATA ? setMockInspectionKind : setApiInspectionKind
  const searchText = USE_MOCK_DATA ? mockSearchText : apiSearchText
  const setSearchText = USE_MOCK_DATA ? setMockSearchText : setApiSearchText
  const handleSearch = USE_MOCK_DATA ? mockHandleSearch : apiHandleSearch

  const displayedData = USE_MOCK_DATA ? pagedData : apiData
  const displayedTotalPages = USE_MOCK_DATA ? totalPages : Math.max(1, apiTotalPages)
  const displayedTotalCount = USE_MOCK_DATA ? sortedData.length : apiTotalCount

  const pageTitle = currentIndex === 0 ? "점검목록" : "점검표(체크리스트)관리"

  return (
    <section className="w-full bg-white">
      <PageTitle>{pageTitle}</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-6">
        <InfoBox message="사업장 환경에 맞게 장소, 분야, 점검종류별로 점검을 등록하고 확인하세요" />
      </div>

      <div className="mb-3">
        <FilterBar
          showDateRange={false}
          inspectionField={inspectionField}
          onInspectionFieldChange={setInspectionField}
          inspectionKind={inspectionKind}
          onInspectionKindChange={setInspectionKind}
          searchText={searchText}
          onSearchText={setSearchText}
          onSearch={handleSearch}
          rightContent={
            <div className="hidden md:flex items-center gap-1">
              <Button variant="accent" onClick={() => setIsRoutineRegisterOpen(true)} className="flex items-center gap-1">
                <CalendarCheck size={16} />
                안전순회 점검일지 작성
              </Button>
              <Button variant="accentOutline" onClick={() => setIsRoutineListOpen(true)} className="flex items-center gap-1">
                <List size={16} />
                안전순회 점검일지
              </Button>
            </div>
          }
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <TotalCount count={displayedTotalCount} />
        <div className="hidden sm:flex flex-nowrap gap-1 w-auto justify-end">
          <Button variant="action" onClick={() => setIsPlanRegisterOpen(true)} className="flex items-center gap-1">
            <CirclePlus size={16} />
            신규등록
          </Button>
          <Button variant="action" onClick={() => setQrDialogOpen(true)} className="flex items-center gap-1">
            <QrCode size={16} />
            QR
          </Button>
          <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
            <Printer size={16} />
            인쇄
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
        <div className="flex flex-col gap-1 w-full justify-end sm:hidden">
          <div className="flex gap-1 justify-end">
            <Button variant="action" onClick={() => setIsPlanRegisterOpen(true)} className="flex items-center gap-1">
              <CirclePlus size={16} />
              신규등록
            </Button>
            <Button variant="action" onClick={() => setQrDialogOpen(true)} className="flex items-center gap-1">
              <QrCode size={16} />
              QR
            </Button>
            <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
              <Printer size={16} />
              인쇄
            </Button>
            <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable columns={columns} data={displayedData} onCheckedChange={setCheckedIds} onProgressClick={handleProgressClick} />
      </div>

      <Pagination currentPage={USE_MOCK_DATA ? currentPage : apiCurrentPage} totalPages={displayedTotalPages} onPageChange={USE_MOCK_DATA ? onPageChange : setApiCurrentPage} />

      <InspectionLog
        open={isResultViewOpen}
        onClose={() => {
          setIsResultViewOpen(false)
          setSelectedResult(null)
        }}
        data={
          selectedResult
            ? {
                id: selectedResult.id,
                template: selectedResult.template,
                workplace: selectedResult.workplace,
                field: selectedResult.field,
                kind: selectedResult.kind,
                inspector: selectedResult.inspector,
                inspectedAt: selectedResult.schedule,
                confirmed: true,
                notes: selectedResult.notes || "",
              }
            : null
        }
        mode={resultViewMode}
      />

      <InspectionPlanRegister open={isPlanRegisterOpen} onClose={() => setIsPlanRegisterOpen(false)} />

      <InspectionRoutine
        listOpen={isRoutineListOpen}
        onListClose={() => setIsRoutineListOpen(false)}
        registerOpen={isRoutineRegisterOpen}
        onRegisterClose={() => setIsRoutineRegisterOpen(false)}
        mode="edit"
      />
      <QRDialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} url={qrUrl} title="점검 QR코드" />
    </section>
  )
}
