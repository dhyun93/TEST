import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ChevronRight, ArrowLeft, Camera, X, Circle, Calendar, CheckCircle } from "lucide-react"
import { inspectionPlanMockData, checklistTemplateMockData } from "@/data/mockData"

type PlanRow = {
  id: number | string
  planName: string
  site: string
  area: string
  kind: string
  inspector: string
  schedule: string
  progress: "미점검" | "완료"
}

type CheckItem = {
  id: number
  category: string
  item: string
  status: "양호" | "불량" | null
  note: string
  photo?: string
}

const STYLES = {
  card: "bg-white rounded-xl p-4",
  label: "text-xs text-gray-500 mb-1.5 block",
  value: "text-sm text-gray-800",
}

function ListMode({ data, onSelectItem }: { data: PlanRow[]; onSelectItem: (item: PlanRow) => void }) {
  const pending = data.filter(d => d.progress === "미점검")
  const completed = data.filter(d => d.progress === "완료")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">점검목록</h1>
          <span className="ml-auto text-xs opacity-80">{pending.length}건 대기</span>
        </div>
      </header>

      <main className="p-4">
        {pending.length > 0 && (
          <div className="mb-4">
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {pending.map(item => (
                <button key={item.id} onClick={() => onSelectItem(item)} className="w-full p-3 flex items-center gap-3 text-left active:bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.planName}</p>
                    <p className="text-xs text-gray-500">
                      {item.schedule} | {item.site}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 mb-2">완료</h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {completed.map(item => (
                <button key={item.id} onClick={() => onSelectItem(item)} className="w-full p-3 flex items-center gap-3 text-left active:bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">{item.planName}</p>
                    <p className="text-xs text-gray-400">
                      {item.schedule} | {item.site}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100">완료</span>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {data.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">점검항목이 없습니다.</div>}
      </main>
    </div>
  )
}

function ViewMode({ plan, onBack }: { plan: PlanRow; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold">점검상세</h1>
        </div>
      </header>

      <main className="p-4 space-y-3">
        <div className={STYLES.card}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <span className="text-base font-semibold text-gray-800">{plan.schedule}</span>
          </div>
        </div>

        <div className={STYLES.card}>
          <p className={STYLES.label}>점검명</p>
          <p className="text-base font-semibold text-gray-800">{plan.planName}</p>
        </div>

        <div className={`${STYLES.card} space-y-3`}>
          <div>
            <p className={STYLES.label}>현장</p>
            <p className={STYLES.value}>{plan.site || "-"}</p>
          </div>
          <div>
            <p className={STYLES.label}>구역</p>
            <p className={STYLES.value}>{plan.area || "-"}</p>
          </div>
          <div>
            <p className={STYLES.label}>점검종류</p>
            <p className={STYLES.value}>{plan.kind || "-"}</p>
          </div>
          <div>
            <p className={STYLES.label}>점검자</p>
            <p className={STYLES.value}>{plan.inspector || "-"}</p>
          </div>
        </div>

        <div className={STYLES.card}>
          <p className={STYLES.label}>진행상태</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${plan.progress === "완료" ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"}`}>{plan.progress}</span>
        </div>
      </main>
    </div>
  )
}

function CheckMode({ plan, onBack, onComplete }: { plan: PlanRow; onBack: () => void; onComplete: () => void }) {
  const [checkItems, setCheckItems] = useState<CheckItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const template = checklistTemplateMockData.find(t => t.id === Number(plan.id))
    let itemId = 1
    const items: CheckItem[] = []
    if (template) {
      template.items.forEach(item => {
        items.push({ id: itemId++, category: template.name, item, status: null, note: "" })
      })
    }
    setCheckItems(items)
  }, [plan.id])

  const handleStatusChange = (itemId: number, status: "양호" | "불량") => {
    setCheckItems(prev => prev.map(item => (item.id === itemId ? { ...item, status: item.status === status ? null : status } : item)))
  }

  const handleNoteChange = (itemId: number, note: string) => {
    setCheckItems(prev => prev.map(item => (item.id === itemId ? { ...item, note } : item)))
  }

  const handleRemovePhoto = (itemId: number) => {
    setCheckItems(prev => prev.map(item => (item.id === itemId ? { ...item, photo: undefined } : item)))
  }

  const handlePhoto = (itemId: number) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = ev => {
          setCheckItems(prev => prev.map(item => (item.id === itemId ? { ...item, photo: ev.target?.result as string } : item)))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onComplete()
    } catch {
      alert("제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedCount = checkItems.filter(item => item.status !== null).length
  const progress = checkItems.length ? Math.round((completedCount / checkItems.length) * 100) : 0
  const groupedItems = checkItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, CheckItem[]>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">{plan.planName}</h1>
            <p className="text-xs opacity-80">
              {completedCount}/{checkItems.length} ({progress}%)
            </p>
          </div>
        </div>
      </header>

      <main className="p-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h2 className="text-xs font-semibold text-gray-500 mb-2">{category}</h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {items.map(item => (
                <div key={item.id} className={`p-3 ${item.status === "양호" ? "bg-gray-50" : item.status === "불량" ? "bg-red-50" : ""}`}>
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-sm text-gray-800 leading-snug pt-1.5">{item.item}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleStatusChange(item.id, "양호")} className="p-1.5 rounded active:bg-gray-100">
                        <Circle size={18} className={item.status === "양호" ? "text-[var(--primary)]" : "text-gray-300"} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleStatusChange(item.id, "불량")} className="p-1.5 rounded active:bg-gray-100">
                        <X size={18} className={item.status === "불량" ? "text-red-600" : "text-gray-300"} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handlePhoto(item.id)} className="p-1.5 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded">
                        <Camera size={18} />
                      </button>
                    </div>
                  </div>

                  {item.status === "불량" && (
                    <input
                      type="text"
                      placeholder="비고 입력"
                      value={item.note}
                      onChange={e => handleNoteChange(item.id, e.target.value)}
                      className="mt-2 w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
                    />
                  )}

                  {item.photo && (
                    <div className="mt-2 relative inline-block">
                      <img src={item.photo} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      <button onClick={() => handleRemovePhoto(item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl disabled:opacity-50 active:opacity-80">
          {isSubmitting ? "제출 중..." : "점검 완료"}
        </button>
      </div>
    </div>
  )
}

function CompleteMode({ plan, onConfirm }: { plan: PlanRow; onConfirm: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">점검완료</h2>
      <p className="text-sm text-gray-500 mb-6">{plan.planName} 점검이 완료되었습니다</p>
      <button onClick={onConfirm} className="px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium rounded-lg active:opacity-80">
        목록으로
      </button>
    </div>
  )
}

export default function QRInspection() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<PlanRow[]>([])
  const [mode, setMode] = useState<"list" | "view" | "check" | "complete">("list")
  const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null)

  useEffect(() => {
    const ids = searchParams.get("ids")
    if (ids) {
      const idList = ids.split(",").map(id => parseInt(id))
      setData((inspectionPlanMockData as PlanRow[]).filter(item => idList.includes(Number(item.id))))
    } else {
      setData(inspectionPlanMockData as PlanRow[])
    }
  }, [searchParams])

  const handleSelectItem = (item: PlanRow) => {
    setSelectedPlan(item)
    if (item.progress === "완료") {
      setMode("view")
    } else {
      setMode("check")
    }
  }

  const handleBack = () => {
    setMode("list")
    setSelectedPlan(null)
  }

  const handleComplete = () => {
    if (selectedPlan) {
      setData(prev => prev.map(item => (item.id === selectedPlan.id ? { ...item, progress: "완료" as const } : item)))
      setMode("complete")
    }
  }

  const handleCompleteConfirm = () => {
    setMode("list")
    setSelectedPlan(null)
  }

  if (mode === "view" && selectedPlan) {
    return <ViewMode plan={selectedPlan} onBack={handleBack} />
  }

  if (mode === "check" && selectedPlan) {
    return <CheckMode plan={selectedPlan} onBack={handleBack} onComplete={handleComplete} />
  }

  if (mode === "complete" && selectedPlan) {
    return <CompleteMode plan={selectedPlan} onConfirm={handleCompleteConfirm} />
  }

  return <ListMode data={data} onSelectItem={handleSelectItem} />
}
