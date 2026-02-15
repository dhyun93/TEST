import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"

type MachineOption = { id: string; label: string; keywords: ReadonlyArray<string> }
type Props = {
  id?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  data?: ReadonlyArray<MachineOption>
  className?: string
  minChars?: number
  onChange?: (value: string) => void
  onSelect?: (item: MachineOption) => void
}

const DEFAULT_DATA: ReadonlyArray<MachineOption> = [
  { id: "mach-0001", label: "프레스", keywords: ["Press", "프레스기", "금속가공프레스", "사출프레스"] },
  { id: "mach-0002", label: "전단기", keywords: ["Shearing machine", "절단기(판금)", "쉐어링"] },
  { id: "mach-0003", label: "크레인", keywords: ["Crane", "오버헤드크레인", "브리지크레인", "천장크레인"] },
  { id: "mach-0004", label: "리프트", keywords: ["Lift", "승강기", "화물리프트", "고소작업대", "리프트대"] },
  { id: "mach-0005", label: "곤돌라", keywords: ["Gondola", "작업용곤돌라", "행거스테이지"] },
  { id: "mach-0006", label: "압력용기", keywords: ["Pressure vessel", "에어탱크", "수압탱크", "압력탱크"] },
  { id: "mach-0007", label: "보일러", keywords: ["Boiler", "스팀보일러", "온수보일러"] },
  { id: "mach-0008", label: "컨베이어", keywords: ["Conveyor", "벨트컨베이어", "롤러컨베이어", "체인컨베이어"] },
  { id: "mach-0009", label: "롤러기", keywords: ["Rolling machine", "롤벤딩", "롤러벤딩", "롤러"] },
  { id: "mach-0010", label: "혼합기", keywords: ["Mixer", "믹서", "배합기", "교반기", "Agitator"] },
  { id: "mach-0011", label: "파쇄기", keywords: ["Crusher", "분쇄기", "파쇄기계", "Shredder"] },
  { id: "mach-0012", label: "지게차", keywords: ["Forklift", "포크리프트", "포크", "전동지게차", "내연지게차"] },
  { id: "mach-0013", label: "팔레트트럭", keywords: ["Pallet truck", "핸드리프트", "핸드파렛트"] },
  { id: "mach-0014", label: "전동호이스트", keywords: ["Electric hoist", "호이스트", "체인블록", "윈치"] },
  { id: "mach-0015", label: "그라인더", keywords: ["Grinder", "앵글그라인더", "숫돌"] },
  { id: "mach-0016", label: "컷팅기", keywords: ["Cutting machine", "절단기", "컷터", "컷쏘"] },
  { id: "mach-0017", label: "전동드릴", keywords: ["Drill", "충전드릴", "임팩드릴"] },
  { id: "mach-0018", label: "밴드쏘", keywords: ["Band saw", "톱기계", "밴드쏘우"] },
  { id: "mach-0019", label: "용접기", keywords: ["Welder", "아크용접기", "MIG", "TIG", "CO2용접기"] },
  { id: "mach-0020", label: "산업용로봇", keywords: ["Industrial robot", "로봇암", "로봇셀", "Manipulator"] },
  { id: "mach-0021", label: "집진기", keywords: ["Dust collector", "집진설비", "백필터", "사이클론"] },
  { id: "mach-0022", label: "국소배기장치", keywords: ["LEV", "Local exhaust ventilation", "후드", "배기후드"] },
  { id: "mach-0023", label: "환기설비", keywords: ["Ventilation", "배기팬", "덕트팬", "배기설비"] },
  { id: "mach-0024", label: "에어컴프레서", keywords: ["Air compressor", "콤프레샤", "에어콤프레샤", "콤프"] },
  { id: "mach-0025", label: "전기분전반", keywords: ["Switchboard", "분전함", "배전반", "전기반"] },
  { id: "mach-0026", label: "비상발전기", keywords: ["Emergency generator", "디젤발전기", "예비발전기"] },
  { id: "mach-0027", label: "사다리", keywords: ["Ladder", "접이식사다리", "알루미늄사다리"] },
  { id: "mach-0028", label: "작업대", keywords: ["Workbench", "작업발판", "작업테이블"] },
  { id: "mach-0029", label: "고소작업대", keywords: ["Aerial work platform", "스카이리프트", "AWP", "Scissor lift", "붐리프트"] },
  { id: "mach-0030", label: "로더", keywords: ["Loader", "미니로더", "휠로더"] },
  { id: "mach-0031", label: "펌프", keywords: ["Pump", "이송펌프", "진공펌프", "원심펌프"] },
  { id: "mach-0032", label: "팬/블로워", keywords: ["Fan", "Blower", "송풍기", "배기팬"] },
  { id: "mach-0033", label: "냉동기", keywords: ["Chiller", "냉동설비", "칠러"] },
  { id: "mach-0034", label: "열교환기", keywords: ["Heat exchanger", "HX", "플레이트HX", "튜브HX"] },
  { id: "mach-0035", label: "건조기", keywords: ["Dryer", "에어드라이어", "열풍건조기"] },
  { id: "mach-0036", label: "스크류컨베이어", keywords: ["Screw conveyor", "스크류피더", "오거"] },
  { id: "mach-0037", label: "버킷엘리베이터", keywords: ["Bucket elevator", "엘리베이터컨베이어"] },
  { id: "mach-0038", label: "밸브테스터", keywords: ["Valve tester", "압력시험기", "시트시험기"] },
  { id: "mach-0039", label: "압축가스용기랙", keywords: ["Gas cylinder rack", "가스보틀랙", "보틀캐비닛"] },
  { id: "mach-0040", label: "유압프레스", keywords: ["Hydraulic press", "H-프레스", "유압식프레스"] },
  { id: "mach-0041", label: "메카니컬프레스", keywords: ["Mechanical press", "크랭크프레스", "기계프레스"] },
  { id: "mach-0042", label: "사상기", keywords: ["Deburring machine", "폴리셔", "버핑기", "샌더"] },
  { id: "mach-0043", label: "연마기", keywords: ["Polisher", "연삭기", "연마장비"] },
  { id: "mach-0044", label: "프링형컨베이어", keywords: ["Roller conveyor", "롤러레일", "중량물컨베이어"] },
  { id: "mach-0045", label: "체인블록", keywords: ["Chain block", "수동호이스트", "레버블록"] },
  { id: "mach-0046", label: "포장기", keywords: ["Packaging machine", "랩핑기", "스트래핑기", "실링기"] },
  { id: "mach-0047", label: "혼합탱크", keywords: ["Mixing tank", "교반탱크", "배치탱크"] },
  { id: "mach-0048", label: "계측패널", keywords: ["Instrumentation panel", "제어반", "PLC패널", "Control panel"] },
]

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFC")
}

