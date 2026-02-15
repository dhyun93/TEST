import React, { useState, useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { X as CloseIcon, FileText } from "lucide-react"
import PreEvaluation from "@/pages/RiskAssessment/PreEvaluation"

const RISK_METHOD_LABELS: { [key: string]: string } = {
  frequency: "빈도·강도법",
  threestep: "위험성수준 3단계 판단법",
  chemical: "화학물질 평가법",
  checklist: "체크리스트법",
}

const RiskAssessmentLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showChecklist, setShowChecklist] = useState(false)

  useEffect(() => {
    if (location.pathname === "/risk-assessment/list" && location.state?.showChecklist) {
      setShowChecklist(true)
    }
  }, [location.pathname, location.key])

  const getPageLabel = (): string => {
    if (location.pathname.includes("/methods/frequency")) return RISK_METHOD_LABELS["frequency"]
    if (location.pathname.includes("/methods/threestep")) return RISK_METHOD_LABELS["threestep"]
    if (location.pathname.includes("/methods/chemical")) return RISK_METHOD_LABELS["chemical"]
    if (location.pathname.includes("/methods/checklist")) return RISK_METHOD_LABELS["checklist"]
    return "위험성평가"
  }

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <main className="flex-1 flex flex-col box-border overflow-auto" style={{ position: "relative", paddingBottom: "2rem" }}>
        <div className="w-full h-[50px] flex items-center justify-between px-3 relative" style={{ backgroundColor: "var(--frame-bg)" }}>
          <button
            onClick={() => {
              if (window.confirm("위험성평가 페이지를 종료하고 홈화면으로 이동하시겠습니까?")) navigate("/dashboard")
            }}
            className="text-white p-1 rounded hover:opacity-80"
          >
            <CloseIcon size={19} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-white text-sm md:text-base font-medium whitespace-nowrap">{getPageLabel()}</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm("위험성평가 목록으로 이동하시겠습니까?")) navigate("/risk-assessment/list")
            }}
            className="flex items-center gap-1 text-white text-xs font-medium rounded-lg px-2 h-[28px] transition-opacity duration-300"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseOver={e => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={e => (e.currentTarget.style.opacity = "1")}
          >
            <FileText size={16} />
            <span className="hidden sm:inline">평가목록</span>
          </button>
        </div>
        <div className="flex-1 w-full mx-auto overflow-y-auto">
          <Outlet />
        </div>
        {showChecklist && <PreEvaluation onClose={() => setShowChecklist(false)} />}
      </main>
    </div>
  )
}

export default RiskAssessmentLayout
