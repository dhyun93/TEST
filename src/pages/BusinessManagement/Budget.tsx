import React, { useCallback, useEffect, useMemo, useState } from "react"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import InfoBox from "@/components/common/base/InfoBox"
import YearPicker from "@/components/common/inputs/YearPicker"
import BudgetTable, { BudgetItem } from "@/components/snippetBusiness/BudgetTable"
import InspectionTable, { InspectionItem } from "@/components/snippetBusiness/InspectionTable"
import Button from "@/components/common/base/Button"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import useApproval from "@/hooks/useApproval"
import { Trash2 } from "lucide-react"
import { useBudgetHandlers } from "@/hooks/useHandlers"
import { inspectionItemsMockData, budgetItemsMockData } from "@/data/mockBusinessData"
import TotalCount from "@/components/common/base/TotalCount"
import { getBudgetPlanDelete, getBudgetPlanList, mod_BudgetPlan, BudgetPlanList_Post, getBudgetList, mod_Budget, getBudgetDelete, BudgetList_Post } from "@/api/10_BusinessManagement/03_Budget"
import { useAlerts } from "@/hooks/useAlerts"
import { useLoadingStore } from "@/stores/loadingStore"

const TAB_LABELS = ["예산/목표"]
const currentYear = new Date().getFullYear().toString()
const USE_MOCK_DATA = false

const mapBudgetPlanPostToItem = (post: BudgetPlanList_Post, year: string): InspectionItem => ({
  id: post.id,
  year,
  detailPlan: post.plan,
  q1: post.quarter1 === 1,
  q2: post.quarter2 === 1,
  q3: post.quarter3 === 1,
  q4: post.quarter4 === 1,
  KPI: post.result,
  department: post.charge,
  achievementRate: String(post.rate ?? ""),
  resultRemark: post.reason,
  entryDate: post.created_date || post.created_at || `${year}-01-01`,
})

const getQuarterFromDate = (value: string, fallbackYear: string) => {
  const safeDate = value?.slice(0, 10) || `${fallbackYear}-01-01`
  const [year, month] = safeDate.split("-")
  const monthValue = Number(month) || 1
  const quarter = Math.min(4, Math.max(1, Math.ceil(monthValue / 3)))
  return { year: year || fallbackYear, quarter, entryDate: safeDate }
}

const mapBudgetPostToItem = (post: BudgetList_Post, year: string): BudgetItem => {
  const dateInfo = getQuarterFromDate(post.create_date || post.created_at || "", year)
  const fileUrl = (post as any).file || post.files || ""
  return {
    id: post.id,
    year: dateInfo.year,
    quarter: dateInfo.quarter,
    itemName: post.title || "",
    category: post.category || "",
    budget: String(post.budget_amount ?? 0),
    spent: String(post.use_amount ?? 0),
    remaining: String(post.remain_amount ?? 0),
    carryOver: post.is_carry_over === 1,
    attachment: fileUrl || null,
    author: post.name || "",
    entryDate: dateInfo.entryDate,
  }
}

const normalizeInspectionItems = (items: InspectionItem[]) =>
  items.map(item => ({
    id: item.id,
    year: item.year || "",
    detailPlan: item.detailPlan || "",
    q1: Boolean(item.q1),
    q2: Boolean(item.q2),
    q3: Boolean(item.q3),
    q4: Boolean(item.q4),
    KPI: item.KPI || "",
    department: item.department || "",
    achievementRate: item.achievementRate || "",
    resultRemark: item.resultRemark || "",
    entryDate: item.entryDate || "",
  }))

const normalizeBudgetItems = (items: BudgetItem[]) =>
  items.map(item => ({
    id: item.id,
    year: item.year,
    quarter: item.quarter,
    itemName: item.itemName || "",
    category: item.category || "",
    budget: item.budget || "",
    spent: item.spent || "",
    remaining: item.remaining || "",
    carryOver: Boolean(item.carryOver),
    attachment: typeof item.attachment === "string" ? item.attachment : item.attachment?.name || "",
    author: item.author || "",
    entryDate: item.entryDate || "",
  }))

export default function Budget() {
  const { alertNoChanges } = useAlerts()
  const { setLoading } = useLoadingStore()
  const [inspItems, setInspItems] = useState<InspectionItem[]>(inspectionItemsMockData)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(budgetItemsMockData)
  const [inspCheckedIds, setInspCheckedIds] = useState<(number | string)[]>([])
  const [budgetCheckedIds, setBudgetCheckedIds] = useState<(number | string)[]>([])
  const [activeQuarter, setActiveQuarter] = useState<number>(1)
  const [selectedYear, setSelectedYear] = useState<string>(currentYear)
  const [budgetYear, setBudgetYear] = useState<string>(currentYear)
  const [inspSnapshotByYear, setInspSnapshotByYear] = useState<Record<string, InspectionItem[]>>({})
  const [budgetSnapshotByYear, setBudgetSnapshotByYear] = useState<Record<string, BudgetItem[]>>({})
  const [inspTotalCount, setInspTotalCount] = useState(0)
  const [inspTotalPages, setInspTotalPages] = useState(0)
  const [budgetTotalsByYear, setBudgetTotalsByYear] = useState<Record<string, { totalBudget: number; totalSpent: number; totalRemaining: number }>>({})
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const isGoalEditable = selectedYear === currentYear
  const isBudgetEditable = budgetYear === currentYear && activeQuarter === currentQuarter

  const { handleInspAdd, handleBudgetAdd, handleInspChange, handleBudgetChange, handleInspDelete, handleBudgetDelete, isQuarterEnabled, formatCurrency } = useBudgetHandlers({
    inspItems,
    budgetItems,
    setInspItems,
    setBudgetItems,
    inspCheckedIds,
    budgetCheckedIds,
    selectedYear,
    budgetYear,
    activeQuarter,
  })

  const filteredInspItems = inspItems.filter(item => item.year === selectedYear)
  const yearFilteredBudgetItems = budgetItems.filter(item => item.year === budgetYear)
  const filteredBudgetItems = yearFilteredBudgetItems.filter(item => item.quarter === activeQuarter)
  const inspItemsForTable = filteredInspItems.map(item => ({ ...item, readOnly: !isGoalEditable }))
  const budgetItemsForTable = filteredBudgetItems.map(item => ({ ...item, readOnly: !isBudgetEditable }))

  const hasInspChanges = useMemo(() => {
    const snapshot = inspSnapshotByYear[selectedYear] || []
    return JSON.stringify(normalizeInspectionItems(filteredInspItems)) !== JSON.stringify(normalizeInspectionItems(snapshot))
  }, [filteredInspItems, inspSnapshotByYear, selectedYear])

  const hasBudgetChanges = useMemo(() => {
    const snapshot = budgetSnapshotByYear[budgetYear] || []
    return JSON.stringify(normalizeBudgetItems(yearFilteredBudgetItems)) !== JSON.stringify(normalizeBudgetItems(snapshot))
  }, [budgetSnapshotByYear, budgetYear, yearFilteredBudgetItems])

  const inspEditedFields = useMemo(() => {
    const snapshot = inspSnapshotByYear[selectedYear] || []
    const snapMap = new Map(snapshot.map(item => [item.id, item]))
    const result = new Map<number | string, Set<string>>()

    filteredInspItems.forEach(item => {
      const base = snapMap.get(item.id)
      const changed = new Set<string>()
      if (!base) {
        if (item.detailPlan) changed.add("detailPlan")
        if (item.q1) changed.add("q1")
        if (item.q2) changed.add("q2")
        if (item.q3) changed.add("q3")
        if (item.q4) changed.add("q4")
        if (item.KPI) changed.add("KPI")
        if (item.department) changed.add("department")
        if (item.achievementRate) changed.add("achievementRate")
        if (item.resultRemark) changed.add("resultRemark")
        if (item.entryDate) changed.add("entryDate")
      } else {
        if (item.detailPlan !== base.detailPlan) changed.add("detailPlan")
        if (Boolean(item.q1) !== Boolean(base.q1)) changed.add("q1")
        if (Boolean(item.q2) !== Boolean(base.q2)) changed.add("q2")
        if (Boolean(item.q3) !== Boolean(base.q3)) changed.add("q3")
        if (Boolean(item.q4) !== Boolean(base.q4)) changed.add("q4")
        if ((item.KPI || "") !== (base.KPI || "")) changed.add("KPI")
        if ((item.department || "") !== (base.department || "")) changed.add("department")
        if ((item.achievementRate || "") !== (base.achievementRate || "")) changed.add("achievementRate")
        if ((item.resultRemark || "") !== (base.resultRemark || "")) changed.add("resultRemark")
        if ((item.entryDate || "") !== (base.entryDate || "")) changed.add("entryDate")
      }

      if (changed.size > 0) result.set(item.id, changed)
    })

    return result
  }, [filteredInspItems, inspSnapshotByYear, selectedYear])

  const budgetEditedFields = useMemo(() => {
    const snapshot = budgetSnapshotByYear[budgetYear] || []
    const snapMap = new Map(snapshot.map(item => [item.id, item]))
    const result = new Map<number | string, Set<string>>()

    yearFilteredBudgetItems.forEach(item => {
      const base = snapMap.get(item.id)
      const changed = new Set<string>()
      if (!base) {
        if (item.itemName) changed.add("itemName")
        if (item.category) changed.add("category")
        if (item.budget) changed.add("budget")
        if (item.spent) changed.add("spent")
        if (item.remaining) changed.add("remaining")
        if (item.carryOver) changed.add("carryOver")
        if (item.author) changed.add("author")
        if (item.entryDate) changed.add("entryDate")
      } else {
        if ((item.itemName || "") !== (base.itemName || "")) changed.add("itemName")
        if ((item.category || "") !== (base.category || "")) changed.add("category")
        if ((item.budget || "") !== (base.budget || "")) changed.add("budget")
        if ((item.spent || "") !== (base.spent || "")) changed.add("spent")
        if ((item.remaining || "") !== (base.remaining || "")) changed.add("remaining")
        if (Boolean(item.carryOver) !== Boolean(base.carryOver)) changed.add("carryOver")
        if ((item.author || "") !== (base.author || "")) changed.add("author")
        if ((item.entryDate || "") !== (base.entryDate || "")) changed.add("entryDate")
      }

      if (changed.size > 0) result.set(item.id, changed)
    })

    return result
  }, [yearFilteredBudgetItems, budgetSnapshotByYear, budgetYear])

  const yearBudgetSummary = budgetTotalsByYear[budgetYear] || { totalBudget: 0, totalSpent: 0, totalRemaining: 0 }

  const goalApproval = useApproval({ documentType: "안전보건 목표 및 추진계획" })
  const budgetApproval = useApproval({ documentType: "안전보건예산" })

  const fetchInspList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getBudgetPlanList({ page: 1, year: Number(selectedYear) })
      if (response.code === 200) {
        const mapped = response.posts.map(post => mapBudgetPlanPostToItem(post, selectedYear))
        setInspItems(mapped)
        setInspSnapshotByYear(prev => ({ ...prev, [selectedYear]: mapped }))
        setInspTotalCount(response.all_count || 0)
        setInspTotalPages(response.all_page_count || 0)
      }
    } catch (error) {
      console.error("안전보건 목표 및 추진계획 조회 실패:", error)
    }
  }, [selectedYear])

  const fetchBudgetList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getBudgetList({ page: 1, year: Number(budgetYear) })
      if (response.code === 200) {
        const mapped = response.posts.map(post => mapBudgetPostToItem(post, budgetYear))
        setBudgetItems(mapped)
        setBudgetSnapshotByYear(prev => ({ ...prev, [budgetYear]: mapped }))
        setBudgetTotalsByYear(prev => ({
          ...prev,
          [budgetYear]: {
            totalBudget: response.total_budget ?? 0,
            totalSpent: response.total_use ?? 0,
            totalRemaining: response.total_remain ?? 0,
          },
        }))
      }
    } catch (error) {
      console.error("안전보건예산 조회 실패:", error)
    }
  }, [budgetYear])

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setInspSnapshotByYear(prev => (prev[selectedYear] ? prev : { ...prev, [selectedYear]: filteredInspItems }))
      return
    }
    fetchInspList()
  }, [USE_MOCK_DATA, selectedYear, fetchInspList])

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setBudgetSnapshotByYear(prev => (prev[budgetYear] ? prev : { ...prev, [budgetYear]: yearFilteredBudgetItems }))
      const totals = yearFilteredBudgetItems.reduce(
        (acc, item) => {
          const budget = parseInt(item.budget.replace(/[^0-9]/g, ""), 10) || 0
          const spent = parseInt(item.spent.replace(/[^0-9]/g, ""), 10) || 0
          const remaining = parseInt(item.remaining.replace(/[^0-9]/g, ""), 10) || 0
          return {
            totalBudget: acc.totalBudget + budget,
            totalSpent: acc.totalSpent + spent,
            totalRemaining: acc.totalRemaining + remaining,
          }
        },
        { totalBudget: 0, totalSpent: 0, totalRemaining: 0 }
      )
      setBudgetTotalsByYear(prev => ({ ...prev, [budgetYear]: totals }))
      return
    }
    fetchBudgetList()
  }, [USE_MOCK_DATA, budgetYear, fetchBudgetList])

  const handleInspDeleteApi = async () => {
    if (inspCheckedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    try {
      const postIds = inspCheckedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getBudgetPlanDelete({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setInspCheckedIds([])
        fetchInspList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건 목표 및 추진계획 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleInspDeleteLocal = async () => {
    await handleInspDelete()
    setInspSnapshotByYear(prev => ({ ...prev, [selectedYear]: filteredInspItems.filter(item => !inspCheckedIds.includes(item.id)) }))
  }

  const handleBudgetDeleteApi = async () => {
    if (budgetCheckedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    try {
      const postIds = budgetCheckedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await getBudgetDelete({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setBudgetCheckedIds([])
        fetchBudgetList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("안전보건예산 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleBudgetDeleteLocal = async () => {
    await handleBudgetDelete()
    setBudgetSnapshotByYear(prev => ({ ...prev, [budgetYear]: yearFilteredBudgetItems.filter(item => !budgetCheckedIds.includes(item.id)) }))
  }

  const handleSaveGoalWithApproval = () => {
    if (!isGoalEditable) return
    const hasEmptyRows = filteredInspItems.some(item => {
      const hasText = Boolean(item.detailPlan || item.KPI || item.department || item.resultRemark || item.achievementRate)
      const hasQuarter = Boolean(item.q1 || item.q2 || item.q3 || item.q4)
      return !hasText && !hasQuarter
    })
    if (hasEmptyRows) {
      alert("내용을 입력해주세요.")
      return
    }
    if (!hasInspChanges) {
      alertNoChanges()
      return
    }
    goalApproval.checkAndSave(async () => {
      if (USE_MOCK_DATA) {
        alert("목표 및 추진계획이 저장되었습니다")
        setInspSnapshotByYear(prev => ({ ...prev, [selectedYear]: filteredInspItems }))
        return
      }
      try {
        setLoading(true)
        const payload = filteredInspItems.map(item => ({
          post_id: item.id > 0 ? item.id : 0,
          plan: item.detailPlan || "",
          quarter1: item.q1 ? 1 : 0,
          quarter2: item.q2 ? 1 : 0,
          quarter3: item.q3 ? 1 : 0,
          quarter4: item.q4 ? 1 : 0,
          result: item.KPI || "",
          charge: item.department || "",
          rate: Number(String(item.achievementRate || "0").replace(/[^0-9]/g, "")) || 0,
          reason: item.resultRemark || "",
          create_date: item.entryDate || `${selectedYear}-01-01`,
        }))
        const response = await mod_BudgetPlan(Number(selectedYear), payload)
        if (response.code === 200) {
          alert(response.msg || "목표 및 추진계획이 저장되었습니다")
          fetchInspList()
        } else {
          alert(response.msg || "저장에 실패했습니다.")
        }
      } catch (error) {
        console.error("안전보건 목표 및 추진계획 저장 실패:", error)
        alert("저장에 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }, `${selectedYear}년 안전보건 목표 및 추진계획`)
  }

  const handleSaveBudgetWithApproval = () => {
    if (!isBudgetEditable) return
    const allRowsEmpty = yearFilteredBudgetItems.every(item => {
      const hasText = Boolean(item.itemName?.trim() || item.category?.trim() || item.author?.trim())
      const budgetValue = parseInt(item.budget.replace(/[^0-9]/g, ""), 10) || 0
      const spentValue = parseInt(item.spent.replace(/[^0-9]/g, ""), 10) || 0
      const remainingValue = parseInt(item.remaining.replace(/[^0-9]/g, ""), 10) || 0
      const hasNumbers = budgetValue > 0 || spentValue > 0 || remainingValue > 0
      const hasAttachment = Boolean(item.attachment)
      const hasCarryOver = Boolean(item.carryOver)
      return !(hasText || hasNumbers || hasAttachment || hasCarryOver)
    })
    if (allRowsEmpty) {
      alert("내용을 입력해주세요.")
      return
    }
    if (!hasBudgetChanges) {
      alertNoChanges()
      return
    }
    budgetApproval.checkAndSave(async () => {
      if (USE_MOCK_DATA) {
        alert("안전보건예산이 저장되었습니다")
        setBudgetSnapshotByYear(prev => ({ ...prev, [budgetYear]: yearFilteredBudgetItems }))
        const totals = yearFilteredBudgetItems.reduce(
          (acc, item) => {
            const budget = parseInt(item.budget.replace(/[^0-9]/g, ""), 10) || 0
            const spent = parseInt(item.spent.replace(/[^0-9]/g, ""), 10) || 0
            const remaining = parseInt(item.remaining.replace(/[^0-9]/g, ""), 10) || 0
            return {
              totalBudget: acc.totalBudget + budget,
              totalSpent: acc.totalSpent + spent,
              totalRemaining: acc.totalRemaining + remaining,
            }
          },
          { totalBudget: 0, totalSpent: 0, totalRemaining: 0 }
        )
        setBudgetTotalsByYear(prev => ({ ...prev, [budgetYear]: totals }))
        return
      }
      try {
        setLoading(true)
        const payload = yearFilteredBudgetItems.map(item => {
          const budgetAmount = parseInt(item.budget.replace(/[^0-9]/g, ""), 10) || 0
          const spentAmount = parseInt(item.spent.replace(/[^0-9]/g, ""), 10) || 0
          const remainingAmount = parseInt(item.remaining.replace(/[^0-9]/g, ""), 10)
          return {
            post_id: item.id > 0 ? item.id : 0,
            title: item.itemName || "",
            category: item.category || "",
            budget_amount: budgetAmount,
            use_amount: spentAmount,
            remain_amount: Number.isNaN(remainingAmount) ? Math.max(0, budgetAmount - spentAmount) : remainingAmount,
            is_carry_over: item.carryOver ? 1 : 0,
            name: item.author || "",
            create_date: item.entryDate || `${budgetYear}-01-01`,
            attachment: item.attachment ?? null,
          }
        })
        const response = await mod_Budget(Number(budgetYear), payload)
        if (response.code === 200) {
          // alert(response.msg || "안전보건예산이 저장되었습니다") //[TODO: BE msg 응답 문구 수정 후에 반영 예정]
          alert("안전보건예산이 저장되었습니다") //BE안내문구: 사업장 관리 세팅이 완료되었습니다. 라고 오고있음 수정필요
          fetchBudgetList()
        } else {
          alert(response.msg || "저장에 실패했습니다.")
        }
      } catch (error) {
        console.error("안전보건예산 저장 실패:", error)
        alert("저장에 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }, `${budgetYear}년 안전보건예산`)
  }

  return (
    <section className="mypage-content w-full bg-white">
      <PageTitle>예산/목표</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={0} onTabClick={() => {}} className="mb-6" />

      <div className="mb-6">
        <InfoBox message="연간 안전보건 목표와 분기별 예산 집행현황을 한 화면에서 관리할 수 있습니다." />
      </div>

      <div className="border border-[#DDDDDD] rounded-[13px] p-5 mb-6 bg-white">
        <div className="flex justify-between items-center mb-4 border-b border-[#DDDDDD] pb-3">
          <h2 className="text-base font-semibold text-[#333]">안전보건 목표 및 추진계획</h2>
          <YearPicker year={selectedYear} onChange={setSelectedYear} />
        </div>

        <div className="flex justify-between items-center mb-3">
          <TotalCount count={USE_MOCK_DATA ? filteredInspItems.length : inspTotalCount} />
          <div className="flex gap-1">
            <Button
              variant="action"
              onClick={USE_MOCK_DATA ? handleInspDeleteLocal : handleInspDeleteApi}
              className="flex items-center gap-1"
              disabled={!isGoalEditable}
            >
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg">
          <InspectionTable
            items={inspItemsForTable}
            onChangeField={(id, field, value) => {
              if (!isGoalEditable) return
              handleInspChange(id, field, value)
            }}
            onCheckedChange={setInspCheckedIds}
            cellClassName={(item, columnKey) => (["q1", "q2", "q3", "q4"].includes(columnKey) && inspEditedFields.get(item.id)?.has(columnKey) ? "bg-[#E9F0FE]" : "")}
            inputClassName={(item, columnKey) =>
              !["q1", "q2", "q3", "q4"].includes(columnKey) && inspEditedFields.get(item.id)?.has(columnKey) ? "bg-[#E9F0FE]" : ""
            }
          />
          <div className="mt-3 flex justify-start">
            <Button variant="rowAdd" onClick={handleInspAdd} disabled={!isGoalEditable}>
              + 추가
            </Button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={handleSaveGoalWithApproval} disabled={!isGoalEditable} disabledStyleOnly={!hasInspChanges}>
            저장하기
          </Button>
        </div>
      </div>

      <div className="border border-[#DDDDDD] rounded-[13px] p-5 bg-white">
        <div className="flex justify-between items-center mb-4 border-b border-[#DDDDDD] pb-3">
          <h2 className="text-base font-semibold text-[#333]">안전보건예산</h2>
          <YearPicker year={budgetYear} onChange={setBudgetYear} />
        </div>

        <div className="flex flex-wrap gap-3 md:gap-4 mb-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs md:text-sm text-gray-500">총 예산:</span>
            <span className="text-xs md:text-sm font-semibold text-[#333]">{formatCurrency(yearBudgetSummary.totalBudget)}</span>
          </div>
          <div className="w-px h-4 md:h-5 bg-gray-300 hidden sm:block" />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs md:text-sm text-gray-500">집행액:</span>
            <span className="text-xs md:text-sm font-semibold text-[#555]">{formatCurrency(yearBudgetSummary.totalSpent)}</span>
          </div>
          <div className="w-px h-4 md:h-5 bg-gray-300 hidden sm:block" />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs md:text-sm text-gray-500">잔액:</span>
            <span className="text-xs md:text-sm font-semibold text-[#333]">{formatCurrency(yearBudgetSummary.totalRemaining)}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {["1분기", "2분기", "3분기", "4분기"].map((q, idx) => {
            const quarter = idx + 1
            const enabled = isQuarterEnabled(quarter)
            return (
              <button
                key={q}
                onClick={() => enabled && setActiveQuarter(quarter)}
                disabled={!enabled}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !enabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" : activeQuarter === quarter ? "bg-[#0E4A84] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {q}
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center mb-3">
          <TotalCount count={filteredBudgetItems.length} />
          <div className="flex gap-1">
            <Button
              variant="action"
              onClick={USE_MOCK_DATA ? handleBudgetDeleteLocal : handleBudgetDeleteApi}
              className="flex items-center gap-1"
              disabled={!isBudgetEditable}
            >
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg">
          <BudgetTable
            items={budgetItemsForTable}
            onChangeField={(id, field, value) => {
              if (!isBudgetEditable) return
              handleBudgetChange(id, field, value)
            }}
            onCheckedChange={setBudgetCheckedIds}
            cellClassName={(item, columnKey) => (columnKey === "carryOver" && budgetEditedFields.get(item.id)?.has(columnKey) ? "bg-[#E9F0FE]" : "")}
            inputClassName={(item, columnKey) =>
              columnKey !== "carryOver" && budgetEditedFields.get(item.id)?.has(columnKey) ? "bg-[#E9F0FE]" : ""
            }
          />
          <div className="mt-3 flex justify-start">
            <Button variant="rowAdd" onClick={handleBudgetAdd} disabled={!isBudgetEditable}>
              + 추가
            </Button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={handleSaveBudgetWithApproval} disabled={!isBudgetEditable} disabledStyleOnly={!hasBudgetChanges}>
            저장하기
          </Button>
        </div>
      </div>

      <ApprovalConfirmDialog
        isOpen={goalApproval.isDialogOpen}
        documentType="안전보건 목표 및 추진계획"
        approvalLineName={goalApproval.approvalLineName}
        approvers={goalApproval.approvers}
        defaultContent={goalApproval.defaultContent}
        onConfirm={goalApproval.handleConfirmApproval}
        onCancel={goalApproval.handleCancel}
      />
      <ApprovalConfirmDialog
        isOpen={budgetApproval.isDialogOpen}
        documentType="안전보건예산"
        approvalLineName={budgetApproval.approvalLineName}
        approvers={budgetApproval.approvers}
        defaultContent={budgetApproval.defaultContent}
        onConfirm={budgetApproval.handleConfirmApproval}
        onCancel={budgetApproval.handleCancel}
      />
    </section>
  )
}
