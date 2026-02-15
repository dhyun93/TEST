import{usePTWStore}from"@/stores/ptwStore"
import{useNavigate}from"react-router-dom"
import React, { useState, useCallback, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Printer, Save, Send, FolderOpen, Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import Checkbox from "@/components/common/base/Checkbox"
import Button from "@/components/common/base/Button"
import PTWListModal from "../../../components/dialog/PTWListDialog"
import SignaturePadDialog from "@/components/dialog/SignaturePadDialog"
import UserSelectModal, { SelectedUser } from "@/components/dialog/UserSelectModal"
import { useLoadingStore } from "@/stores/loadingStore"
import { PTWFile } from "../FilePanel/FilePanel"

type PTWWorkPermitProps = {
  ptwId?: string
  attachedFiles?: PTWFile[]
}

interface SafetyRequirement {
id: number
text: string
hasInput: boolean
}

interface Reviewer {
  user_id: number
  name: string
  position: string
  rank: string
  phone: string
  subject: string
}

interface PTWFormData {
workplace?: string
applicationDate?: string
workTypes?: string[]
requestDept?: string
workerCount?: number
workDate?: string
applicantName?: string
applicantSignature?: string
workLocation?: string
workType?: string
otherSafety?: string
safetyChecks?: Record<string, string | boolean>
approvers?: Record<string, string>
reviewers?: Record<string, Reviewer>
supervisor?: Reviewer
}

const BORDER_COLOR = "border-[#888888]"
const HEADER_TEXT_STYLE = "text-[#595F68] text-[15px] font-medium"
const BODY_TEXT_STYLE = "text-[#333A3F] text-[15px] font-normal"
const HEADER_BG_STYLE = `bg-[#f3f3f3] ${HEADER_TEXT_STYLE}`
const LABEL_WIDTH = "w-[11%]"
const WORKPLACE_NAME = "(주)에스피에스앤아이 당진 슬래그공장"
const PLACEHOLDER_STYLE = "placeholder:text-[13px] placeholder:text-gray-500"
const ICON_COLOR = "text-gray-500"

const APPROVAL_STEPS = [
{ title: "검토", subtitle: "(생산반장)", key: "sig_review1" },
{ title: "검토", subtitle: "(생산팀장)", key: "sig_review2" },
{ title: "합의", subtitle: "(안전담당자)", key: "sig_agreement" },
{ title: "승인", subtitle: "(관리책임자)", key: "sig_approval" },
]

const WORK_TYPES = ["화기작업", "중장비", "LOTOTO", "고소작업", "기타 위험작업"]

const FINAL_CHECK_QUESTIONS = [
"1. 작업을 위해 철거된 방호울/개구부, 정리정돈 상태는 원상복귀 되었는가?",
"2. 작업 완료 후 작업장소 주변 및 하부에 화재징후는 없는가?",
"3. 작업 중 위험성평가에 없는 새로운 위험요소가 발견되었는가?",
"4. 작업 중에 안전사고, 아차사고 또는 근로자 건강 이벤트가 발생했습니까?",
]

const MOBILE_TABS = [
{ id: "basic", label: "기본정보" },
{ id: "safety", label: "안전조치" },
{ id: "approval", label: "결재" },
{ id: "final", label: "최종확인" },
]

export default function PTWWorkPermit({ ptwId, attachedFiles = [] }: PTWWorkPermitProps): React.ReactElement {
const [formData, setFormData] = useState<PTWFormData>({ workplace: WORKPLACE_NAME, applicantName: "홍길동" })
const [isListModalOpen, setIsListModalOpen] = useState(false)
const [mobileTab, setMobileTab] = useState("basic")
const [safetyRequirements, setSafetyRequirements] = useState({
prework: [
{ id: 1, text: "개인보호구 : 4대 보호구 외", hasInput: true },
{ id: 2, text: "공도구 상태 안전점검", hasInput: false },
{ id: 3, text: "작업자 교육결과 확인 (특별교육)", hasInput: false }
],
fire: [
{ id: 1, text: "화재감시자 지정", hasInput: true },
{ id: 2, text: "화기작업 주변 인화성 물질 확인", hasInput: false },
{ id: 3, text: "소화기 비치", hasInput: false },
{ id: 4, text: "불티비산 방지망 설치", hasInput: false }
],
heavy: [
{ id: 1, text: "유자격자 운전 (자격증, 보험증, 점검증 등)", hasInput: false },
{ id: 2, text: "작업지휘자 및 신호수 운영", hasInput: false },
{ id: 3, text: "작업계획서 작성 및 안전장치 확인", hasInput: false }
],
lototo: [
{ id: 1, text: "작업 전 설비 정지상태 확인", hasInput: false },
{ id: 2, text: "LOTO 체결상태 확인", hasInput: false }
],
height: [
{ id: 1, text: "안전모, 안전화, 안전대 착용 확인", hasInput: false },
{ id: 2, text: "추락 위험구간 안전대 걸이시설 여부 확인", hasInput: false }
]
})

const printRef = useRef<HTMLDivElement>(null)
const navigate=useNavigate()
const{workPermits,addWorkPermit}=usePTWStore()
const { setLoading } = useLoadingStore()

const handlePrint = useReactToPrint({
contentRef: printRef,
documentTitle: "위험작업허가서",
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

const updateFormData = useCallback((updates: Partial<PTWFormData>): void => {
setFormData((prev: PTWFormData) => ({ ...prev, ...updates }))
}, [])

const updateSafetyCheck = useCallback((key: string, value: string | boolean): void => {
setFormData((prev: PTWFormData) => ({
...prev,
safetyChecks: { ...(prev.safetyChecks || {}), [key]: value },
}))
}, [])

const updateApprover = useCallback((key: string, dataUrl: string): void => {
setFormData((prev: PTWFormData) => ({
...prev,
approvers: { ...(prev.approvers || {}), [key]: dataUrl },
}))
}, [])

const [mobileApprovalOpen, setMobileApprovalOpen] = useState(false)
const [signaturePadOpen, setSignaturePadOpen] = useState(false)
const [signatureTarget, setSignatureTarget] = useState<string | null>(null)
const [userSelectModalOpen, setUserSelectModalOpen] = useState(false)
const [selectedApprovalKey, setSelectedApprovalKey] = useState<string | null>(null)

const addRequirementRow = useCallback((category: keyof typeof safetyRequirements) => {
setSafetyRequirements(prev => {
if (prev[category].length >= 10) return prev
return {
...prev,
[category]: [...prev[category], { id: Date.now(), text: "", hasInput: false }]
}
})
}, [])

const removeRequirementRow = useCallback((category: keyof typeof safetyRequirements, id: number) => {
setSafetyRequirements(prev => ({
...prev,
[category]: prev[category].filter(item => item.id !== id)
}))
}, [])

const updateRequirementRow = useCallback((category: keyof typeof safetyRequirements, id: number, text: string) => {
setSafetyRequirements(prev => ({
...prev,
[category]: prev[category].map(item => item.id === id ? { ...item, text } : item)
}))
}, [])

const handleLoadMySignature = async () => {
const signatureImage = "/images/sample-signature.png"
updateFormData({ applicantSignature: signatureImage })
}

const openSignaturePad = (target: string) => {
// 모든 서명(검토/합의/승인/관리감독자)은 조직도에서 선택
setSelectedApprovalKey(target)
setUserSelectModalOpen(true)
}

const handleSignatureSave = (dataUrl: string) => {
if (!signatureTarget) return
if (signatureTarget === "supervisor") {
updateFormData({ supervisor: dataUrl })
} else {
updateApprover(signatureTarget, dataUrl)
}
setSignaturePadOpen(false)
setSignatureTarget(null)
}

const handleUserSelect = (user: SelectedUser) => {
if (!selectedApprovalKey) return

// 관리감독자는 별도 필드에 저장
if (selectedApprovalKey === "supervisor") {
setFormData((prev: PTWFormData) => ({
...prev,
supervisor: {
user_id: user.id,
name: user.name,
position: user.position,
rank: user.rank,
phone: user.phone,
subject: user.subject,
},
}))
} else {
// 검토/합의/승인은 reviewers에 저장
setFormData((prev: PTWFormData) => ({
...prev,
reviewers: {
...(prev.reviewers || {}),
[selectedApprovalKey]: {
user_id: user.id,
name: user.name,
position: user.position,
rank: user.rank,
phone: user.phone,
subject: user.subject,
},
},
}))
}

setUserSelectModalOpen(false)
setSelectedApprovalKey(null)
}

const handleSelectPTW = (data: any) => {
  setFormData(prev => ({
    ...prev,
    ...data,
    safetyChecks: data.safetyChecks || {},
    approvers: data.approvers || {},
    supervisor: data.supervisor
  }))
  setIsListModalOpen(false)
}

const handleSaveToStore = async () => {
if(!formData.workType||!formData.workDate){
alert("작업명과 작업일을 입력해주세요.")
return
}
if(!window.confirm("저장하시겠습니까?")) return

setLoading(true)
try {
await new Promise(resolve => setTimeout(resolve, 300))
const newId=workPermits.length>0?Math.max(...workPermits.map(p=>p.id))+1:1
const newPermit={
id:newId,
workName:formData.workType||"",
workDate:formData.workDate||"",
workLocation:formData.workLocation||"",
workPersonnel:`${formData.workerCount||0}명`,
workType:formData.workTypes?.join(", ")||"",
applicant:formData.applicantName||"",
applicationDate:formData.applicationDate||"",
signatureStatus:{text:"0/4",color:"red" as "red"},
sitePhotos:[],
fileAttach:false
}
addWorkPermit(newPermit)
alert("저장되었습니다.")
navigate("/ptw/list/work-permit")
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

return (
<>{/* Mobile */}
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
<div>
<label className="text-[10px] text-gray-500">사업장</label>
<input value={WORKPLACE_NAME} readOnly className="w-full h-7 text-xs bg-gray-50"/>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">신청일자</label>
<input type="date" value={formData.applicationDate || ""} onChange={e => updateFormData({ applicationDate: e.target.value })} className="w-full h-7 text-xs"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업일</label>
<input type="datetime-local" value={formData.workDate || ""} onChange={e => updateFormData({ workDate: e.target.value })} className="w-full h-7 text-xs"/>
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">작업요청부서</label>
<input value={formData.requestDept || ""} onChange={e => updateFormData({ requestDept: e.target.value })} className="w-full h-7 text-xs" placeholder="부서명"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업인원</label>
<div className="flex items-center gap-1">
<input type="number" value={formData.workerCount || ""} onChange={e => updateFormData({ workerCount: e.target.value ? Number(e.target.value) : undefined })} className="w-full h-7 text-xs"/>
<span className="text-xs shrink-0">명</span>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">작업장소</label>
<input value={formData.workLocation || ""} onChange={e => updateFormData({ workLocation: e.target.value })} className="w-full h-7 text-xs" placeholder="작업장소"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업명</label>
<input value={formData.workType || ""} onChange={e => updateFormData({ workType: e.target.value })} className="w-full h-7 text-xs" placeholder="작업명"/>
</div>
</div>
<div>
<label className="text-[10px] text-gray-500">신청자</label>
<div className="flex items-center gap-2">
<input value={formData.applicantName || ""} onChange={e => updateFormData({ applicantName: e.target.value })} className="flex-1 h-7 text-xs" placeholder="이름"/>
{formData.applicantSignature ? (
<button onClick={handleLoadMySignature} className="border border-gray-300 rounded px-1">
<img src={formData.applicantSignature} alt="서명" className="h-6"/>
</button>
) : (
<Button variant="action" onClick={handleLoadMySignature} className="text-[10px] px-2 py-1">서명</Button>
)}
</div>
</div>
<div>
<label className="text-[10px] text-gray-500">작업구분</label>
<div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
{WORK_TYPES.map(type => (
<label key={type} className="flex items-center gap-1 text-xs">
<Checkbox checked={(formData.workTypes || []).includes(type)} onChange={() => {
const list = formData.workTypes || []
const isChecked = list.includes(type)
updateFormData({ workTypes: !isChecked ? [...list, type] : list.filter(t => t !== type) })
}}/>
<span>{type}</span>
</label>
))}
</div>
{(formData.workTypes || []).includes("기타 위험작업") && (
<input value={formData.safetyChecks?.etcWork as string || ""} onChange={e => updateSafetyCheck("etcWork", e.target.value)} className="w-full h-7 text-xs mt-1" placeholder="기타 작업 입력"/>
)}
</div>
</div>

{/* 안전조치 요구사항 */}
{[
{ key: "prework" as const, title: "작업 전 안전조치 (공통)" },
{ key: "fire" as const, title: "화기작업" },
{ key: "heavy" as const, title: "중장비 작업" },
{ key: "lototo" as const, title: "LOTOTO" },
{ key: "height" as const, title: "고소작업 (2M 이상)" },
].map(section => (
<div key={section.key} className="border border-gray-300 rounded p-2">
<div className="flex items-center justify-between mb-1">
<p className="text-xs font-semibold text-gray-700">■ {section.title}</p>
<button onClick={() => addRequirementRow(section.key)} className="text-[10px] text-blue-600 flex items-center"><Plus size={10}/>추가</button>
</div>
{safetyRequirements[section.key].map((item, idx) => (
<div key={item.id} className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0">
<div className="flex-1 min-w-0">
{item.hasInput && idx === 0 ? (
<div className="flex items-center gap-1">
<span className="text-[10px] whitespace-nowrap shrink-0">{section.key === "prework" ? "4대 보호구 외" : "화재감시자"}</span>
<input value={formData.safetyChecks?.[section.key === "prework" ? "prework_ppe_extra" : "fire_monitor_name"] as string || ""} onChange={e => updateSafetyCheck(section.key === "prework" ? "prework_ppe_extra" : "fire_monitor_name", e.target.value)} className="flex-1 h-6 text-xs min-w-0"/>
</div>
) : (
<input value={item.text} onChange={e => updateRequirementRow(section.key, item.id, e.target.value)} className="w-full h-6 text-xs"/>
)}
</div>
<div className="flex items-center gap-2 shrink-0">
<div className="flex items-center gap-1"><span className="text-[8px] text-gray-400">1</span><Checkbox checked={!!formData.safetyChecks?.[`${section.key}_${idx}_1`]} onChange={() => updateSafetyCheck(`${section.key}_${idx}_1`, !formData.safetyChecks?.[`${section.key}_${idx}_1`])}/></div>
<div className="flex items-center gap-1"><span className="text-[8px] text-gray-400">2</span><Checkbox checked={!!formData.safetyChecks?.[`${section.key}_${idx}_2`]} onChange={() => updateSafetyCheck(`${section.key}_${idx}_2`, !formData.safetyChecks?.[`${section.key}_${idx}_2`])}/></div>
{safetyRequirements[section.key].length > 1 && <button onClick={() => removeRequirementRow(section.key, item.id)}><X size={12} className="text-gray-400"/></button>}
</div>
</div>
))}
</div>
))}

{/* 기타 안전조치 */}
<div className="border border-gray-300 rounded p-2">
<p className="text-xs font-semibold text-gray-700 mb-1">■ 기타 안전조치 사항</p>
<textarea value={formData.otherSafety || ""} onChange={e => updateFormData({ otherSafety: e.target.value })} className="w-full h-16 text-xs" placeholder="기타 안전조치 사항"/>
<div className="flex items-center gap-4 mt-1">
<label className="flex items-center gap-1 text-[10px]"><Checkbox checked={!!formData.safetyChecks?.other_check1} onChange={() => updateSafetyCheck("other_check1", !formData.safetyChecks?.other_check1)}/>확인1</label>
<label className="flex items-center gap-1 text-[10px]"><Checkbox checked={!!formData.safetyChecks?.other_check2} onChange={() => updateSafetyCheck("other_check2", !formData.safetyChecks?.other_check2)}/>확인2</label>
</div>
</div>

{/* 최종확인 */}
<div className="border border-gray-300 rounded p-2">
<p className="text-xs font-semibold text-gray-700 mb-2">작업 완료 시 최종 확인</p>
{FINAL_CHECK_QUESTIONS.map((q, i) => (
<div key={i} className="flex items-start justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
<p className="text-[10px] text-gray-700 flex-1">{q}</p>
<div className="flex items-center gap-3 shrink-0">
<label className="flex items-center gap-1 text-[10px]"><Checkbox checked={!!formData.safetyChecks?.[`final_check_${i+1}_y`]} onChange={() => updateSafetyCheck(`final_check_${i+1}_y`, !formData.safetyChecks?.[`final_check_${i+1}_y`])}/>Y</label>
<label className="flex items-center gap-1 text-[10px]"><Checkbox checked={!!formData.safetyChecks?.[`final_check_${i+1}_n`]} onChange={() => updateSafetyCheck(`final_check_${i+1}_n`, !formData.safetyChecks?.[`final_check_${i+1}_n`])}/>N</label>
</div>
</div>
))}
<div className="mt-2">
<label className="text-[10px] text-gray-500">조치/의견</label>
<textarea value={formData.safetyChecks?.final_comment as string || ""} onChange={e => updateSafetyCheck("final_comment", e.target.value)} className="w-full h-16 text-xs" placeholder="내용 입력"/>
</div>
</div>

{/* 작업종료 */}
<div className="border border-gray-300 rounded p-2">
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">작업 종료 일시</label>
<input type="datetime-local" value={formData.safetyChecks?.work_end_time as string || ""} onChange={e => updateSafetyCheck("work_end_time", e.target.value)} className="w-full h-7 text-xs"/>
</div>
<div>
<label className="text-[10px] text-gray-500">관리감독자</label>
<div className="flex flex-col items-center mt-1 p-2 border border-gray-200 rounded">
{formData.supervisor ? (
<div className="flex flex-col items-center gap-1 w-full">
<div className="text-xs font-medium text-gray-900">{formData.supervisor.name}</div>
<div className="text-[10px] text-gray-500">{formData.supervisor.subject}</div>
<div className="text-[10px] text-gray-500">{formData.supervisor.rank}</div>
<button onClick={() => openSignaturePad("supervisor")} className="text-[10px] text-blue-600 hover:underline mt-1">변경</button>
</div>
) : (
<button onClick={() => openSignaturePad("supervisor")} className="text-xs text-blue-600 hover:underline">선택</button>
)}
</div>
</div>
</div>
</div>
</div>

{/* 결재선 바텀시트 */}
{mobileApprovalOpen && (
<div className="fixed inset-0 z-50 md:hidden">
<div className="absolute inset-0 bg-black/40" onClick={() => setMobileApprovalOpen(false)}/>
<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[70vh] overflow-y-auto">
<div className="flex justify-between items-center mb-3">
<span className="font-semibold text-sm">결재선 지정</span>
<button onClick={() => setMobileApprovalOpen(false)}><X size={18} className="text-gray-500"/></button>
</div>
<div className="space-y-3">
{APPROVAL_STEPS.map(step => {
const reviewer = formData.reviewers?.[step.key]
return (
<div key={step.key} className="flex items-center justify-between py-2 border-b border-gray-100">
<div className="flex-1 min-w-0">
<p className="text-sm font-medium">{step.title}</p>
<p className="text-xs text-gray-500">{step.subtitle}</p>
{reviewer && (
<div className="mt-1">
<p className="text-xs font-medium text-gray-900">{reviewer.name}</p>
<p className="text-[10px] text-gray-500">{reviewer.subject} · {reviewer.rank}</p>
</div>
)}
</div>
<div className="shrink-0">
{reviewer ? (
<button onClick={() => openSignaturePad(step.key)} className="text-xs text-blue-600 hover:underline">변경</button>
) : (
<button onClick={() => openSignaturePad(step.key)} className="text-xs text-blue-600 hover:underline">서명</button>
)}
</div>
</div>
)
})}
</div>
<Button variant="actionPrimary" onClick={() => setMobileApprovalOpen(false)} className="w-full mt-4 text-sm">확인</Button>
</div>
</div>
)}

<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex gap-2 md:hidden">
<Button variant="action" onClick={() => setMobileApprovalOpen(true)} className="flex-1 flex items-center justify-center gap-1 text-xs">
결재선 지정 ({Object.keys(formData.approvers || {}).length}/4)
</Button>
<Button variant="actionPrimary" onClick={handleSubmitForm} className="flex-1 flex items-center justify-center gap-1 text-xs"><Send size={12}/>전송</Button>
</div>
</div>
{/* Desktop View */}
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

<table className={`w-full border-collapse border ${BORDER_COLOR} ${BODY_TEXT_STYLE}`}>
<tbody>
<tr>
<td colSpan={4} className={`border ${BORDER_COLOR} text-center font-semibold text-[18px] py-3`}>위험작업허가서</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>사업장</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<input value={WORKPLACE_NAME} readOnly className="w-full bg-[#F9FAFB] text-gray-600 cursor-default"/>
</td>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>신청일자</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<input type="date" value={formData.applicationDate || ""} onChange={e => updateFormData({ applicationDate: e.target.value })} className="w-full"/>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>작업요청부서</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<input value={formData.requestDept || ""} onChange={e => updateFormData({ requestDept: e.target.value })} className={`w-full ${PLACEHOLDER_STYLE}`} placeholder="작업요청부서를 입력하세요"/>
</td>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>작업인원</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<div className="flex items-center gap-2">
<input type="number" value={formData.workerCount || ""} onChange={e => updateFormData({ workerCount: e.target.value ? Number(e.target.value) : undefined })} className="w-30"/>
<span>명</span>
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>작업일</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<input type="datetime-local" value={formData.workDate || ""} onChange={e => updateFormData({ workDate: e.target.value })} className="w-full"/>
</td>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH}`}>신청자</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%]`}>
<div className="flex items-center gap-2">
<input value={formData.applicantName || ""} onChange={e => updateFormData({ applicantName: e.target.value })} placeholder="이름" className={`w-32 ${PLACEHOLDER_STYLE}`}/>
{formData.applicantSignature ? (
<button onClick={handleLoadMySignature} className="border border-gray-300 rounded px-2 py-1 hover:border-gray-400 transition">
<img src={formData.applicantSignature} alt="신청자 서명" className="h-8"/>
</button>
) : (
<Button variant="action" onClick={handleLoadMySignature}>서명 불러오기</Button>
)}
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center ${LABEL_WIDTH} align-middle`}>작업장소</td>
<td className={`border ${BORDER_COLOR} p-2 w-[39%] align-middle`}>
<input value={formData.workLocation || ""} onChange={e => updateFormData({ workLocation: e.target.value })} className={`w-full h-8 ${PLACEHOLDER_STYLE}`} placeholder="작업장소를 입력하세요"/>
</td>
<td rowSpan={2} colSpan={2} className={`border ${BORDER_COLOR} p-0 w-[50%] align-top`}>
<div className="flex flex-col h-full">
<div className={`relative grid grid-cols-4 border-b ${BORDER_COLOR} h-[52px] items-center`}>
{APPROVAL_STEPS.map((item, i) => (
<div key={i} className="relative flex flex-col items-center justify-center py-1 h-full">
<span className={HEADER_TEXT_STYLE}>{item.title}</span>
<span className="text-[12px] font-normal text-gray-500 leading-tight">{item.subtitle}</span>
</div>
))}
{[1, 2, 3].map(i => (
<div key={`divider-top-${i}`} className={`absolute top-0 bottom-0 border-l ${BORDER_COLOR}`} style={{ left: `${(100 / 4) * i}%` }}/>
))}
</div>

<div className="relative grid grid-cols-4">
{APPROVAL_STEPS.map((item, i) => {
const reviewer = formData.reviewers?.[item.key]
return (
<div key={i} className="relative flex flex-col items-center justify-center bg-white py-2 h-full min-h-[80px] px-1">
{reviewer ? (
<div className="flex flex-col items-center gap-1 w-full">
<div className="text-xs font-medium text-gray-900 truncate w-full text-center">{reviewer.name}</div>
<div className="text-[10px] text-gray-500 truncate w-full text-center">{reviewer.subject}</div>
<div className="text-[10px] text-gray-500 truncate w-full text-center">{reviewer.rank}</div>
<button onClick={() => openSignaturePad(item.key)} className="text-[10px] text-blue-600 hover:underline mt-1">변경</button>
</div>
) : (
<button onClick={() => openSignaturePad(item.key)} className="text-xs text-blue-600 hover:underline">서명</button>
)}
</div>
)
})}
{[1, 2, 3].map(i => (
<div key={`divider-bottom-${i}`} className={`absolute top-0 bottom-0 border-l ${BORDER_COLOR}`} style={{ left: `${(100 / 4) * i}%` }}/>
))}
</div>
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center align-middle ${LABEL_WIDTH}`}>작업명</td>
<td className={`border ${BORDER_COLOR} p-2 align-middle w-[39%]`}>
<input value={formData.workType || ""} onChange={e => updateFormData({ workType: e.target.value })} className={`w-full h-8 ${PLACEHOLDER_STYLE}`} placeholder="작업명을 입력하세요"/>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} text-center align-middle ${LABEL_WIDTH}`}>작업구분</td>
<td colSpan={3} className={`border ${BORDER_COLOR} p-0`}>
<div className={`relative grid grid-cols-5 border-b ${BORDER_COLOR}`}>
{WORK_TYPES.map(label => (
<div key={label} className={`flex items-center justify-center text-[14px] font-medium text-center py-[8px] ${HEADER_BG_STYLE}`}>{label}</div>
))}
{[1, 2, 3, 4].map(i => (
<div key={`divider-top-${i}`} className={`absolute top-0 bottom-0 border-l ${BORDER_COLOR}`} style={{ left: `${(100 / 5) * i}%` }}/>
))}
</div>

<div className="relative grid grid-cols-5 h-[40px]">
{WORK_TYPES.map(type => (
<div key={type} className="flex items-center justify-center">
{type === "기타 위험작업" ? (
<div className="flex items-center gap-1">
<Checkbox checked={(formData.workTypes || []).includes(type)} onChange={() => {
const list = formData.workTypes || []
const isChecked = list.includes(type)
updateFormData({ workTypes: !isChecked ? [...list, type] : list.filter(t => t !== type) })
}}/>
<input value={formData.safetyChecks?.etcWork as string || ""} onChange={e => updateSafetyCheck("etcWork", e.target.value)} className="w-24 h-7"/>
</div>
) : (
<Checkbox checked={(formData.workTypes || []).includes(type)} onChange={() => {
const list = formData.workTypes || []
const isChecked = list.includes(type)
updateFormData({ workTypes: !isChecked ? [...list, type] : list.filter(t => t !== type) })
}}/>
)}
</div>
))}
{[1, 2, 3, 4].map(i => (
<div key={`divider-bottom-${i}`} className={`absolute top-0 bottom-0 border-l ${BORDER_COLOR}`} style={{ left: `${(100 / 5) * i}%` }}/>
))}
</div>

</td>
</tr>
</tbody>
</table>

<table className={`w-full border-collapse border ${BORDER_COLOR} mt-3 ${BODY_TEXT_STYLE}`}>
<tbody>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center w-[38%] align-middle relative`}>
<div className="font-medium">안전조치 요구사항</div>
<div className="text-[11px] text-gray-600 mt-1 leading-tight">1: 허가서 신청 시 작업팀 안전사항 Check 2: 관리감독자 현장확인 Check</div>
</td>

<td colSpan={2} className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-0 text-center w-[12%]`}>
<div className="border-b border-gray-300 w-full flex items-center justify-center py-[5px]">확인</div>
<div className="grid grid-cols-2">
{["1", "2"].map(num => (
<div key={num} className={`border-t ${BORDER_COLOR} flex items-center justify-center py-1 text-[14px] font-medium ${num === "1" ? `border-r ${BORDER_COLOR}` : ""}`}>{num}</div>
))}
</div>
</td>

<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 text-center w-[38%] align-middle`}>안전조치 요구사항</td>
<td colSpan={2} className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-0 text-center w-[12%]`}>
<div className="border-b border-gray-300 w-full flex items-center justify-center py-[5px]">확인</div>
<div className="grid grid-cols-2">
{["1", "2"].map(num => (
<div key={num} className={`border-t ${BORDER_COLOR} flex items-center justify-center py-1 text-[14px] font-medium ${num === "1" ? `border-r ${BORDER_COLOR}` : ""}`}>{num}</div>
))}
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>
<div className="flex items-center justify-between">
<span>■ 작업 전 안전조치 (공통)</span>
<button onClick={() => addRequirementRow("prework")} className="text-xs no-print flex items-center gap-1">
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</div>
</td>

<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>
<div className="flex items-center justify-between">
<span>■ 화기작업</span>
<button onClick={() => addRequirementRow("fire")} className="text-xs no-print flex items-center gap-1">
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 text-sm`}>
<div className="space-y-1">
{safetyRequirements.prework.map((item, idx) => (
<div key={item.id} className="flex items-center gap-1">
<span>-</span>

{item.hasInput && idx === 0 ? (
<>
개인보호구 : 4대 보호구 외 (
<input value={formData.safetyChecks?.prework_ppe_extra as string || ""} onChange={e => updateSafetyCheck("prework_ppe_extra", e.target.value)} className="inline-block w-24 h-6 px-1 text-xs"/>)
</>
) : (
<input value={item.text} onChange={e => updateRequirementRow("prework", item.id, e.target.value)} className="inline-block flex-1 h-6 px-1 text-xs"/>
)}

{safetyRequirements.prework.length > 1 && (
<button onClick={() => removeRequirementRow("prework", item.id)} className="text-xs no-print ml-1">
<X size={14} className={ICON_COLOR}/>
</button>
)}
</div>
))}
</div>
</td>

