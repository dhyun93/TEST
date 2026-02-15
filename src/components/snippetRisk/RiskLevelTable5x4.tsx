import React, { useMemo, useState } from "react"

type Level = "매우낮음" | "낮음" | "보통" | "약간높음" | "높음" | "매우높음"
type Range = [number, number]
type Ranges = Record<Level, Range>

const BORDER_CLASS = "border-[var(--border)]"
const HEADER_BG_CLASS = "bg-[var(--neutral-bg)]"
const TEXT_PRIMARY = "text-gray-800"
const TEXT_SECONDARY = "text-gray-500"
const TEXT_SIZE_TH = "text-sm"
const TEXT_SIZE_TD = "text-xs md:text-[13px]"
const CELL_PADDING = "px-2 md:px-4 py-2"
const TH_PADDING = "px-2 md:px-4 py-2 md:py-3"
const INPUT_SIZE = "w-8 md:w-10 h-7 md:h-8"
const COL_LEFT = "35%"
const COL_RIGHT = "65%"
const COL_INNER_LEFT = "55%"
const COL_INNER_RIGHT = "45%"
const COLORS: Record<Level, string> = { 매우높음: "#FF3939", 높음: "#FF6C00", 약간높음: "#FFBB35", 보통: "#FFE13E", 낮음: "#C1FF1B", 매우낮음: "#1EED1E" }
const ORDER: Level[] = ["매우낮음", "낮음", "보통", "약간높음", "높음", "매우높음"]

