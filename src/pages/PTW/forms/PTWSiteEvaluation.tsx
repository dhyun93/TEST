import React, { useState, useCallback, ChangeEvent, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import Button from "@/components/common/base/Button"
import { Send, FolderOpen, Printer, Save, Plus, X } from "lucide-react"
import Checkbox from "@/components/common/base/Checkbox"
import PTWListModal from "../../../components/dialog/PTWListDialog"
import SignaturePadDialog from "@/components/dialog/SignaturePadDialog"
import UserSelectModal, { SelectedUser } from "@/components/dialog/UserSelectModal"
import { useLoadingStore } from "@/stores/loadingStore"
import { PTWFile } from "../FilePanel/FilePanel"

type PTWSiteEvaluationProps = {
  ptwId?: string
  attachedFiles?: PTWFile[]
}

interface Reviewer {
  user_id: number
  name: string
  position: string
  rank: string
  phone: string
  subject: string
}

interface SiteEvalFormData {
workplace?: string
applicationDate?: string
workTypes?: string[]
requestDept?: string
workerCount?: number
workDate?: string
applicantName?: string
applicant?: string
workLocation?: string
workType?: string
otherSafety?: string
safetyChecks?: Record<string, string | boolean>
no?: string
team?: string
date?: string
rev?: string
reason?: string
tools?: string
safetyDevices?: string
workContent?: string
workName?: string
teamName?: string
teamMember?: Reviewer
}

interface RiskRow {
id: number
task: string
hazard: string
currentRisk: string
measure: string
improvedRisk: string
checked: boolean
beforeImages: string[]
afterImages: string[]
}

interface InspectionRow {
id: number
time: string
person: string
note: string
}

const BORDER_COLOR = "border-[#888888]"
const HEADER_TEXT_STYLE = "text-[#595F68] text-[15px] font-medium"
const HEADER_BG_STYLE = `bg-[#f3f3f3] ${HEADER_TEXT_STYLE}`
const TEXT_TITLE = "text-[18px] font-bold text-[#333A3F] text-center"
const TEXT_SUBTITLE = "text-[15px] text-[#333A3F] text-center"
const TEXT_HEADER = "text-[15px] font-medium text-[#595F68] text-center"
const TEXT_BODY = "text-[15px] text-[#333A3F] text-left"
const TEXT_NOTICE = "text-[13px] text-[#333A3F]"
const LABEL_WIDTH = "w-[10%]"
const READONLY_BG = "bg-[#F9FAFB] text-gray-600 cursor-default"
const PLACEHOLDER_STYLE = "placeholder:text-[13px] placeholder:text-gray-500"
const WORKPLACE_NAME = "(주)에스피에스앤아이 당진 슬래그공장"
const ICON_COLOR = "text-gray-500"

const RISK_LEVELS = ["상", "중", "하"]

const INITIAL_QUESTIONS = [
{ id: 1, question: "처음 작업에 투입되는 작업자가 있는가?", key: "first_worker" },
{ id: 2, question: "처음 취급하는 공기구나 장비가 있는가?", key: "first_equipment" }
]

const NOTICE_TEXTS = {
riskEval: "○ 현장리더 또는 관리자는 작업시작 전 T.B.M을 통한 현장 위험성평가 결과를 전 직원과 공유하고 확인하여야 합니다.",
inspection: "(작업팀, 관리감독자, 안전담당자, 관리책임자 등은 위험성에 대한 방호대책이 유지되고 있는지 확인하여야 합니다.)"
}

export default function PTWSiteEvaluation({ ptwId, attachedFiles = [] }: PTWSiteEvaluationProps): React.ReactElement {
const [formData, setFormData] = useState<SiteEvalFormData>({ workplace: WORKPLACE_NAME })
const [riskRows, setRiskRows] = useState<RiskRow[]>(
Array.from({ length: 8 }, (_, i) => ({
id: i + 1,
task: "",
hazard: "",
currentRisk: "",
measure: "",
improvedRisk: "",
checked: false,
beforeImages: [],
afterImages: []
}))
)
const [inspectionRows, setInspectionRows] = useState<InspectionRow[]>(
Array.from({ length: 3 }, (_, i) => ({
id: i + 1,
time: "",
person: "",
note: ""
}))
)
const [isListModalOpen, setIsListModalOpen] = useState(false)
const [mobileSignatureOpen, setMobileSignatureOpen] = useState(false)
const [signaturePadOpen, setSignaturePadOpen] = useState(false)
const [userSelectModalOpen, setUserSelectModalOpen] = useState(false)
const { setLoading } = useLoadingStore()
const printRef = useRef<HTMLDivElement>(null)

const handlePrint = useReactToPrint({
contentRef: printRef,
documentTitle: "현장 위험성평가(JSA)",
pageStyle: `
@page {
size: A4 portrait;
margin: 15mm 10mm;
}
@media print {
body {
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
margin: 0;
padding: 0;
}
.no-print { display: none !important; }
.page-break { page-break-before: always; }
.print-container {
width: 190mm;
max-width: 190mm;
margin: 0 auto;
}
}
`
})

const updateFormData = useCallback((u: Partial<SiteEvalFormData>): void => {
setFormData(p => ({ ...p, ...u }))
}, [])

const updateSafetyCheck = useCallback((k: string, v: string | boolean): void => {
setFormData(p => ({
...p,
safetyChecks: { ...(p.safetyChecks || {}), [k]: v }
}))
}, [])

const updateRiskRow = useCallback((id: number, k: keyof RiskRow, v: any): void => {
setRiskRows(p => p.map(r => r.id === id ? { ...r, [k]: v } : r))
}, [])

const addRiskRow = useCallback(() => {
setRiskRows(prev => {
if (prev.length >= 15) return prev
return [...prev, {
id: Date.now(),
task: "",
hazard: "",
currentRisk: "",
measure: "",
improvedRisk: "",
checked: false,
beforeImages: [],
afterImages: []
}]
})
}, [])

const removeRiskRow = useCallback((id: number) => {
setRiskRows(prev => prev.filter(r => r.id !== id))
}, [])

const updateInspectionRow = useCallback((id: number, k: keyof InspectionRow, v: string): void => {
setInspectionRows(p => p.map(r => r.id === id ? { ...r, [k]: v } : r))
}, [])

const addInspectionRow = useCallback(() => {
setInspectionRows(prev => {
if (prev.length >= 10) return prev
return [...prev, {
id: Date.now(),
time: "",
person: "",
note: ""
}]
})
}, [])

const removeInspectionRow = useCallback((id: number) => {
setInspectionRows(prev => prev.filter(r => r.id !== id))
}, [])

const handleImageUpload = (id: number, k: "beforeImages" | "afterImages", e: ChangeEvent<HTMLInputElement>): void => {
const f = e.target.files
if (!f) return
const s = Array.from(f).filter(x => x.type.startsWith("image/")).slice(0, 5)
const urls = s.map(x => URL.createObjectURL(x))
setRiskRows(p => p.map(r => r.id === id ? { ...r, [k]: [...r[k], ...urls].slice(0, 5) } : r))
}

const getRiskColor = (l: string): string =>
l === "상" ? "bg-[#B65E5D] text-white" :
l === "중" ? "bg-[#CAB359] text-white" :
l === "하" ? "bg-[#80A16A] text-white" :
"bg-white text-gray-700"

const getRiskBadgeColor = (l: string): string =>
l === "상" ? "bg-[#B65E5D] text-white" :
l === "중" ? "bg-[#CAB359] text-white" :
l === "하" ? "bg-[#80A16A] text-white" :
"bg-gray-200 text-gray-600"

const handleSelectPTW = (data: any) => {
  setFormData(prev => ({
    ...prev,
    ...data,
    safetyChecks: data.safetyChecks || {}
  }))

  if (data.riskRows) {
    setRiskRows(data.riskRows)
  }

  if (data.inspectionRows) {
    setInspectionRows(data.inspectionRows)
  }

  setIsListModalOpen(false)
}

const handleSaveToStore = async () => {
if(!formData.teamName){
alert("작업팀(업체)을 입력해주세요.")
return
}
if(!window.confirm("저장하시겠습니까?")) return

setLoading(true)
try {
await new Promise(resolve => setTimeout(resolve, 300))
alert("저장되었습니다.")
} finally {
setLoading(false)
}
}

const handleSubmitForm = async () => {
if(!window.confirm("서류를 전송하시겠습니까?")) return

setLoading(true)
try {
await new Promise(resolve => setTimeout(resolve, 300))
alert("전송되었습니다.")
} finally {
setLoading(false)
}
}

const handleLoad = () => setIsListModalOpen(true)

const handleCancel = () => {
if (window.confirm("목록으로 이동하시겠습니까?\n저장하지 않은 내용은 사라집니다."))
window.location.href = "/ptw/list"
}

const openTeamMemberSelect = () => {
setUserSelectModalOpen(true)
}

const handleUserSelect = (user: SelectedUser) => {
updateFormData({
teamMember: {
user_id: user.id,
name: user.name,
position: user.position,
rank: user.rank,
phone: user.phone,
subject: user.subject,
}
})
setUserSelectModalOpen(false)
}

return (
<>
{/* Mobile */}
<div className="md:hidden w-full bg-white">
<div className="flex justify-between items-center px-2 py-2 border-b border-gray-200 sticky top-0 bg-white z-10">
<Button variant="support" onClick={handleCancel} className="text-xs px-2 py-1">목록으로</Button>
<div className="flex gap-1">
<Button variant="action" onClick={handleLoad} className="text-xs px-2 py-1 flex items-center gap-1"><FolderOpen size={12}/>불러오기</Button>
<Button variant="action" onClick={handleSaveToStore} className="text-xs px-2 py-1 flex items-center gap-1"><Save size={12}/>저장</Button>
</div>
</div>

<div className="px-2 py-3 space-y-3 pb-20">
{/* 기본정보 */}
<div className="border border-gray-300 rounded p-2 space-y-2">
<p className="text-xs font-semibold text-gray-700">기본정보</p>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">일자</label>
<input type="date" value={formData.safetyChecks?.sign_date as string || ""} onChange={e => updateSafetyCheck("sign_date", e.target.value)} className="w-full h-7 text-xs"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업팀(업체)</label>
<input value={formData.teamName || ""} onChange={e => updateFormData({ teamName: e.target.value })} className="w-full h-7 text-xs" placeholder="업체명"/>
</div>
</div>
</div>

{/* 초기 질문 */}
<div className="border border-gray-300 rounded p-2 space-y-2">
<p className="text-xs font-semibold text-gray-700">사전 확인</p>
{INITIAL_QUESTIONS.map(item => (
<div key={item.id} className="space-y-1 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
<p className="text-[10px] text-gray-700">{item.id}. {item.question}</p>
<div className="flex items-center gap-3">
<label className="flex items-center gap-1 text-[10px]">
<Checkbox checked={formData.safetyChecks?.[`${item.key}_yes`] as boolean || false} onChange={() => updateSafetyCheck(`${item.key}_yes`, !(formData.safetyChecks?.[`${item.key}_yes`] as boolean || false))}/>네
</label>
<label className="flex items-center gap-1 text-[10px]">
<Checkbox checked={formData.safetyChecks?.[`${item.key}_no`] as boolean || false} onChange={() => updateSafetyCheck(`${item.key}_no`, !(formData.safetyChecks?.[`${item.key}_no`] as boolean || false))}/>아니오
</label>
<input value={formData.safetyChecks?.[`${item.key}_action`] as string || ""} onChange={e => updateSafetyCheck(`${item.key}_action`, e.target.value)} className="flex-1 h-6 text-xs" placeholder="조치사항"/>
</div>
</div>
))}
</div>

{/* 위험분석 */}
<div className="border border-gray-300 rounded p-2">
<div className="flex items-center justify-between mb-2">
<p className="text-xs font-semibold text-gray-700">위험분석</p>
<button onClick={addRiskRow} disabled={riskRows.length >= 15} className={`text-[10px] text-blue-600 flex items-center ${riskRows.length >= 15 ? 'opacity-50' : ''}`}><Plus size={10}/>추가</button>
</div>
<div className="space-y-2">
{riskRows.map((row, idx) => (
<div key={row.id} className="border border-gray-200 rounded p-2 bg-gray-50">
<div className="flex items-center justify-between gap-1 mb-1">
<span className="text-[10px] text-gray-500">#{idx + 1}</span>
<div className="flex items-center gap-1">
{RISK_LEVELS.map(level => (
<button key={level} onClick={() => updateRiskRow(row.id, "currentRisk", row.currentRisk === level ? "" : level)} className={`text-[9px] px-2 py-0.5 rounded ${row.currentRisk === level ? getRiskBadgeColor(level) : 'bg-gray-100 text-gray-500'}`}>{level}</button>
))}
<Checkbox checked={row.checked} onChange={() => updateRiskRow(row.id, "checked", !row.checked)} className="ml-1"/>
{riskRows.length > 1 && <button onClick={() => removeRiskRow(row.id)} className="ml-1"><X size={12} className="text-gray-400"/></button>}
</div>
</div>
<div className="grid grid-cols-3 gap-1">
<input value={row.task} onChange={e => updateRiskRow(row.id, "task", e.target.value)} className="h-7 text-[10px]" placeholder="작업순서"/>
<input value={row.hazard} onChange={e => updateRiskRow(row.id, "hazard", e.target.value)} className="h-7 text-[10px]" placeholder="위험요인"/>
<input value={row.measure} onChange={e => updateRiskRow(row.id, "measure", e.target.value)} className="h-7 text-[10px]" placeholder="방호대책"/>
</div>
</div>
))}
</div>
</div>

{/* 일일순회점검 */}
<div className="border border-gray-300 rounded p-2">
<div className="flex items-center justify-between mb-2">
<p className="text-xs font-semibold text-gray-700">일일순회점검</p>
<button onClick={addInspectionRow} disabled={inspectionRows.length >= 10} className={`text-[10px] text-blue-600 flex items-center ${inspectionRows.length >= 10 ? 'opacity-50' : ''}`}><Plus size={10}/>추가</button>
</div>
<div className="space-y-2">
{inspectionRows.map((row, idx) => (
<div key={row.id} className="border border-gray-200 rounded p-2 bg-gray-50">
<div className="flex items-center justify-between gap-1 mb-1">
<span className="text-[10px] text-gray-500">#{idx + 1}</span>
{inspectionRows.length > 1 && <button onClick={() => removeInspectionRow(row.id)}><X size={12} className="text-gray-400"/></button>}
</div>
<div className="grid grid-cols-3 gap-1">
<input value={row.time} onChange={e => updateInspectionRow(row.id, "time", e.target.value)} className="h-7 text-[10px]" placeholder="시간"/>
<input value={row.person} onChange={e => updateInspectionRow(row.id, "person", e.target.value)} className="h-7 text-[10px]" placeholder="소속/성명"/>
<input value={row.note} onChange={e => updateInspectionRow(row.id, "note", e.target.value)} className="h-7 text-[10px]" placeholder="점검내용"/>
</div>
</div>
))}
</div>
</div>
</div>

{/* 작업팀 서명 바텀시트 */}
{mobileSignatureOpen && (
<div className="fixed inset-0 z-50 md:hidden">
<div className="absolute inset-0 bg-black/40" onClick={() => setMobileSignatureOpen(false)}/>
<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[50vh] overflow-y-auto">
<div className="flex justify-between items-center mb-3">
<span className="font-semibold text-sm">작업팀 서명</span>
<button onClick={() => setMobileSignatureOpen(false)}><X size={18} className="text-gray-500"/></button>
</div>
<div className="space-y-3">
<div>
<label className="text-xs text-gray-500">일자</label>
<input type="date" value={formData.safetyChecks?.sign_date as string || ""} onChange={e => updateSafetyCheck("sign_date", e.target.value)} className="w-full h-9 text-sm"/>
</div>
<div>
<label className="text-xs text-gray-500">작업팀(업체)</label>
<input value={formData.teamName || ""} onChange={e => updateFormData({ teamName: e.target.value })} className="w-full h-9 text-sm" placeholder="업체명"/>
</div>
<div>
<label className="text-xs text-gray-500">성명</label>
<div className="mt-1 p-2 border border-gray-200 rounded">
{formData.teamMember ? (
<div className="flex flex-col items-center gap-1">
<div className="text-xs font-medium text-gray-900">{formData.teamMember.name}</div>
<div className="text-[10px] text-gray-500">{formData.teamMember.subject}</div>
<div className="text-[10px] text-gray-500">{formData.teamMember.rank}</div>
<button onClick={openTeamMemberSelect} className="text-[10px] text-blue-600 hover:underline mt-1">변경</button>
</div>
) : (
<button onClick={openTeamMemberSelect} className="text-xs text-blue-600 hover:underline">선택</button>
)}
</div>
</div>
</div>
<Button variant="actionPrimary" onClick={() => setMobileSignatureOpen(false)} className="w-full mt-4 text-sm">확인</Button>
</div>
</div>
)}

<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex gap-2 md:hidden">
<Button variant="action" onClick={() => setMobileSignatureOpen(true)} className="flex-1 flex items-center justify-center gap-1 text-xs">
작업팀 서명 {formData.teamMember ? "✓" : ""}
</Button>
<Button variant="actionPrimary" onClick={handleSubmitForm} className="flex-1 flex items-center justify-center gap-1 text-xs"><Send size={12}/>전송</Button>
</div>
</div>

{/* Desktop */}
<div className="hidden md:block w-full">
<div className="p-0 flex justify-start">
<div className="w-full">
<div className="w-[900px] min-w-[900px] print:w-full bg-white print:shadow-none">

<div className="flex justify-between mb-3 no-print">
<Button variant="support" onClick={handleCancel}>목록으로</Button>
<div className="flex flex-nowrap gap-1">
<Button variant="actionPrimary" onClick={handleSubmitForm} className="flex items-center gap-1">
<Send size={16}/>전송
</Button>
<Button variant="action" onClick={handleLoad} className="flex items-center gap-1">
<FolderOpen size={16}/>문서 불러오기
</Button>
<Button variant="action" onClick={handlePrint} className="flex items-center gap-1">
<Printer size={16}/>인쇄/미리보기
</Button>
<Button variant="action" onClick={handleSaveToStore} className="flex items-center gap-1">
<Save size={16}/>저장
</Button>
</div>
</div>

<div ref={printRef}>
<div className="print-container">

<table className={`w-full border-collapse border ${BORDER_COLOR}`}>
<tbody>
<tr>
<td colSpan={4} className={`border ${BORDER_COLOR} ${TEXT_TITLE} py-3`}>
현장 위험성평가
</td>
</tr>

<tr>
<td colSpan={4} className={`border ${BORDER_COLOR} p-0`}>
<div className={`flex flex-col items-center justify-center ${TEXT_NOTICE} text-center leading-relaxed px-6 py-3`}>
<p className={`${TEXT_SUBTITLE} font-semibold mb-2`}>
상시 현장 위험성평가_내 작업장 안전분석(JSA)
</p>
<p>
<span className="underline">1) 작업허가서 작성 시 모든 작업자가 참여하여 현장 위험성평가 실시</span>
<span className="font-medium">※</span> (작업순서별 위험요인, 작업자 행동, 주변환경 등)
<br/>
<span className="underline">2) 최초 위험성평가는 별도로 작성하거나, 작업절차서 등 안전작업표준서를 이용하여 작성 가능</span>
<br/>
<span className="underline">3) 상시 위험성평가 결과에 반영되지 않는 위험요인 발생 시 즉시 작업을 중지하고, 조치 후 작업을 재개한다</span>
</p>
</div>
</td>
</tr>

