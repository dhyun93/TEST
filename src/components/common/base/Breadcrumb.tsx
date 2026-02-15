import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

type PathMap = Record<string, string>
type ActionMap = Record<string, string>
type Crumb = { url: string; name: string }
type LocationState = { mode?: "create" | "edit" | "detail" } | null

const pathNameMap: PathMap = {
  "/dashboard": "대시보드",
  "/business-management": "사업장관리",
  "/business-management/basic": "기본사업장관리",
  "/business-management/policy-goal": "경영방침",
  "/business-management/budget": "안전보건 목표 및 추진계획",
  "/business-management/organization": "조직도",
  "/risk-assessment": "위험성평가",
  "/risk-assessment/chemical": "화학물질평가",
  "/risk-assessment/risk": "위험평가",
  "/risk-assessment/list": "평가목록",
  "/safety-education": "안전보건교육",
  "/safety-education/education": "안전보건교육",
  "/inspection": "안전점검",
  "/inspection/checklist": "",
  "/inspection/results": "점검결과",
  "/asset-management": "자산관리",
  "/asset-management/machine": "위험기계/기구/설비",
  "/asset-management/hazard": "유해/위험물질",
  "/supply-chain-management": "도급협의체관리",
  "/supply-chain-management/partners": "수급업체 관리",
  "/supply-chain-management/evaluation": "안전보건수준 평가",
  "/supply-chain-management/committee": "안전보건협의체 회의록",
  "/supply-chain-management/siteaudit": "협동 안전보건점검",
  "/supply-chain-management/training": "안전보건 교육/훈련",
  "/nearmiss": "아차사고",
  "/nearmiss/incident": "아차사고",
  "/nearmiss/safevoice": "안전보이스",
  "/tbm": "TBM",
  "/safety-work-permit": "작업중지요청",
  "/ptw": "PTW",
  "/ptw/list": "PTW 그룹",
  "/ptw/work-permit": "위험작업허가서",
  "/ptw/jsa": "작업위험분석(JSA)",
  "/ptw/site-evaluation": "현장 위험성평가",
  "/ptw/tbm": "TBM",
  "/ptw/register": "등록",
  "/ptw/manage": "관리",
  "/response-manual": "대응매뉴얼",
  "/notice-board": "공지/게시판",
  "/notice-board/notice": "공지사항",
  "/notice-board/resources": "자료실",
  "/notice-board/law": "중대재해처벌법",
  "/approval-box": "결재함",
  "/approval-box/received": "받은결재함",
  "/approval-box/sent": "보낸결재함",
  "/business-management/approval-line": "결재선관리",
  "/business-management/attendee": "참석자관리",
  "/qr-management": "QR관리",
  "/mypage": "마이페이지",
  "/support": "1:1 지원",
  "/user-guide": "사용가이드",
}

const actionNameMap: ActionMap = {
  register: "등록",
  detail: "상세",
}

const Breadcrumb: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const pathnames: string[] = location.pathname.split("/").filter(Boolean)
  const searchParams = new URLSearchParams(location.search)
  const tabName = searchParams.get("tab")

  const findParentName = (url: string): string => {
    if (pathNameMap[url]) return pathNameMap[url]
    const segments: string[] = url.split("/")
    while (segments.length > 1) {
      segments.pop()
      const parentUrl: string = segments.join("/") || "/"
      if (pathNameMap[parentUrl]) return pathNameMap[parentUrl]
    }
    return ""
  }

  const crumbs: Crumb[] = []
  const lastIndex = pathnames.length - 1

  pathnames.forEach((seg, idx) => {
    const url: string = "/" + pathnames.slice(0, idx + 1).join("/")
    let name: string

    if (idx === lastIndex && seg === "register") {
      if (state?.mode === "edit") {
        name = "편집"
      } else if (state?.mode === "detail") {
        name = "상세"
      } else {
        name = "등록"
      }
    } else {
      name = actionNameMap[seg] ?? findParentName(url)
    }

    if (!name) return
    if (crumbs.length === 0 || crumbs[crumbs.length - 1].url !== url) {
      crumbs.push({ url, name })
    }
  })

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3 whitespace-nowrap text-[11px] sm:text-[13px] leading-tight overflow-x-auto pl-3 sm:pl-0">
      <button onClick={() => navigate("/")} className="font-semibold hover:underline focus:outline-none shrink-0" type="button" aria-label="홈으로 이동" style={{ color: "#333639" }}>
        홈
      </button>
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={`${crumb.url}-${idx}`}>
          <ChevronRight className="w-3 h-3 sm:w-[13px] sm:h-[13px] shrink-0" strokeWidth={2} color="#999999" />
          <span className="font-normal truncate max-w-[80px] sm:max-w-none" style={{ color: "#999999", userSelect: "none" }}>
            {crumb.name}
          </span>
        </React.Fragment>
      ))}
      {tabName && (
        <>
          <ChevronRight className="w-3 h-3 sm:w-[13px] sm:h-[13px] shrink-0" strokeWidth={2} color="#999999" />
          <span className="font-normal truncate max-w-[80px] sm:max-w-none" style={{ color: "#999999", userSelect: "none" }}>
            {tabName}
          </span>
        </>
      )}
    </nav>
  )
}

export default Breadcrumb