export default function MachineAutocomplete(props: Props): React.ReactElement {
  const { id = "machine-autocomplete", value = "", placeholder = "기계·기구·설비 검색 또는 입력", disabled = false, data = DEFAULT_DATA, className = "", minChars = 1, onChange, onSelect } = props
  const [query, setQuery] = useState<string>(value)
  const [open, setOpen] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listId = `${id}-listbox`

  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered: ReadonlyArray<MachineOption> = useMemo(() => {
    const q = normalize(query.trim())
    if (q.length < minChars) return []
    const scored = data
      .map(o => {
        const hay = [o.label, ...o.keywords].join(" ")
        const nHay = normalize(hay)
        const nLabel = normalize(o.label)
        const starts = nLabel.startsWith(q) ? 2 : 0
        const includes = nHay.includes(q) ? 1 : 0
        return { o, score: starts + includes }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.o.label.localeCompare(b.o.label, "ko-KR"))
      .slice(0, 12)
      .map(x => x.o)
    return scored
  }, [query, data, minChars])

  const handleSelect = useCallback(
    (o: MachineOption): void => {
      setQuery(o.label)
      setOpen(false)
      setActiveIndex(-1)
      onChange?.(o.label)
      onSelect?.(o)
    },
    [onChange, onSelect]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (!(query.trim().length >= minChars)) return
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setOpen(true)
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex(i => (i + 1 >= filtered.length ? 0 : i + 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex(i => (i - 1 < 0 ? filtered.length - 1 : i - 1))
      } else if (e.key === "Enter") {
        if (open && activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault()
          handleSelect(filtered[activeIndex])
        }
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    },
    [open, activeIndex, filtered, handleSelect, query, minChars]
  )

  useEffect(() => {
    const onDoc = (ev: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])
  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  const inputBase =
    "border border-[#AAAAAA] rounded-[8px] px-1.5 sm:px-2 h-[32px] sm:h-[39px] w-full appearance-none placeholder:font-normal placeholder:text-[#86939A] placeholder:text-[11px] sm:placeholder:text-xs md:placeholder:text-sm text-[11px] sm:text-xs md:text-sm font-medium"
  const inputEditable = "bg-white text-[#333639]"

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <input
        id={id}
        type="text"
        value={query}
        onChange={e => {
          const v = e.target.value
          setQuery(v)
          onChange?.(v)
          setOpen(v.trim().length >= minChars)
        }}
        onFocus={() => {
          if (query.trim().length >= minChars) setOpen(true)
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${id}-option-${filtered[activeIndex]?.id}` : undefined}
        className={`${inputBase} ${inputEditable} pr-8 ${disabled ? "cursor-not-allowed text-gray-400" : "outline-none"}`}
      />
      <Search className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
      {open && filtered.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-[8px] border border-[#CCCCCC] bg-white shadow-lg">
          {filtered.map((o, idx) => {
            const active = idx === activeIndex
            return (
              <li
                key={o.id}
                id={`${id}-option-${o.id}`}
                role="option"
                aria-selected={active}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(o)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm ${active ? "bg-[#869CAE] text-white" : "hover:bg-gray-100 text-[#333639]"}`}
              >
                {o.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
