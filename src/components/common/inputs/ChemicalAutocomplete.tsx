import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"

type ChemicalOption = { id: string; label: string; keywords: ReadonlyArray<string> }
type Props = {
  id?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  data?: ReadonlyArray<ChemicalOption>
  className?: string
  minChars?: number
  onChange?: (value: string) => void
  onSelect?: (item: ChemicalOption) => void
}

const DEFAULT_DATA: ReadonlyArray<ChemicalOption> = [
  { id: "chem-0001", label: "아세톤", keywords: ["C3H6O", "67-64-1", "프로판온", "Dimethyl ketone"] },
  { id: "chem-0002", label: "에탄올", keywords: ["C2H6O", "64-17-5", "알코올", "Ethyl alcohol"] },
  { id: "chem-0003", label: "메탄올", keywords: ["CH4O", "67-56-1", "메틸알코올", "Methyl alcohol"] },
  { id: "chem-0004", label: "이소프로판올", keywords: ["C3H8O", "67-63-0", "IPA", "Isopropyl alcohol"] },
  { id: "chem-0005", label: "염산", keywords: ["HCl(aq)", "7647-01-0", "Hydrochloric acid"] },
  { id: "chem-0006", label: "질산", keywords: ["HNO3", "7697-37-2", "Nitric acid"] },
  { id: "chem-0007", label: "황산", keywords: ["H2SO4", "7664-93-9", "Sulfuric acid"] },
  { id: "chem-0008", label: "수산화나트륨", keywords: ["NaOH", "1310-73-2", "가성소다", "Sodium hydroxide"] },
  { id: "chem-0009", label: "수산화칼륨", keywords: ["KOH", "1310-58-3", "가성가리", "Potassium hydroxide"] },
  { id: "chem-0010", label: "암모니아수", keywords: ["NH3(aq)", "1336-21-6", "Ammonium hydroxide"] },
  { id: "chem-0011", label: "아세트산", keywords: ["C2H4O2", "64-19-7", "초산", "Acetic acid"] },
  { id: "chem-0012", label: "포름알데히드", keywords: ["CH2O", "50-00-0", "Formaldehyde"] },
  { id: "chem-0013", label: "톨루엔", keywords: ["C7H8", "108-88-3", "Methylbenzene", "Toluene"] },
  { id: "chem-0014", label: "크실렌", keywords: ["C8H10", "1330-20-7", "Xylene"] },
  { id: "chem-0015", label: "에틸아세테이트", keywords: ["C4H8O2", "141-78-6", "Ethyl acetate"] },
  { id: "chem-0016", label: "디메틸설폭사이드", keywords: ["C2H6OS", "67-68-5", "DMSO"] },
  { id: "chem-0017", label: "디클로로메탄", keywords: ["CH2Cl2", "75-09-2", "메틸렌클로라이드", "Dichloromethane"] },
  { id: "chem-0018", label: "클로로포름", keywords: ["CHCl3", "67-66-3", "Chloroform"] },
  { id: "chem-0019", label: "테트라하이드로푸란", keywords: ["C4H8O", "109-99-9", "THF", "Tetrahydrofuran"] },
  { id: "chem-0020", label: "아세토니트릴", keywords: ["C2H3N", "75-05-8", "Acetonitrile"] },
  { id: "chem-0021", label: "헤탄", keywords: ["C6H14", "110-54-3", "n-Hexane", "헥산"] },
  { id: "chem-0022", label: "사이클로헥산", keywords: ["C6H12", "110-82-7", "Cyclohexane"] },
  { id: "chem-0023", label: "벤젠", keywords: ["C6H6", "71-43-2", "Benzene"] },
  { id: "chem-0024", label: "톨루엔디이소시아네이트", keywords: ["C9H6N2O2", "26471-62-5", "TDI"] },
  { id: "chem-0025", label: "메틸에틸케톤", keywords: ["C4H8O", "78-93-3", "MEK", "2-Butanone"] },
  { id: "chem-0026", label: "프로필렌글리콜", keywords: ["C3H8O2", "57-55-6", "Propylene glycol"] },
  { id: "chem-0027", label: "에틸렌글리콜", keywords: ["C2H6O2", "107-21-1", "Ethylene glycol"] },
  { id: "chem-0028", label: "글리세롤", keywords: ["C3H8O3", "56-81-5", "Glycerol"] },
  { id: "chem-0029", label: "과산화수소", keywords: ["H2O2", "7722-84-1", "Hydrogen peroxide"] },
  { id: "chem-0030", label: "차아염소산나트륨", keywords: ["NaOCl", "7681-52-9", "Sodium hypochlorite"] },
  { id: "chem-0031", label: "황산나트륨", keywords: ["Na2SO4", "7757-82-6", "Sodium sulfate"] },
  { id: "chem-0032", label: "염화나트륨", keywords: ["NaCl", "7647-14-5", "Sodium chloride", "식염"] },
  { id: "chem-0033", label: "탄산나트륨", keywords: ["Na2CO3", "497-19-8", "Sodium carbonate", "소다회"] },
  { id: "chem-0034", label: "중탄산나트륨", keywords: ["NaHCO3", "144-55-8", "Baking soda", "Sodium bicarbonate"] },
  { id: "chem-0035", label: "인산", keywords: ["H3PO4", "7664-38-2", "Phosphoric acid"] },
  { id: "chem-0036", label: "붕산", keywords: ["H3BO3", "10043-35-3", "Boric acid"] },
  { id: "chem-0037", label: "초산에틸", keywords: ["C4H8O2", "141-78-6", "Ethyl acetate", "에틸아세테이트"] },
  { id: "chem-0038", label: "아세트산나트륨", keywords: ["C2H3NaO2", "127-09-3", "Sodium acetate"] },
  { id: "chem-0039", label: "암모늄설페이트", keywords: ["(NH4)2SO4", "7783-20-2", "Ammonium sulfate"] },
  { id: "chem-0040", label: "황산구리(II)", keywords: ["CuSO4", "7758-98-7", "Copper(II) sulfate", "청람비"] },
  { id: "chem-0041", label: "질산은", keywords: ["AgNO3", "7761-88-8", "Silver nitrate"] },
  { id: "chem-0042", label: "요오드화칼륨", keywords: ["KI", "7681-11-0", "Potassium iodide"] },
  { id: "chem-0043", label: "염화암모늄", keywords: ["NH4Cl", "12125-02-9", "Ammonium chloride"] },
  { id: "chem-0044", label: "질소", keywords: ["N2", "7727-37-9", "Nitrogen gas"] },
  { id: "chem-0045", label: "산소", keywords: ["O2", "7782-44-7", "Oxygen"] },
  { id: "chem-0046", label: "이산화탄소", keywords: ["CO2", "124-38-9", "Carbon dioxide"] },
  { id: "chem-0047", label: "일산화탄소", keywords: ["CO", "630-08-0", "Carbon monoxide"] },
  { id: "chem-0048", label: "황화수소", keywords: ["H2S", "7783-06-4", "Hydrogen sulfide"] },
  { id: "chem-0049", label: "염화수소", keywords: ["HCl", "7647-01-0", "Hydrogen chloride"] },
  { id: "chem-0050", label: "질산암모늄", keywords: ["NH4NO3", "6484-52-2", "Ammonium nitrate"] },
]

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFC")
}

export default function ChemicalAutocomplete(props: Props): React.ReactElement {
  const { id = "chemical-autocomplete", value = "", placeholder = "화학물질 검색 또는 입력", disabled = false, data = DEFAULT_DATA, className = "", minChars = 1, onChange, onSelect } = props
  const [query, setQuery] = useState<string>(value)
  const [open, setOpen] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listId = `${id}-listbox`

  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered: ReadonlyArray<ChemicalOption> = useMemo(() => {
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
    (o: ChemicalOption): void => {
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
