import React, { useState, useCallback, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Printer, Save, FolderOpen, Plus, X, Send } from "lucide-react"
import Checkbox from "@/components/common/base/Checkbox"
import Button from "@/components/common/base/Button"
import PTWListModal from "../../../components/dialog/PTWListDialog"
import { useLoadingStore } from "@/stores/loadingStore"
import { PTWFile } from "../FilePanel/FilePanel"

type PTWJSAProps = {
  ptwId?: string
  attachedFiles?: PTWFile[]
}

interface JSAFormData {
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

const BORDER_COLOR = "border-[#888888]"
const HEADER_TEXT_STYLE = "text-[#595F68] text-[15px] font-medium"
const HEADER_BG_STYLE = `bg-[#f3f3f3] ${HEADER_TEXT_STYLE}`
const TEXT_TITLE = "text-[18px] font-bold text-[#333A3F]"
const TEXT_BODY = "text-[15px] text-[#333A3F]"
const ALIGN_CENTER = "text-center"
const LABEL_WIDTH = "w-[10%]"
const PLACEHOLDER_STYLE = "placeholder:text-[13px] placeholder:text-gray-500"
const WORKPLACE_NAME = "(주)에스피에스앤아이 당진 슬래그공장"
const ICON_COLOR = "text-gray-500"

const FORM_FIELDS = [
{ label: "Date", key: "date", type: "date", width: "w-[40%]" },
{ label: "No", key: "no", defaultValue: "SPS&A-JSA-15", width: "w-[40%]" },
{ label: "분임조", key: "team", width: "w-[40%]", placeholder: "분임조를 입력하세요" },
{ label: "Rev", key: "rev", width: "w-[40%]", hasReason: true, placeholder: "Rev를 입력하세요" },
{ label: "작업명", key: "workName", width: "w-[40%]", placeholder: "작업명을 입력하세요" },
{ label: "작업도구", key: "tools", width: "w-[40%]", placeholder: "작업도구를 입력하세요" },
{ label: "안전장치", key: "safetyDevices", width: "w-[40%]", placeholder: "안전장치를 입력하세요" },
{ label: "작업내용", key: "workContent", width: "w-[40%]", placeholder: "작업 내용을 입력하세요" }
]

const RISK_LEVELS = ["상", "중", "하"]

const INITIAL_WORK_TASKS = [
"1. 작업 전 설비(공구), 안전 보호구 점검",
"2. 점검 맨홀 Open",
"3. B/F(12-FN-240) 가동 및 설비 내부 Aring 실시",
"4. 24mm 연결 된 60A 파이프 시계 회전 방향 회전",
"5. Roller Oil 급유 뚜껑 OPEN 및 Oil 확인 후 급유",
"6. Roller 회전 상태 및 누유 확인",
"7. 점검맨홀 Close",
"8. 작업 마무리 주변 정리정돈"
]

export default function PTWJSA({ ptwId, attachedFiles = [] }: PTWJSAProps): React.ReactElement {
const [formData, setFormData] = useState<JSAFormData>({ workplace: WORKPLACE_NAME })
const [riskRows, setRiskRows] = useState<RiskRow[]>(
INITIAL_WORK_TASKS.map((task, i) => ({
id: i + 1,
task,
hazard: "",
currentRisk: "",
measure: "",
improvedRisk: "",
checked: false,
beforeImages: [],
afterImages: []
}))
)
const [isListModalOpen, setIsListModalOpen] = useState(false)
const { setLoading } = useLoadingStore()
const printRef = useRef<HTMLDivElement>(null)

const handlePrint = useReactToPrint({
contentRef: printRef,
documentTitle: "작업위험분석(JSA)",
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

const updateFormData = useCallback((updates: Partial<JSAFormData>): void => {
setFormData(prev => ({ ...prev, ...updates }))
}, [])

const updateRiskRow = useCallback((id: number, key: keyof RiskRow, value: any): void => {
setRiskRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r))
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

const getRiskBadgeColor = (l: string): string =>
l === "상" ? "bg-[#B65E5D] text-white" :
l === "중" ? "bg-[#CAB359] text-white" :
l === "하" ? "bg-[#80A16A] text-white" :
"bg-gray-200 text-gray-600"

const handleSelectPTW = (data: any) => {
  setFormData(prev => ({ ...prev, ...data }))
  if (data.riskRows) {
    setRiskRows(data.riskRows)
  }
  setIsListModalOpen(false)
}

const handleSaveToStore = async () => {
if(!formData.workName||!formData.date){
alert("작업명과 일자를 입력해주세요.")
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
<label className="text-[10px] text-gray-500">Date</label>
<input type="date" value={formData.date || ""} onChange={e => updateFormData({ date: e.target.value })} className="w-full h-7 text-xs"/>
</div>
<div>
<label className="text-[10px] text-gray-500">No</label>
<input value={formData.no || "SPS&A-JSA-15"} onChange={e => updateFormData({ no: e.target.value })} className="w-full h-7 text-xs"/>
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">분임조</label>
<input value={formData.team || ""} onChange={e => updateFormData({ team: e.target.value })} className="w-full h-7 text-xs" placeholder="분임조"/>
</div>
<div>
<label className="text-[10px] text-gray-500">Rev</label>
<input value={formData.rev || ""} onChange={e => updateFormData({ rev: e.target.value })} className="w-full h-7 text-xs" placeholder="Rev"/>
</div>
</div>
<div>
<label className="text-[10px] text-gray-500">Rev 사유</label>
<input value={formData.reason || ""} onChange={e => updateFormData({ reason: e.target.value })} className="w-full h-7 text-xs" placeholder="Rev 사유"/>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">작업명</label>
<input value={formData.workName || ""} onChange={e => updateFormData({ workName: e.target.value })} className="w-full h-7 text-xs" placeholder="작업명"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업도구</label>
<input value={formData.tools || ""} onChange={e => updateFormData({ tools: e.target.value })} className="w-full h-7 text-xs" placeholder="작업도구"/>
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="text-[10px] text-gray-500">안전장치</label>
<input value={formData.safetyDevices || ""} onChange={e => updateFormData({ safetyDevices: e.target.value })} className="w-full h-7 text-xs" placeholder="안전장치"/>
</div>
<div>
<label className="text-[10px] text-gray-500">작업내용</label>
<input value={formData.workContent || ""} onChange={e => updateFormData({ workContent: e.target.value })} className="w-full h-7 text-xs" placeholder="작업내용"/>
</div>
</div>
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
<span className="text-[8px] text-gray-400">현재</span>
{RISK_LEVELS.map(level => (
<button key={`cur-${level}`} onClick={() => updateRiskRow(row.id, "currentRisk", row.currentRisk === level ? "" : level)} className={`text-[9px] px-1.5 py-0.5 rounded ${row.currentRisk === level ? getRiskBadgeColor(level) : 'bg-gray-100 text-gray-500'}`}>{level}</button>
))}
<span className="text-[8px] text-gray-400 ml-1">개선</span>
{RISK_LEVELS.map(level => (
<button key={`imp-${level}`} onClick={() => updateRiskRow(row.id, "improvedRisk", row.improvedRisk === level ? "" : level)} className={`text-[9px] px-1.5 py-0.5 rounded ${row.improvedRisk === level ? getRiskBadgeColor(level) : 'bg-gray-100 text-gray-500'}`}>{level}</button>
))}
<Checkbox checked={row.checked} onChange={() => updateRiskRow(row.id, "checked", !row.checked)} className="ml-1"/>
{riskRows.length > 1 && <button onClick={() => removeRiskRow(row.id)} className="ml-1"><X size={12} className="text-gray-400"/></button>}
</div>
</div>
<div className="grid grid-cols-4 gap-1">
<input value={row.task} onChange={e => updateRiskRow(row.id, "task", e.target.value)} className="h-7 text-[10px]" placeholder="작업순서"/>
<input value={row.hazard} onChange={e => updateRiskRow(row.id, "hazard", e.target.value)} className="h-7 text-[10px]" placeholder="위험요인"/>
<input value={row.measure} onChange={e => updateRiskRow(row.id, "measure", e.target.value)} className="h-7 text-[10px] col-span-2" placeholder="안전대책"/>
</div>
</div>
))}
</div>
</div>
</div>

{/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex gap-2 md:hidden">
<Button variant="action" disabled className="flex-1 flex items-center justify-center gap-1 text-xs opacity-50">
결재선 지정 (0/4)
</Button>
<Button variant="actionPrimary" onClick={handleSubmitForm} className="flex-1 flex items-center justify-center gap-1 text-xs"><Send size={12}/>전송</Button>
</div> */}
</div>

{/* Desktop */}
<div className="hidden md:block w-full">
<div className="p-0 flex justify-start">
<div className="w-full">
<div className="w-[900px] min-w-[900px] print:w-full bg-white print:shadow-none">
<div className="flex justify-between mb-3 no-print">
<Button variant="support" onClick={handleCancel}>목록으로</Button>
<div className="flex flex-nowrap gap-1">
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
<td colSpan={4} className={`border ${BORDER_COLOR} ${ALIGN_CENTER} ${TEXT_TITLE} py-3`}>
작업위험분석(JSA)
</td>
</tr>
{FORM_FIELDS.map((f, i) => {
if (i % 2 === 0) {
const n = FORM_FIELDS[i + 1]
return (
<tr key={i}>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2 ${LABEL_WIDTH}`}>
{f.label}
</td>
<td className={`border ${BORDER_COLOR} p-2 ${f.width}`}>
{f.hasReason ? (
<div className="flex items-center gap-2 w-full">
<input value={(formData[f.key as keyof JSAFormData] as string) || ""} onChange={e => updateFormData({ [f.key]: e.target.value })} className={`w-[30%] ${TEXT_BODY} ${PLACEHOLDER_STYLE}`}/>
<input value={formData.reason || ""} onChange={e => updateFormData({ reason: e.target.value })} className={`flex-1 ${TEXT_BODY} ${PLACEHOLDER_STYLE}`}/>
</div>
) : (
<input type={f.type || "text"} value={(formData[f.key as keyof JSAFormData] as string) || f.defaultValue || ""} onChange={e => updateFormData({ [f.key]: e.target.value })} className={`w-full ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder={f.placeholder}/>
)}
</td>
{n && (
<>
<td className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2 ${LABEL_WIDTH}`}>
{n.label}
</td>
<td className={`border ${BORDER_COLOR} p-2 ${n.width}`}>
<input type={n.type || "text"} value={(formData[n.key as keyof JSAFormData] as string) || n.defaultValue || ""} onChange={e => updateFormData({ [n.key]: e.target.value })} className={`w-full ${TEXT_BODY} ${PLACEHOLDER_STYLE}`} placeholder={n.placeholder}/>
</td>
</>
)}
</tr>
)
}
return null
}).filter(Boolean)}
</tbody>
</table>

<table className={`w-full border-collapse border mt-3 ${BORDER_COLOR}`}>
<thead>
<tr>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2`}>작업순서</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2`}>위험요인</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-0`} colSpan={3}>
<div className="flex flex-col w-full">
<div className={`border-b ${BORDER_COLOR} py-1`}>현재 위험성</div>
<div className="flex divide-x divide-[#888888]">
{RISK_LEVELS.map((l, i) => (
<div key={i} className="flex-1 py-1">{l}</div>
))}
</div>
</div>
</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2`}>안전대책</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} p-0`} colSpan={3}>
<div className="flex flex-col w-full">
<div className={`border-b ${BORDER_COLOR} py-1`}>개선후 위험성</div>
<div className="flex divide-x divide-[#888888]">
{RISK_LEVELS.map((l, i) => (
<div key={i} className="flex-1 py-1">{l}</div>
))}
</div>
</div>
</th>
<th className={`border ${BORDER_COLOR} ${HEADER_BG_STYLE} ${ALIGN_CENTER} p-2`}>체크</th>
</tr>
</thead>
<tbody>
{riskRows.map((row, i) => (
<tr key={row.id} className="align-top">
<td className={`border ${BORDER_COLOR} p-2 w-[18%]`}>
<div className="flex items-start gap-1">
{riskRows.length > 1 && (
<button onClick={() => removeRiskRow(row.id)} className="text-xs no-print mt-3">
<X size={14} className={ICON_COLOR}/>
</button>
)}
<textarea value={row.task} onChange={e => updateRiskRow(row.id, "task", e.target.value)} className={`flex-1 min-h-[48px] ${TEXT_BODY} resize-none`}/>
</div>
</td>
<td className={`border ${BORDER_COLOR} p-2 w-[18%]`}>
<textarea value={row.hazard} onChange={e => updateRiskRow(row.id, "hazard", e.target.value)} className={`w-full min-h-[48px] ${TEXT_BODY} resize-none`}/>
</td>
{RISK_LEVELS.map(level => (
<td key={`cur-${level}`} className={`border ${BORDER_COLOR} w-[4%] align-middle text-center`}>
<div className="flex items-center justify-center h-full w-full">
<Checkbox checked={row.currentRisk === level} onChange={() => updateRiskRow(row.id, "currentRisk", row.currentRisk === level ? "" : level)}/>
</div>
</td>
))}
<td className={`border ${BORDER_COLOR} p-2 w-[22%]`}>
<textarea value={row.measure} onChange={e => updateRiskRow(row.id, "measure", e.target.value)} className={`w-full min-h-[48px] ${TEXT_BODY} resize-none`}/>
</td>
{RISK_LEVELS.map(level => (
<td key={`imp-${level}`} className={`border ${BORDER_COLOR} w-[4%] align-middle text-center`}>
<div className="flex items-center justify-center h-full w-full">
<Checkbox checked={row.improvedRisk === level} onChange={() => updateRiskRow(row.id, "improvedRisk", row.improvedRisk === level ? "" : level)}/>
</div>
</td>
))}
<td className={`border ${BORDER_COLOR} ${ALIGN_CENTER} align-middle w-[6%]`}>
<div className="flex items-center justify-center h-full">
<Checkbox checked={row.checked} onChange={() => updateRiskRow(row.id, "checked", !row.checked)}/>
</div>
</td>
</tr>
))}
<tr>
<td colSpan={10} className={`border ${BORDER_COLOR} p-2 text-center`}>
<button onClick={addRiskRow} disabled={riskRows.length >= 15} className={`text-xs no-print flex items-center gap-1 mx-auto ${riskRows.length >= 15 ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
documentType="작업위험분석(JSA)"
/>
</>
)
}