const RiskLevelTable5x4: React.FC = () => {
  const [scores, setScores] = useState<Record<Level, [string, string]>>({ 매우낮음: ["1", "2"], 낮음: ["3", "5"], 보통: ["6", "8"], 약간높음: ["9", "10"], 높음: ["11", "15"], 매우높음: ["16", "20"] })

  const toNum = (v: string) => {
    const n = parseInt(v.replace(/[^0-9]/g, "") || "")
    return isNaN(n) ? NaN : Math.min(20, Math.max(1, n))
  }

  const normalized: Ranges = useMemo(() => {
    const r: Partial<Ranges> = {}
    ORDER.forEach(l => {
      let a = toNum(scores[l][0]),
        b = toNum(scores[l][1])
      if (isNaN(a) || isNaN(b)) {
        a = 1
        b = 1
      }
      if (a > b) {
        const t = a
        a = b
        b = t
      }
      r[l] = [a, b]
    })
    return r as Ranges
  }, [scores])

  const getLevelByScore = (s: number, r: Ranges): Level => {
    for (const l of ORDER) {
      const [a, b] = r[l]
      if (s >= a && s <= b) return l
    }
    return "매우낮음"
  }

  const handleScoreChange = (level: Level, index: 0 | 1, value: string) => {
    if (/^([1-9]|1[0-9]|20)?$/.test(value)) {
      setScores(prev => {
        const next = [...prev[level]] as [string, string]
        next[index] = value
        return { ...prev, [level]: next }
      })
    }
  }

  const likeRows = [
    { label: "최상(5)", v: 5 },
    { label: "상(4)", v: 4 },
    { label: "중(3)", v: 3 },
    { label: "하(2)", v: 2 },
    { label: "최하(1)", v: 1 },
  ]
  const sevCols = [
    { label: "최대(4)", v: 4 },
    { label: "대(3)", v: 3 },
    { label: "중(2)", v: 2 },
    { label: "소(1)", v: 1 },
  ]
  const standards = [
    { level: "매우낮음" as Level, standard: "현재의 안전대책 유지" },
    { level: "낮음" as Level, standard: "안전정보 및 주기적 안전보건교육의 제공이 필요한 위험" },
    { level: "보통" as Level, standard: "정비, 보수기간에 안전대책을 수립하고 개선해야 할 위험" },
    { level: "약간높음" as Level, standard: "즉시개선" },
    { level: "높음" as Level, standard: "긴급 임시안전보건대책을 세운 후 작업 실시하고 정비, 보수기간 전에 안전보건 대책 수립 및 개선해야 할 위험" },
    { level: "매우높음" as Level, standard: "즉시 작업중지 (작업 지속 시 즉시 개선 실행 위험)" },
  ]

  return (
    <>
      <table className={`w-full border ${BORDER_CLASS} rounded text-xs md:text-sm table-fixed mt-4`} style={{ borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: COL_LEFT }} />
          <col style={{ width: COL_RIGHT }} />
        </colgroup>
        <thead>
          <tr>
            <th className={`border ${BORDER_CLASS} ${HEADER_BG_CLASS} ${TEXT_SECONDARY} ${TEXT_SIZE_TH} font-medium ${TH_PADDING} text-center`}>위험성 수준</th>
            <th className={`border ${BORDER_CLASS} ${HEADER_BG_CLASS} ${TEXT_SECONDARY} ${TEXT_SIZE_TH} font-medium ${TH_PADDING} text-center`}>관리기준</th>
          </tr>
        </thead>
        <tbody>
          {standards.map(({ level, standard }, i) => (
            <tr key={i}>
              <td className="p-0 border-none">
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <colgroup>
                    <col style={{ width: COL_INNER_LEFT }} />
                    <col style={{ width: COL_INNER_RIGHT }} />
                  </colgroup>
                  <tbody>
                    <tr style={{ backgroundColor: COLORS[level] }}>
                      <td className={`${CELL_PADDING} font-medium border-r border-b ${BORDER_CLASS}`}>
                        <div className="flex justify-center items-center gap-1 md:gap-1.5">
                          <input
                            type="text"
                            value={scores[level][0]}
                            maxLength={2}
                            onChange={e => handleScoreChange(level, 0, e.target.value)}
                            className={`${INPUT_SIZE} rounded-md border ${BORDER_CLASS} ${TEXT_SIZE_TD} text-center bg-white ${TEXT_PRIMARY}`}
                            inputMode="numeric"
                          />
                          <span className={`font-bold ${TEXT_SIZE_TD}`}>~</span>
                          <input
                            type="text"
                            value={scores[level][1]}
                            maxLength={2}
                            onChange={e => handleScoreChange(level, 1, e.target.value)}
                            className={`${INPUT_SIZE} rounded-md border ${BORDER_CLASS} ${TEXT_SIZE_TD} text-center bg-white ${TEXT_PRIMARY}`}
                            inputMode="numeric"
                          />
                        </div>
                      </td>
                      <td className={`${CELL_PADDING} font-medium border-b ${BORDER_CLASS} ${TEXT_SIZE_TD} ${TEXT_PRIMARY} whitespace-nowrap`}>{level}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className={`font-medium text-left ${CELL_PADDING} border ${BORDER_CLASS} ${TEXT_SIZE_TD} ${TEXT_PRIMARY}`} style={{ backgroundColor: COLORS[level] }}>
                {standard}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className={`w-full border ${BORDER_CLASS} rounded text-xs md:text-sm table-fixed mt-6`}>
        <thead>
          <tr>
            <th className={`border ${BORDER_CLASS} ${HEADER_BG_CLASS} ${TEXT_SECONDARY} ${TEXT_SIZE_TH} font-medium ${TH_PADDING} text-center w-20 md:w-28`}>가능성(빈도)</th>
            {sevCols.map(c => (
              <th key={c.v} className={`border ${BORDER_CLASS} ${HEADER_BG_CLASS} ${TEXT_SECONDARY} ${TEXT_SIZE_TH} font-medium ${TH_PADDING} text-center w-14 md:w-16`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {likeRows.map(r => (
            <tr key={r.v}>
              <td className={`border ${BORDER_CLASS} ${CELL_PADDING} text-center font-medium ${TEXT_SIZE_TD} ${TEXT_PRIMARY}`}>{r.label}</td>
              {sevCols.map(c => {
                const score = r.v * c.v
                const level = getLevelByScore(score, normalized)
                return (
                  <td key={c.v} className={`border ${BORDER_CLASS} ${CELL_PADDING} text-center font-medium ${TEXT_SIZE_TD} ${TEXT_PRIMARY}`} style={{ backgroundColor: COLORS[level] }}>
                    {`${level}(${score})`}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default RiskLevelTable5x4