{[1, 2].map(num => (
<td key={`pre-${num}`} className={`border ${BORDER_COLOR} p-2`}>
<div className="flex flex-col items-center space-y-1">
{safetyRequirements.prework.map((item, idx) => (
<Checkbox key={`${item.id}-${num}`} checked={!!formData.safetyChecks?.[`prework_${idx}_${num}`]} onChange={() => updateSafetyCheck(`prework_${idx}_${num}`, !formData.safetyChecks?.[`prework_${idx}_${num}`])}/>
))}
</div>
</td>
))}

<td className={`border ${BORDER_COLOR} p-2 text-sm`}>
<div className="space-y-1">
{safetyRequirements.fire.map((item, idx) => (
<div key={item.id} className="flex items-center gap-1">
<span>-</span>

{item.hasInput && idx === 0 ? (
<>
화재감시자 지정 (
<input value={formData.safetyChecks?.fire_monitor_name as string || ""} onChange={e => updateSafetyCheck("fire_monitor_name", e.target.value)} className="inline-block w-24 h-6 px-1 text-xs"/>)
</>
) : (
<input value={item.text} onChange={e => updateRequirementRow("fire", item.id, e.target.value)} className="inline-block flex-1 h-6 px-1 text-xs"/>
)}

{safetyRequirements.fire.length > 1 && (
<button onClick={() => removeRequirementRow("fire", item.id)} className="text-xs no-print ml-1">
<X size={14} className={ICON_COLOR}/>
</button>
)}
</div>
))}
</div>
</td>

{[1, 2].map(num => (
<td key={`fire-${num}`} className={`border ${BORDER_COLOR} p-2`}>
<div className="flex flex-col items-center space-y-1">
{safetyRequirements.fire.map((item, idx) => (
<Checkbox key={`${item.id}-${num}`} checked={!!formData.safetyChecks?.[`fire_${idx}_${num}`]} onChange={() => updateSafetyCheck(`fire_${idx}_${num}`, !formData.safetyChecks?.[`fire_${idx}_${num}`])}/>
))}
</div>
</td>
))}
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>
<div className="flex items-center justify-between">
<span>■ 중장비 작업 (이동식 크레인, 고소작업차 등)</span>
<button onClick={() => addRequirementRow("heavy")} className="text-xs no-print flex items-center gap-1">
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</div>
</td>

<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>
<div className="flex items-center justify-between">
<span>■ LOTOTO</span>
<button onClick={() => addRequirementRow("lototo")} className="text-xs no-print flex items-center gap-1">
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</div>
</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 text-sm`}>
<div className="space-y-1">
{safetyRequirements.heavy.map(item => (
<div key={item.id} className="flex items-center gap-1">
<span>-</span>
<input value={item.text} onChange={e => updateRequirementRow("heavy", item.id, e.target.value)} className="inline-block flex-1 h-6 px-1 text-xs"/>
{safetyRequirements.heavy.length > 1 && (
<button onClick={() => removeRequirementRow("heavy", item.id)} className="text-xs no-print ml-1">
<X size={14} className={ICON_COLOR}/>
</button>
)}
</div>
))}
</div>
</td>

{[1, 2].map(num => (
<td key={`heavy-${num}`} className={`border ${BORDER_COLOR} p-2`}>
<div className="flex flex-col items-center space-y-1">
{safetyRequirements.heavy.map((item, idx) => (
<Checkbox key={`${item.id}-${num}`} checked={!!formData.safetyChecks?.[`heavy_${idx}_${num}`]} onChange={() => updateSafetyCheck(`heavy_${idx}_${num}`, !formData.safetyChecks?.[`heavy_${idx}_${num}`])}/>
))}
</div>
</td>
))}

<td className={`border ${BORDER_COLOR} p-2 text-sm`}>
<div className="space-y-1">
{safetyRequirements.lototo.map(item => (
<div key={item.id} className="flex items-center gap-1">
<span>-</span>
<input value={item.text} onChange={e => updateRequirementRow("lototo", item.id, e.target.value)} className="inline-block flex-1 h-6 px-1 text-xs"/>
{safetyRequirements.lototo.length > 1 && (
<button onClick={() => removeRequirementRow("lototo", item.id)} className="text-xs no-print ml-1">
<X size={14} className={ICON_COLOR}/>
</button>
)}
</div>
))}
</div>
</td>

{[1, 2].map(num => (
<td key={`loto-${num}`} className={`border ${BORDER_COLOR} p-2`}>
<div className="flex flex-col items-center space-y-1">
{safetyRequirements.lototo.map((item, idx) => (
<Checkbox key={`${item.id}-${num}`} checked={!!formData.safetyChecks?.[`lototo_${idx}_${num}`]} onChange={() => updateSafetyCheck(`lototo_${idx}_${num}`, !formData.safetyChecks?.[`lototo_${idx}_${num}`])}/>
))}
</div>
</td>
))}
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>
<div className="flex items-center justify-between">
<span>■ 고소작업 (높이 2M 이상)</span>
<button onClick={() => addRequirementRow("height")} className="text-xs no-print flex items-center gap-1">
<Plus size={14} className={ICON_COLOR}/>추가
</button>
</div>
</td>

<td className={`border ${BORDER_COLOR} p-2 font-medium`} colSpan={3}>■ 기타 안전조치 사항 (기술)</td>
</tr>

<tr>
<td className={`border ${BORDER_COLOR} p-2 text-sm align-middle`}>
<div className="flex flex-col justify-center h-full space-y-1">
{safetyRequirements.height.map(item => (
<div key={item.id} className="flex items-center gap-1">
<span>-</span>
<input value={item.text} onChange={e => updateRequirementRow("height", item.id, e.target.value)} className="inline-block flex-1 h-6 px-1 text-xs"/>
{safetyRequirements.height.length > 1 && (
<button onClick={() => removeRequirementRow("height", item.id)} className="text-xs no-print ml-1">
<X size={14} className={ICON_COLOR}/>
</button>
)}
</div>
))}
</div>
</td>

{[1, 2].map(num => (
<td key={`height-${num}`} className={`border ${BORDER_COLOR} p-2 align-middle`}>
<div className="flex flex-col items-center justify-center space-y-1">
{safetyRequirements.height.map((item, idx) => (
<Checkbox key={`${item.id}-${num}`} checked={!!formData.safetyChecks?.[`height_${idx}_${num}`]} onChange={() => updateSafetyCheck(`height_${idx}_${num}`, !formData.safetyChecks?.[`height_${idx}_${num}`])}/>
))}
</div>
</td>
))}

<td className={`border ${BORDER_COLOR} p-2 align-middle`}>
<div className="flex justify-center">
<textarea value={formData.otherSafety || ""} onChange={e => updateFormData({ otherSafety: e.target.value })} className="w-full h-[60px] border-[#F0F0F0] text-sm resize-none"/>
</div>
</td>

{[1, 2].map(num => (
<td key={`other-${num}`} className={`border ${BORDER_COLOR} p-2 text-center align-middle`}>
<div className="flex justify-center items-center h-full">
<Checkbox checked={!!formData.safetyChecks?.[`other_check${num}`]} onChange={() => updateSafetyCheck(`other_check${num}`, !formData.safetyChecks?.[`other_check${num}`])}/>
</div>
</td>
))}
</tr>

</tbody>
</table>

<table className={`w-full border-collapse border ${BORDER_COLOR} mt-3 ${BODY_TEXT_STYLE}`}>
<tbody>
<tr>
<td className={`border ${BORDER_COLOR} p-3 text-sm leading-6`} colSpan={6}>
<div className="space-y-1">
<div className="font-semibold flex items-center gap-1">
<span className="text-[16px]">✓</span>
<span>준수사항</span>
</div>

<div>ㆍ공도구는 작업 전 안전장치 상태를 점검하고 정품을 사용합니다. 모든 에너지원은 LOTOTO 절차에 의해 차단되어야 합니다.</div>
<div>ㆍ용접(충전부위 절연조치)/절단(역화방지기, 게이지) 시 작업 전 안전조치를 확인해야 합니다.</div>
<div>ㆍ흡연구역 준수 및 정리정돈을 해야 합니다. (클린캔 사용, 클린캔에 철물 혼입금지)</div>
<div className="font-semibold">
ㆍ크레인 및 중장비 작업 전 사전조사 및 작업계획서를 작성해야 하며, 그 내용에 대하여 모든 작업자에게 교육해야 합니다.<br/>
<span className="underline underline-offset-2">(당사 최초작업 및 일용직은 사전에 안전교육을 실시하여야 하며 그 교육결과를 작업허가서와 함께 게시해야 합니다.)</span>
</div>
<div>※ 안전 점검 중 불안전한 상태 및 행동에 대한 개선 요청 시 즉시 조치해야 하며 불응 시 작업중지 및 퇴출될 수 있습니다.</div>
<div>※ 작업팀 관리자 및 관리감독자는 현장 안전점검 수시로 실시 (작업 전, 중, 후)</div>
</div>
</td>
</tr>
</tbody>
</table>

<table className={`w-full border-collapse border ${BORDER_COLOR} mt-3 ${BODY_TEXT_STYLE}`}>
<tbody>

<tr>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 font-medium text-center w-[70%]`}>작업 완료 시 관리감독자 최종 작업장 확인 및 검토</td>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-2 font-medium text-center w-[30%]`}>조치/의견</td>
</tr>

{FINAL_CHECK_QUESTIONS.map((question, i) => (
<tr key={i}>
<td className={`border ${BORDER_COLOR} p-2 text-sm align-middle`}>
<div className="flex justify-between items-center w-full">
<span className="text-left">{question}</span>
<div className="flex items-center gap-3 pr-2">
<label className="flex items-center gap-1 text-sm">
<Checkbox checked={!!formData.safetyChecks?.[`final_check_${i + 1}_y`]} onChange={() => updateSafetyCheck(`final_check_${i + 1}_y`, !formData.safetyChecks?.[`final_check_${i + 1}_y`])}/>Y
</label>
<label className="flex items-center gap-1 text-sm">
<Checkbox checked={!!formData.safetyChecks?.[`final_check_${i + 1}_n`]} onChange={() => updateSafetyCheck(`final_check_${i + 1}_n`, !formData.safetyChecks?.[`final_check_${i + 1}_n`])}/>N
</label>
</div>
</div>
</td>

{i === 0 && (
<td rowSpan={4} className={`border ${BORDER_COLOR} p-0 align-top w-[30%]`}>
<textarea value={formData.safetyChecks?.final_comment as string || ""} onChange={e => updateSafetyCheck("final_comment", e.target.value)} className="w-full h-full min-h-[180px] text-sm border-0 resize-none p-2" placeholder="내용 입력"/>
</td>
)}
</tr>
))}

</tbody>
</table>

<table className={`w-full border-collapse border ${BORDER_COLOR} mt-3 ${BODY_TEXT_STYLE}`}>
<tbody>
<tr className="h-[26px]">
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} text-center align-middle w-[140px] font-medium h-[26px]`}>작업 종료 일시</td>
<td className={`border ${BORDER_COLOR} bg-white px-2 py-[2px] align-middle h-[26px]`}>
<input type="datetime-local" value={formData.safetyChecks?.work_end_time as string || ""} onChange={e => updateSafetyCheck("work_end_time", e.target.value)} className="w-52 h-[28px]"/>
</td>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} text-center font-medium w-[140px] h-[26px]`}>관리감독자</td>
<td className={`border ${BORDER_COLOR} bg-white w-[140px] p-[2px]`}>
<div className="flex items-center justify-center h-[45px]">
{formData.supervisor ? (
<div className="flex flex-col items-center gap-1 w-full">
<div className="text-xs font-medium text-gray-900">{formData.supervisor.name}</div>
<div className="text-[10px] text-gray-500">{formData.supervisor.subject}</div>
<div className="text-[10px] text-gray-500">{formData.supervisor.rank}</div>
<button onClick={() => openSignaturePad("supervisor")} className="text-[10px] text-blue-600 hover:underline">변경</button>
</div>
) : (
<button onClick={() => openSignaturePad("supervisor")} className="text-xs text-blue-600 hover:underline">선택</button>
)}
</div>
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
documentType="위험작업허가서"
/>
<SignaturePadDialog
isOpen={signaturePadOpen}
onSave={handleSignatureSave}
onClose={() => { setSignaturePadOpen(false); setSignatureTarget(null); }}
title="서명"
/>
<UserSelectModal
isOpen={userSelectModalOpen}
onClose={() => { setUserSelectModalOpen(false); setSelectedApprovalKey(null); }}
onSelect={handleUserSelect}
title={
selectedApprovalKey === "supervisor"
? "관리감독자 선택"
: selectedApprovalKey
? `${APPROVAL_STEPS.find(s => s.key === selectedApprovalKey)?.title} ${APPROVAL_STEPS.find(s => s.key === selectedApprovalKey)?.subtitle} 선택`
: "검토자 선택"
}
/>
</>
)
}