<tr>
<td colSpan={4} className={`border-x ${BORDER_COLOR} p-0`}>
<table className="w-full border-separate border-spacing-0">
<tbody>
{INITIAL_QUESTIONS.map((item, i) => (
<tr key={i}>
<td className={`${i === 0 ? "" : `border-t ${BORDER_COLOR}`} pl-3 py-[6px] ${TEXT_BODY} w-[45%]`}>
{`${item.id}. ${item.question}`}
</td>
<td className={`${i === 0 ? "" : `border-t ${BORDER_COLOR}`} text-center py-[6px] w-[25%]`}>
<div className="flex justify-center items-center gap-4">
<label className={`flex items-center gap-1 ${TEXT_BODY}`}>
네
<Checkbox checked={formData.safetyChecks?.[`${item.key}_yes`] as boolean || false} onChange={() => updateSafetyCheck(`${item.key}_yes`, !(formData.safetyChecks?.[`${item.key}_yes`] as boolean || false))}/>
</label>
<label className={`flex items-center gap-1 ${TEXT_BODY}`}>
아니오
<Checkbox checked={formData.safetyChecks?.[`${item.key}_no`] as boolean || false} onChange={() => updateSafetyCheck(`${item.key}_no`, !(formData.safetyChecks?.[`${item.key}_no`] as boolean || false))}/>
</label>
</div>
</td>
<td className={`${i === 0 ? "" : `border-t ${BORDER_COLOR}`} px-2 py-[4px] w-[30%]`}>
<input value={formData.safetyChecks?.[`${item.key}_action`] as string || ""} onChange={e => updateSafetyCheck(`${item.key}_action`, e.target.value)} className={`w-full h-[28px] ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder="조치사항"/>
</td>
</tr>
))}
</tbody>
</table>
</td>
</tr>
</tbody>
</table>

<table className={`w-full border-collapse border mt-3 ${BORDER_COLOR}`}>
<thead>
<tr>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2`}>작업순서</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2`}>위험요인</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-0`} colSpan={3}>
<div className="flex flex-col w-full">
<div className={`border-b ${BORDER_COLOR} py-1`}>위험성</div>
<div className="flex divide-x divide-[#888888]">
{RISK_LEVELS.map((l, i) => (
<div key={i} className="flex-1 py-1">{l}</div>
))}
</div>
</div>
</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2`}>방호대책</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2`}>조치확인</th>
</tr>
</thead>
<tbody>
{riskRows.map(row => (
<tr key={row.id} className="align-top">
<td className={`border ${BORDER_COLOR} p-2 w-[15%]`}>
<div className="flex items-start gap-1">
{riskRows.length > 1 && (
<button onClick={() => removeRiskRow(row.id)} className="text-xs no-print mt-3">
<X size={14} className={ICON_COLOR}/>
</button>
)}
<textarea value={row.task} onChange={e => updateRiskRow(row.id, "task", e.target.value)} className={`flex-1 min-h-[48px] ${TEXT_BODY} resize-none`}/>
</div>
</td>
<td className={`border ${BORDER_COLOR} p-2 w-[25%]`}>
<textarea value={row.hazard} onChange={e => updateRiskRow(row.id, "hazard", e.target.value)} className={`w-full min-h-[48px] ${TEXT_BODY} resize-none`}/>
</td>
{RISK_LEVELS.map(level => (
<td key={level} className={`border ${BORDER_COLOR} w-[5%] align-middle text-center`}>
<div className="flex items-center justify-center h-full w-full">
<Checkbox checked={row.currentRisk === level} onChange={() => updateRiskRow(row.id, "currentRisk", row.currentRisk === level ? "" : level)}/>
</div>
</td>
))}
<td className={`border ${BORDER_COLOR} p-2 w-[25%]`}>
<textarea value={row.measure} onChange={e => updateRiskRow(row.id, "measure", e.target.value)} className={`w-full min-h-[48px] ${TEXT_BODY} resize-none`}/>
</td>
<td className={`border ${BORDER_COLOR} text-center align-middle w-[8%]`}>
<div className="flex items-center justify-center h-full">
<Checkbox checked={row.checked} onChange={() => updateRiskRow(row.id, "checked", !row.checked)}/>
</div>
</td>
</tr>
))}

<tr>
<td colSpan={7} className={`border ${BORDER_COLOR} p-2 text-center`}>
<button onClick={addRiskRow} disabled={riskRows.length >= 15} className={`text-xs no-print flex items-center gap-1 mx-auto ${riskRows.length >= 15 ? 'opacity-50 cursor-not-allowed' : ''}`}>
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</td>
</tr>

<tr>
<td colSpan={7} className={`border ${BORDER_COLOR} text-left px-4 py-2 ${TEXT_NOTICE}`}>
{NOTICE_TEXTS.riskEval}
</td>
</tr>
</tbody>
</table>

<table className={`w-full border-collapse border mt-2 ${BORDER_COLOR}`}>
<tbody>
<tr>
<td className={`border ${BORDER_COLOR} text-center ${TEXT_BODY} font-medium py-4 w-[28%] align-middle`}>
작업팀 서명란<br/>
<span className={`${TEXT_NOTICE} font-normal`}>(TBM, 작업방법 및 안전대책 공유)</span>
</td>
<td className={`border ${BORDER_COLOR} bg-white text-center ${TEXT_BODY} font-medium w-[6%] align-middle`}>
일<br/>자
</td>
<td className={`border ${BORDER_COLOR} text-center w-[16.5%] align-middle`}>
<input type="date" value={formData.safetyChecks?.sign_date as string || ""} onChange={e => updateSafetyCheck("sign_date", e.target.value)} className={`w-full text-center ${TEXT_BODY}`}/>
</td>
<td className={`border ${BORDER_COLOR} bg-white text-center ${TEXT_BODY} font-medium w-[8%] align-middle`}>
작업팀<br/>
<span className={`${TEXT_NOTICE} font-normal`}>(업체)</span>
</td>
<td className={`border ${BORDER_COLOR} text-center w-[13%] align-middle`}>
<input value={formData.teamName || ""} onChange={e => updateFormData({ teamName: e.target.value })} className={`w-full text-center ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder="업체명"/>
</td>
<td className={`border ${BORDER_COLOR} bg-white text-center ${TEXT_BODY} font-medium w-[6%] align-middle`}>
성<br/>명
</td>
<td className={`border ${BORDER_COLOR} text-center w-[16.5%] align-middle`}>
<div className="flex items-center justify-center h-[45px]">
{formData.teamMember ? (
<div className="flex flex-col items-center gap-1 w-full">
<div className="text-xs font-medium text-gray-900">{formData.teamMember.name}</div>
<div className="text-[10px] text-gray-500">{formData.teamMember.subject}</div>
<div className="text-[10px] text-gray-500">{formData.teamMember.rank}</div>
<button onClick={openTeamMemberSelect} className="text-[10px] text-blue-600 hover:underline">변경</button>
</div>
) : (
<button onClick={openTeamMemberSelect} className="text-xs text-blue-600 hover:underline">선택</button>
)}
</div>
</td>
</tr>
<tr>
<td colSpan={7} className={`border-t-0 border ${BORDER_COLOR} text-left px-4 py-2 ${TEXT_NOTICE} leading-relaxed`}>
<span className="font-medium">일일순회점검 결과</span>
<span className="font-normal">{NOTICE_TEXTS.inspection}</span>
</td>
</tr>
</tbody>
</table>

<table className={`w-full border-collapse border mt-2 ${BORDER_COLOR}`}>
<thead>
<tr>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 w-[15%]`}>시간</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 w-[20%]`}>소속 및 성명</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 w-[65%]`}>관찰/점검 내용</th>
</tr>
</thead>
<tbody>
{inspectionRows.map(row => (
<tr key={row.id}>
<td className={`border ${BORDER_COLOR} p-2 text-center align-middle`}>
<div className="flex items-center gap-1">
{inspectionRows.length > 1 && (
<button onClick={() => removeInspectionRow(row.id)} className="text-xs no-print">
<X size={14} className={ICON_COLOR}/>
</button>
)}
<input value={row.time} onChange={e => updateInspectionRow(row.id, "time", e.target.value)} className={`flex-1 text-center ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder="예: 9:30"/>
</div>
</td>
<td className={`border ${BORDER_COLOR} p-2 text-center align-middle`}>
<input value={row.person} onChange={e => updateInspectionRow(row.id, "person", e.target.value)} className={`w-full text-center ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder="소속 및 성명"/>
</td>
<td className={`border ${BORDER_COLOR} p-2 align-middle`}>
<textarea value={row.note} onChange={e => updateInspectionRow(row.id, "note", e.target.value)} className={`w-full min-h-[40px] ${TEXT_BODY} ${PLACEHOLDER_STYLE} resize-none`} placeholder="관찰/점검 내용"/>
</td>
</tr>
))}
<tr>
<td colSpan={3} className={`border ${BORDER_COLOR} p-2 text-center`}>
<button onClick={addInspectionRow} disabled={inspectionRows.length >= 10} className={`text-xs no-print flex items-center gap-1 mx-auto ${inspectionRows.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</td>
</tr>
</tbody>
</table>

{(() => {
const imageFiles = attachedFiles.filter(f => f.type?.startsWith('image/'))
const pdfFiles = attachedFiles.filter(f => f.type === 'application/pdf')
const imageGroups: PTWFile[][] = []
for (let i = 0; i < imageFiles.length; i += 2) {
imageGroups.push(imageFiles.slice(i, i + 2))
}
return (
<>
{imageGroups.map((group, groupIndex) => (
<div key={`img-group-${groupIndex}`} className="page-break" style={{ pageBreakBefore: 'always', pageBreakAfter: 'auto', pageBreakInside: 'avoid' }}>
<div style={{ textAlign: 'center', paddingTop: '6px', paddingBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
첨부 이미지 페이지 {groupIndex + 1}
</div>
<div style={{ width: '100%', border: '1px solid #d1d5db', backgroundColor: '#ffffff', height: '940px', display: 'flex', flexDirection: 'column' }}>
{group.map((file, fileIndex) => (
<div
key={fileIndex}
style={{
height: '470px',
width: '100%',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
borderBottom: fileIndex === 0 && group.length === 2 ? '1px solid #d1d5db' : 'none',
padding: '12px',
boxSizing: 'border-box',
overflow: 'hidden'
}}
>
{file.url && (
<img
src={file.url}
alt={file.name}
style={{
maxWidth: '100%',
maxHeight: '100%',
width: 'auto',
height: 'auto',
objectFit: 'contain',
display: 'block'
}}
/>
)}
</div>
))}
{group.length === 1 && (
<div style={{ height: '470px', width: '100%', backgroundColor: '#f9fafb', borderTop: '1px solid #d1d5db' }} />
)}
</div>
</div>
))}
{pdfFiles.map((file, index) => (
<div key={`pdf-${index}`} className="page-break" style={{ pageBreakBefore: 'always', pageBreakAfter: 'auto' }}>
<div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
첨부 PDF 페이지 {index + 1}
</div>
<div style={{ width: '100%', border: '1px solid #d1d5db', backgroundColor: '#ffffff', height: '980px' }}>
{file.url && <iframe src={file.url} title={file.name} style={{ width: '100%', height: '100%', border: 'none' }} />}
</div>
</div>
))}
</>
)
})()}

</div>
</div>
</div>
</div>
</div>
</div>

<PTWListModal
isOpen={isListModalOpen}
onClose={() => setIsListModalOpen(false)}
onSelect={handleSelectPTW}
documentType="현장 위험성평가(JSA)"
/>
<UserSelectModal
isOpen={userSelectModalOpen}
onClose={() => setUserSelectModalOpen(false)}
onSelect={handleUserSelect}
title="작업팀 성명 선택"
/>
</>
)
}
