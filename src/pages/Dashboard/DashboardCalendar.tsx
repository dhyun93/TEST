import React, { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Calendar as CalIcon, Info, X } from "lucide-react"

type Event = { id: number; title: "TBM" | "안전교육" | "점검" | "위험성평가"; startDate: string; endDate?: string }

const events: Event[] = [
  { id: 1, title: "TBM", startDate: "2025-10-20" },
  { id: 2, title: "점검", startDate: "2025-10-22" },
  { id: 3, title: "안전교육", startDate: "2025-10-24" },
  { id: 4, title: "TBM", startDate: "2025-10-27" },
  { id: 5, title: "위험성평가", startDate: "2025-10-29" },
  { id: 6, title: "점검", startDate: "2025-10-31" },
  { id: 7, title: "TBM", startDate: "2025-11-03" },
  { id: 8, title: "안전교육", startDate: "2025-11-05" },
  { id: 9, title: "점검", startDate: "2025-11-07" },
  { id: 10, title: "TBM", startDate: "2025-11-10" },
  { id: 11, title: "위험성평가", startDate: "2025-11-12" },
  { id: 12, title: "안전교육", startDate: "2025-11-14" },
  { id: 13, title: "TBM", startDate: "2025-11-17" },
  { id: 14, title: "점검", startDate: "2025-11-19" },
  { id: 15, title: "안전교육", startDate: "2025-11-21" },
  { id: 16, title: "TBM", startDate: "2025-11-24" },
  { id: 17, title: "위험성평가", startDate: "2025-11-26" },
  { id: 18, title: "점검", startDate: "2025-11-28" },
  { id: 19, title: "TBM", startDate: "2025-12-01" },
  { id: 20, title: "점검", startDate: "2025-12-02" },
  { id: 21, title: "안전교육", startDate: "2025-12-03" },
  { id: 22, title: "위험성평가", startDate: "2025-12-04" },
  { id: 23, title: "TBM", startDate: "2025-12-05" },
  { id: 24, title: "TBM", startDate: "2025-12-08" },
  { id: 25, title: "점검", startDate: "2025-12-09" },
  { id: 26, title: "안전교육", startDate: "2025-12-10" },
  { id: 27, title: "위험성평가", startDate: "2025-12-11" },
  { id: 28, title: "TBM", startDate: "2025-12-12" },
  { id: 29, title: "TBM", startDate: "2025-12-15" },
  { id: 30, title: "점검", startDate: "2025-12-16" },
  { id: 31, title: "안전교육", startDate: "2025-12-17" },
  { id: 32, title: "위험성평가", startDate: "2025-12-18" },
  { id: 33, title: "TBM", startDate: "2025-12-19" },
  { id: 34, title: "TBM", startDate: "2025-12-22" },
  { id: 35, title: "점검", startDate: "2025-12-23" },
  { id: 36, title: "안전교육", startDate: "2025-12-24" },
  { id: 37, title: "TBM", startDate: "2025-12-26" },
  { id: 38, title: "TBM", startDate: "2025-12-29" },
  { id: 39, title: "점검", startDate: "2025-12-30" },
  { id: 40, title: "안전교육", startDate: "2025-12-31" },
  { id: 41, title: "TBM", startDate: "2026-01-02" },
  { id: 42, title: "점검", startDate: "2026-01-05" },
  { id: 43, title: "안전교육", startDate: "2026-01-07" },
  { id: 44, title: "위험성평가", startDate: "2026-01-09" },
  { id: 45, title: "TBM", startDate: "2026-01-12" },
  { id: 46, title: "점검", startDate: "2026-01-14" },
  { id: 47, title: "안전교육", startDate: "2026-01-16" },
  { id: 48, title: "TBM", startDate: "2026-01-19" },
  { id: 49, title: "위험성평가", startDate: "2026-01-21" },
  { id: 50, title: "점검", startDate: "2026-01-23" },
  { id: 51, title: "TBM", startDate: "2026-01-26" },
  { id: 52, title: "안전교육", startDate: "2026-01-28" },
  { id: 53, title: "점검", startDate: "2026-01-30" },
]

const weekDays = ["일", "월", "화", "수", "목", "금", "토"]
const kinds = ["TBM", "안전교육", "위험성평가", "점검"]

const DashboardCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2025-12-01"))
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-12-01"))
  const [openFilter, setOpenFilter] = useState(false)
  const [activeKinds, setActiveKinds] = useState<string[]>([])
  const [draftKinds, setDraftKinds] = useState<string[]>([])
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpenFilter(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])
  useEffect(() => {
    if (openFilter) setDraftKinds(activeKinds)
  }, [openFilter, activeKinds])

  const dateKey = (d: Date) => d.toISOString().slice(0, 10)
  const getStartDate = (date: Date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return start
  }
  const getCalendarDays = () => {
    const start = getStartDate(currentDate)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }
  const titleKind = (t: string) => kinds.find(k => t.includes(k)) || "기타"
  const filtered = events.filter(e => activeKinds.length === 0 || activeKinds.includes(titleKind(e.title)))
  const getEventsForDate = (date: Date) => filtered.filter(e => e.startDate === dateKey(date))
  const isToday = (date: Date) => {
    const t = new Date()
    return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate()
  }
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth()
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const goToday = () => {
    const t = new Date()
    setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1))
    setSelectedDate(t)
  }
  const selectedEvents = getEventsForDate(selectedDate)

  const badgeStyleFor = (title: string, dimmed: boolean) => {
    let bg = "bg-gray-200",
      text = "text-[#333]"
    if (title.includes("TBM")) {
      bg = "bg-[#EAF3FF]"
      text = "text-[#1C56D3]"
    } else if (title.includes("안전교육")) {
      bg = "bg-[#EEF5F5]"
      text = "text-[#3C5C5A]"
    } else if (title.includes("점검")) {
      bg = "bg-[#E8EEFB]"
      text = "text-[#1E3C6B]"
    } else if (title.includes("위험성평가")) {
      bg = "bg-[#FEEDE9]"
      text = "text-[#FF3300]"
    }
    return `inline-block ${bg} ${text} text-[8px] sm:text-[9px] px-[3px] sm:px-[4px] py-[1px] rounded font-medium w-fit truncate max-w-full ${dimmed ? "text-gray-400 bg-gray-100" : ""}`
  }

  const describeEvent = (e: Event) => {
    const tbm: Record<string, string> = {
      "2025-10-20": "초기 설비 가동 TBM",
      "2025-10-27": "추가 설비 반입 TBM",
      "2025-11-03": "지게차 운행 안전 TBM",
      "2025-11-10": "고소작업 안전 TBM",
      "2025-11-17": "동절기 화재예방 TBM",
      "2025-11-24": "전기안전 특별 TBM",
      "2025-12-01": "한랭질환 예방 TBM",
      "2025-12-05": "결빙구간 주의 TBM",
      "2025-12-08": "미끄러짐 사고 예방 TBM",
      "2025-12-12": "밀폐공간 질식 예방 TBM",
      "2025-12-15": "연말 들뜬 분위기 차단 TBM",
      "2025-12-19": "대정비 작업 전 안전 TBM",
      "2025-12-22": "긴급상황 대응 TBM",
      "2025-12-26": "휴일 전 안전점검 TBM",
      "2025-12-29": "연말 마무리 안전 TBM",
      "2026-01-02": "새해 첫 작업 안전기원 TBM",
      "2026-01-12": "동파 방지 열선 점검 TBM",
      "2026-01-19": "해빙기 대비 TBM",
      "2026-01-26": "설 연휴 대비 안전 TBM",
    }

    const edu: Record<string, string> = {
      "2025-10-24": "신규입사자 교육",
      "2025-11-05": "MSDS 특별교육",
      "2025-11-14": "관리감독자 교육",
      "2025-11-21": "심폐소생술 실습",
      "2025-12-03": "4분기 정기 안전교육",
      "2025-12-10": "동절기 뇌심혈관 예방교육",
      "2025-12-17": "소방 대피 훈련",
      "2025-12-24": "응급처치 교육",
      "2025-12-31": "2025년 무재해 결의대회",
      "2026-01-07": "2026년 안전목표 공유",
      "2026-01-16": "물질안전보건자료 갱신 교육",
      "2026-01-28": "작업표준 준수 교육",
    }

    const asset: Record<string, { category: "위험기계/기구/설비" | "유해/위험물질"; target: string; code?: string }> = {
      "2025-10-22": { category: "위험기계/기구/설비", target: "크러셔", code: "CR-1-10" },
      "2025-10-31": { category: "유해/위험물질", target: "황산" },
      "2025-11-07": { category: "위험기계/기구/설비", target: "컨베이어", code: "CV-2-01" },
      "2025-11-19": { category: "유해/위험물질", target: "수산화나트륨" },
      "2025-11-28": { category: "위험기계/기구/설비", target: "호이스트", code: "H-5-02" },
      "2025-12-02": { category: "위험기계/기구/설비", target: "보일러", code: "B-1-01" },
      "2025-12-09": { category: "유해/위험물질", target: "에틸렌글리콜" },
      "2025-12-16": { category: "위험기계/기구/설비", target: "압력용기", code: "PV-3-10" },
      "2025-12-23": { category: "유해/위험물질", target: "암모니아" },
      "2025-12-30": { category: "위험기계/기구/설비", target: "지게차", code: "F-1-05" },
      "2026-01-05": { category: "위험기계/기구/설비", target: "크레인", code: "C-2-20" },
      "2026-01-14": { category: "유해/위험물질", target: "벤젠" },
      "2026-01-23": { category: "위험기계/기구/설비", target: "리프트", code: "L-3-15" },
      "2026-01-30": { category: "유해/위험물질", target: "메탄올" },
    }

    const risk: Record<string, { name: string; endDate: string }> = {
      "2025-10-29": { name: "초기 공정 위험성평가", endDate: "2025-11-05" },
      "2025-11-12": { name: "화학설비 수시평가", endDate: "2025-11-20" },
      "2025-11-26": { name: "근골격계 부담작업 평가", endDate: "2025-12-05" },
      "2025-12-04": { name: "동절기 대비 위험성평가", endDate: "2025-12-15" },
      "2025-12-11": { name: "밀폐공간 작업 평가", endDate: "2025-12-20" },
      "2025-12-18": { name: "대정비 작업 사전평가", endDate: "2025-12-28" },
      "2026-01-09": { name: "2026 상반기 정기평가", endDate: "2026-01-31" },
      "2026-01-21": { name: "신규설비 도입 평가", endDate: "2026-01-30" },
    }

    if (e.title === "TBM") return tbm[e.startDate] ?? "TBM 확인"
    if (e.title === "안전교육") return edu[e.startDate] ?? "교육 일정"
    if (e.title === "점검") {
      const a = asset[e.startDate]
      if (!a) return "자산 점검"
      const code = a.code ? `(${a.code})` : ""
      return (
        <span className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-medium">{a.category}</span>
          <span>
            {a.target}
            {code}
          </span>
        </span>
      )
    }
    if (e.title === "위험성평가") {
      const r = risk[e.startDate]
      if (!r) return "평가 일정"
      return `${r.name} 완료`
    }
    return "상세내용 확인"
  }

  const dday = (iso: string) => {
    const today = new Date()
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const target = new Date(iso + "T00:00:00")
    const diff = Math.round((target.getTime() - base.getTime()) / 86400000)

    if (diff === 0) return "D-DAY"
    if (diff > 0) return `D-${diff}`
    return null
  }

  return (
    <section className="w-full rounded-[16px] border border-[#E0E6EA] bg-white shadow-sm p-2 sm:p-4 flex flex-col">
      <div className="flex flex-col">
        <div className="mb-2 px-1 relative z-40 flex items-center justify-between flex-nowrap gap-2">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={goToday} className="text-[10px] sm:text-xs px-2 sm:px-2.5 h-7 rounded-md border border-[#C9D6EE] text-[#1E3C6B] bg-[#F3F6FB] hover:bg-[#E8EEFB]">
              오늘
            </button>
            <button onClick={prevMonth} className="w-7 h-7 rounded-md border flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="w-7 h-7 rounded-md border flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#161616] min-w-0 text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <div className="relative z-50 shrink-0">
            <button onClick={() => setOpenFilter(v => !v)} className="w-8 h-7 flex items-center justify-center rounded-md border border-[#E0E0E0]">
              <Filter size={12} className="text-gray-600" />
            </button>
            {openFilter && (
              <div ref={popRef} className="absolute right-0 top-9 z-50 w-[190px] rounded-xl border border-[#E5E7EB] bg-white shadow-2xl p-2">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-medium text-gray-800">검색조건</span>
                  <button onClick={() => setOpenFilter(false)} className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100">
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {kinds.map(k => {
                    const on = draftKinds.includes(k)
                    return (
                      <button
                        key={k}
                        onClick={() => setDraftKinds(p => (on ? p.filter(x => x !== k) : [...p, k]))}
                        className={`h-8 rounded-lg border text-[12px] transition ${on ? "border-[#C9D6EE] bg-[#F3F6FB] text-[#1E3C6B]" : "border-[#E5E7EB] text-gray-700 hover:bg-gray-50"}`}
                      >
                        {k}
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-end mt-2 px-1 gap-3">
                  <button onClick={() => setDraftKinds(kinds)} className="text-[12px] text-gray-400 underline hover:text-gray-600">
                    전체
                  </button>
                  <button
                    onClick={() => {
                      setActiveKinds(draftKinds)
                      setOpenFilter(false)
                    }}
                    className="text-[12px] text-gray-500 hover:text-gray-700"
                  >
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-0">
          <div className="grid grid-cols-7 mb-1 text-center text-[11px] font-semibold text-gray-600">
            {weekDays.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-6 gap-[1px] text-[11px]">
            {getCalendarDays().map((date, i) => {
              const evts = getEventsForDate(date)
              const dimmed = !isCurrentMonth(date)
              const today = isToday(date)
              const isSelected = dateKey(date) === dateKey(selectedDate)
              const visible = evts.slice(0, 2)
              const extra = evts.length - visible.length
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDate(new Date(date))}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedDate(new Date(date))
                    }
                  }}
                  className={`border border-[#E8E8E8] ${dimmed ? "bg-[#FAFAFA]" : "bg-white"} p-1 overflow-hidden ${isSelected ? "outline outline-1 outline-[#1E3C6B]" : ""}`}
                >
                  <div className={`w-fit px-[3px] font-semibold ${dimmed ? "text-gray-400" : "text-[#161616]"} text-[11px] ${today ? "ring-1 ring-[#1C56D3] rounded" : ""}`}>{date.getDate()}</div>
                  <div className="mt-0.5 relative h-[28px] sm:h-[36px] overflow-hidden">
                    <div className="flex flex-col gap-[2px]">
                      {visible.map(ev => (
                        <span
                          key={ev.id}
                          className={badgeStyleFor(ev.title, dimmed)}
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedDate(new Date(date))
                          }}
                        >
                          {ev.title}
                        </span>
                      ))}
                    </div>
                    {extra > 0 && <span className="absolute bottom-0 right-0 text-[9px] px-1 rounded bg-white/70 text-gray-500">+{extra}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-[12px] border border-[#E0E6EA] p-3 h-[130px] flex flex-col">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-[#1E3C6B]" />
            <h4 className="text-sm font-semibold text-gray-800">{selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" })}</h4>
          </div>
          <span className="text-xs text-gray-500">{selectedEvents.length}건</span>
        </div>
        {selectedEvents.length === 0 ? (
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <Info className="w-4 h-4 text-gray-400" />
            선택한 날짜에 등록된 일정이 없습니다.
          </div>
        ) : (
          <ul className="space-y-1 flex-1 min-h-0 overflow-auto pr-1 max-h-[112px]">
            {selectedEvents.map(ev => {
              const dayStr = dday(ev.startDate)
              return (
                <li key={ev.id} className="flex items-start justify-between rounded-md border border-[#EEF2F6] px-2 py-2 min-h-[54px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={badgeStyleFor(ev.title, false)}>{ev.title}</span>
                      <span className="text-[11px] text-gray-500">{ev.startDate}</span>
                    </div>
                    <p className="text-[12px] text-gray-700 mt-1 truncate">{describeEvent(ev)}</p>
                  </div>
                  {dayStr && <span className="text-[11px] px-2 py-0.5 rounded-md border border-[#E5E7EB] text-gray-700 shrink-0">{dayStr}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default DashboardCalendar
