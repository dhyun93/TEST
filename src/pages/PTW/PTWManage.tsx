import React,{useState,useEffect}from"react"
import{useLocation,useSearchParams}from"react-router-dom"
import PageTitle from"@/components/common/base/PageTitle"
import TabMenu from"@/components/common/base/TabMenu"
import PTWWorkPermit from"./forms/PTWWorkPermit"
import PTWJSA from"./forms/PTWJSA"
import PTWSiteEvaluation from"./forms/PTWSiteEvaluation"
import PTWTBM from"./forms/PTWTBM"
import FilePanel,{PTWFile}from"./FilePanel/FilePanel"

const tabs:string[]=["위험작업허가서","작업위험분석(JSA)","현장 위험성평가","TBM"]

export default function PTWManage():React.ReactElement{
const location=useLocation()
const[searchParams,setSearchParams]=useSearchParams()
const initialTab=(location.state as{activeTab?:number}|undefined)?.activeTab??0
const[activeTab,setActiveTab]=useState<number>(initialTab)
const[attachedFiles,setAttachedFiles]=useState<PTWFile[]>([])
const[ptwName,setPtwName]=useState<string>("11월 용접 작업")
const[pageTitle,setPageTitle]=useState<string>("PTW 관리")
const ptwId="TEMP_ID"

useEffect(()=>{
setPageTitle(`관리 · ${tabs[activeTab]}`)
setSearchParams({tab:tabs[activeTab]})
},[activeTab,setSearchParams])

return(
<div className="bg-white rounded-lg shadow-sm p-0 md:p-6">
{/* Mobile Header */}
<div className="md:hidden px-2 pt-2">
<div className="flex items-center gap-2 mb-2">
<span className="text-[10px] text-gray-500 shrink-0">PTW명</span>
<input
value={ptwName}
onChange={e=>setPtwName(e.target.value)}
className="h-7 text-xs bg-white flex-1 border-gray-300"
placeholder="슬래그 밀(Slag Mill) 정비"
/>
</div>
<TabMenu tabs={tabs} activeIndex={activeTab} onTabClick={setActiveTab} className="mb-2"/>
</div>

{/* Desktop Header */}
<div className="hidden md:block">
<PageTitle>{pageTitle}</PageTitle>
</div>

<div className="hidden md:flex flex-wrap items-center justify-between bg-[#F9FAFB] rounded-lg px-4 py-3 mb-4 text-sm text-gray-700">
<div className="flex items-center gap-3 w-full">
<span className="whitespace-nowrap"><strong>PTW명:</strong></span>
<input
value={ptwName}
onChange={e=>setPtwName(e.target.value)}
className="h-8 bg-white w-full max-w-[400px] border-[#DFDFDF] focus-visible:ring-1 focus-visible:ring-gray-400"
placeholder="슬래그 밀(Slag Mill) 정비"
/>
</div>
</div>

<div className="hidden md:block">
<TabMenu tabs={tabs} activeIndex={activeTab} onTabClick={setActiveTab} className="mb-6"/>
</div>

<div className="flex gap-6">
<div className="w-full md:flex-shrink-0 md:w-auto">
{activeTab===0&&<PTWWorkPermit ptwId={ptwId}attachedFiles={attachedFiles}/>}
{activeTab===1&&<PTWJSA ptwId={ptwId}attachedFiles={attachedFiles}/>}
{activeTab===2&&<PTWSiteEvaluation ptwId={ptwId}attachedFiles={attachedFiles}/>}
{activeTab===3&&<PTWTBM ptwId={ptwId}attachedFiles={attachedFiles}/>}

{/* Mobile FilePanel */}
<div className="lg:hidden mt-3 mb-20 px-2">
<div className="border border-gray-200 rounded-lg bg-white">
<FilePanel ptwId={ptwId} onFilesChange={setAttachedFiles}/>
</div>
</div>
</div>

{/* Desktop FilePanel */}
<div className="hidden lg:block w-[380px] flex-shrink-0">
<div className="sticky top-6 border border-gray-200 rounded-lg bg-white">
<FilePanel ptwId={ptwId} onFilesChange={setAttachedFiles}/>
</div>
</div>
</div>
</div>
)
}