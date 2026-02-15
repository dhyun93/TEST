import React from "react"
import ReactECharts from "echarts-for-react"
import { ShieldCheck, FileChartColumn, ChevronRight, Archive } from "lucide-react"
import { useNavigate } from "react-router-dom"

function last6MonthLabels() {
  const a: string[] = []
  const n = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(n.getFullYear(), n.getMonth() - i, 1)
    a.push(`${d.getMonth() + 1}월`)
  }
  return a
}
function last7DayLabels() {
  const a: string[] = []
  const n = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(n)
    d.setDate(n.getDate() - i)
    a.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return a
}

type RangeKey = "7d" | "6m"
type Series = { name: "안전보이스" | "아차사고"; color: string; data: number[] }
type LineChartProps = { title: string; dataByRange: Record<RangeKey, Series[]>; subtitle?: string }

const RangeToggle: React.FC<{ value: RangeKey; onChange: (v: RangeKey) => void }> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-gray-200 bg-white overflow-hidden text-[10px] sm:text-[11px] shrink-0">
    <button
      type="button"
      aria-pressed={value === "7d"}
      onClick={() => onChange("7d")}
      className={`px-2 sm:px-2.5 py-1 leading-none transition outline-none focus-visible:border-gray-400 ${value === "7d" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
    >
      최근 7일
    </button>
    <button
      type="button"
      aria-pressed={value === "6m"}
      onClick={() => onChange("6m")}
      className={`px-2 sm:px-2.5 py-1 leading-none transition outline-none focus-visible:border-gray-400 border-l border-gray-200 ${value === "6m" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
    >
      6개월
    </button>
  </div>
)

const CompactDualLineChart: React.FC<LineChartProps> = ({ title, dataByRange, subtitle }) => {
  const [range, setRange] = React.useState<RangeKey>("7d")
  const [solo, setSolo] = React.useState<Series["name"] | null>(null)
  const labels = React.useMemo(() => (range === "7d" ? last7DayLabels() : last6MonthLabels()), [range])
  const series = React.useMemo(() => {
    const src = dataByRange[range] || []
    return src.map(s => ({ ...s, data: s.data.slice(-labels.length) }))
  }, [dataByRange, range, labels.length])
  const shown = solo ? series.filter(s => s.name === solo) : series
  const yCfg = React.useMemo(() => (range === "7d" ? { min: 0, max: 25, interval: 5 } : { min: 0, max: 50, interval: 10 }), [range])
  const option = React.useMemo(
    () => ({
      textStyle: { fontFamily: "Inter,ui-sans-serif" },
      tooltip: {
        trigger: "axis",
        borderWidth: 0,
        backgroundColor: "#161616",
        textStyle: { fontSize: 12, color: "#ffffff" },
        axisPointer: { type: "line", lineStyle: { type: "dashed", color: "#94a3b8" } },
      },
      grid: { left: 16, right: 18, top: 34, bottom: 18, containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: "#C7CED6" } },
        axisLabel: { color: "#111827", fontSize: 12, hideOverlap: true, showMinLabel: true, showMaxLabel: true, margin: 8 },
      },
      yAxis: {
        type: "value",
        ...yCfg,
        splitLine: { show: true, lineStyle: { color: "#E5E7EB", type: "dashed" } },
        axisLabel: { color: "#374151", fontSize: 12, formatter: (v: number) => v.toString() },
      },
      legend: { show: false },
      graphic: [{ type: "text", right: 10, top: 6, style: { text: "단위: 건", fontSize: 11, fontFamily: "Inter,ui-sans-serif", fill: "#6B7280" } }],
      series: shown.map(s => ({
        name: s.name,
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2, color: s.color },
        itemStyle: { color: s.color, borderColor: s.color, borderWidth: 1 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${s.color}33` },
              { offset: 1, color: "rgba(255,255,255,0)" },
            ],
          },
        },
        emphasis: { focus: "series" },
        data: s.data,
      })),
      animationDuration: 500,
      animationEasing: "quarticOut",
    }),
    [labels, shown, yCfg]
  )
  const allActive = solo === null
  return (
    <section className="bg-white rounded-[16px] p-3 shadow-sm border border-[#E0E6EA] h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileChartColumn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E3C6B] shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <span className="ml-2 text-[10px] sm:text-[11px] text-gray-500">{subtitle}</span>}
        </div>
        <RangeToggle value={range} onChange={setRange} />
      </div>
      <div className="flex items-center gap-1 mt-3 text-[12px] text-gray-600 shrink-0">
        <button
          onClick={() => setSolo(null)}
          className={`px-3 py-1.5 rounded-md transition ${allActive ? "bg-gray-100 font-semibold text-gray-900 shadow-sm" : "hover:bg-gray-50 hover:text-gray-800"}`}
        >
          전체
        </button>
        {series.map(s => {
          const active = !solo || solo === s.name
          return (
            <button
              key={s.name}
              onClick={() => setSolo(p => (p === s.name ? null : s.name))}
              className={`px-3 py-1.5 rounded-md transition ${active ? "bg-gray-100 font-semibold text-gray-900 shadow-sm" : "hover:bg-gray-50 hover:text-gray-800"}`}
            >
              {s.name}
            </button>
          )
        })}
      </div>
      <div className="rounded-xl border border-[#EEF2F6] p-1 mt-3 flex-1 min-h-0 overflow-hidden">
        <ReactECharts option={option} notMerge lazyUpdate opts={{ renderer: "canvas" }} style={{ width: "100%", height: "100%" }} />
      </div>
    </section>
  )
}

const mitigationDone = 34,
  mitigationTotal = 40,
  mitigationRate = Math.round((mitigationDone / mitigationTotal) * 100)
const mitigationDonePrev = 30,
  mitigationTotalPrev = 40,
  mitigationPrevRate = Math.round((mitigationDonePrev / mitigationTotalPrev) * 100)
const mitigationDeltaPct = mitigationPrevRate === 0 ? 0 : Math.round(((mitigationRate - mitigationPrevRate) / mitigationPrevRate) * 1000) / 10
const deltaUp = mitigationDeltaPct > 0,
  deltaDown = mitigationDeltaPct < 0
const m = 58,
  c = 42,
  t = m + c

const DashboardSummary: React.FC = () => {
  const navigate = useNavigate()
  const goRiskAssessment = () => navigate("/risk-assessment/list")
  const goAsset = () => navigate("/asset-management/machine")

  const dataByRange: Record<RangeKey, Series[]> = {
    "6m": [
      { name: "안전보이스", color: "#F39C13", data: [12, 11, 14, 16, 18, 17] },
      { name: "아차사고", color: "#AF5C56", data: [9, 8, 12, 11, 10, 13] },
    ],
    "7d": [
      { name: "안전보이스", color: "#F39C13", data: [14, 15, 13, 16, 17, 18, 16] },
      { name: "아차사고", color: "#AF5C56", data: [8, 7, 9, 10, 9, 11, 10] },
    ],
  }

  const gaugeOption = {
    series: [
      {
        type: "gauge",
        startAngle: 90,
        endAngle: -270,
        radius: "100%",
        center: ["50%", "50%"],
        progress: {
          show: true,
          roundCap: true,
          width: 6,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#FF3300" },
                { offset: 1, color: "#8A1C00" },
              ],
            },
          },
        },
        axisLine: { lineStyle: { width: 6, color: [[1, "rgba(138,28,0,0.25)"]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { valueAnimation: true, formatter: "{value}%", color: "#031E36", fontSize: 11, fontWeight: "bold", offsetCenter: [0, 0] },
        data: [{ value: mitigationRate }],
      },
    ],
  }
  const assetOption = {
    series: [
      {
        type: "pie",
        radius: ["80%", "100%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: m, name: "위험기계·기구·설비", itemStyle: { color: "#6EACC0" } },
          { value: c, name: "유해·위험물질", itemStyle: { color: "#3B5063" } },
        ],
      },
    ],
    graphic: [{ type: "text", left: "center", top: "middle", style: { text: `${t}건`, fontSize: 11, fontWeight: "bold", fill: "#031E36" } }],
  }

  return (
    <div className="flex flex-col gap-3 lg:h-[623px]">
      <div className="h-[300px] sm:h-[390px] min-h-0">
        <CompactDualLineChart title="안전보이스 및 아차사고 추이" subtitle="" dataByRange={dataByRange} />
      </div>

      <section className="bg-white rounded-[16px] p-3 shadow-sm border border-[#E0E6EA] h-[130px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E3C6B]" />
            <h3 className="text-sm font-semibold text-gray-800">위험성 감소대책 개선율</h3>
          </div>
          <button type="button" onClick={goRiskAssessment} className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition">
            <span>전체보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#EEF2F6] h-full md:col-span-3">
            <div className="relative w-12 h-12 shrink-0">
              <ReactECharts option={gaugeOption} style={{ width: "48px", height: "48px" }} />
            </div>
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500">위험성 감소대책 실행 건수</span>
                  <span className="text-xs font-medium text-[#031E36] mt-0.5">
                    {mitigationDone}/{mitigationTotal}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${deltaUp ? "text-blue-700 bg-blue-50 border border-blue-100" : deltaDown ? "text-red-700 bg-red-50 border border-red-100" : "text-gray-600 bg-gray-50 border border-gray-200"}`}
                >
                  {deltaUp ? "+" : deltaDown ? "-" : "±"}
                  {Math.abs(mitigationDeltaPct).toFixed(1)}%
                </span>
                <span className="mt-0.5 text-[10px] text-gray-400">지난주 대비</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[16px] p-3 shadow-sm border border-[#E0E6EA] h-[130px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#1E3C6B]" />
            <h3 className="text-sm font-semibold text-gray-800">자산등록 현황</h3>
          </div>
          <button type="button" onClick={goAsset} className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition">
            <span>전체보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#EEF2F6] h-full md:col-span-3">
            <div className="relative w-12 h-12 shrink-0">
              <ReactECharts option={assetOption} style={{ width: "48px", height: "48px" }} />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B5063]" />
                  <span className="text-[11px] text-gray-500">유해·위험물질</span>
                  <span className="text-xs font-medium text-[#031E36]">{c}건</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6EACC0]" />
                  <span className="text-[11px] text-gray-500">위험기계·기구·설비</span>
                  <span className="text-xs font-medium text-[#031E36]">{m}건</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardSummary
