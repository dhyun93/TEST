import React, { useState, useEffect, useRef } from 'react'
import { Upload, FileText, X, Eye, Camera } from 'lucide-react'

export interface PTWFile {
id: string
name: string
size: string
uploadedAt: string
url?: string
type?: string
}

interface FilePanelProps {
ptwId?: string
onFilesChange?: (files: PTWFile[]) => void
}

const MAX_FILES = 10

export default function FilePanel({ ptwId, onFilesChange }: FilePanelProps) {
const [files, setFiles] = useState<PTWFile[]>([])
const [uploading, setUploading] = useState(false)
const [previewFile, setPreviewFile] = useState<PTWFile | null>(null)
const [isDragging, setIsDragging] = useState(false)
const cameraInputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
if (ptwId) {
setFiles([])
}
}, [ptwId])

useEffect(() => {
onFilesChange?.(files)
}, [files, onFilesChange])

const formatFileSize = (bytes: number): string => {
if (bytes < 1024) return bytes + ' B'
if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const isValidFileType = (file: File): boolean => {
const validTypes = [
'image/jpeg',
'image/jpg', 
'image/png',
'image/gif',
'image/webp',
'image/svg+xml',
'application/pdf'
]
return validTypes.includes(file.type)
}

const processFiles = (selectedFiles: FileList) => {
if (files.length >= MAX_FILES) {
alert(`최대 ${MAX_FILES}장까지만 업로드 가능합니다.`)
return
}

const remainingSlots = MAX_FILES - files.length
const filesToProcess = Array.from(selectedFiles).slice(0, remainingSlots)

const invalidFiles = filesToProcess.filter(file => !isValidFileType(file))
if (invalidFiles.length > 0) {
alert('이미지 파일(JPG, PNG, GIF, WebP, SVG) 또는 PDF만 업로드 가능합니다.\n동영상 파일은 업로드할 수 없습니다.')
return
}

setUploading(true)

const newFiles: PTWFile[] = filesToProcess.map(file => ({
id: Date.now().toString() + Math.random(),
name: file.name,
size: formatFileSize(file.size),
uploadedAt: new Date().toLocaleString('ko-KR'),
url: URL.createObjectURL(file),
type: file.type
}))

setTimeout(() => {
setFiles(prev => [...prev, ...newFiles])
setUploading(false)
}, 500)
}

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
const selectedFiles = e.target.files
if (!selectedFiles || selectedFiles.length === 0) return

processFiles(selectedFiles)
e.target.value = ''
}

const handleCameraCapture = () => {
if (files.length >= MAX_FILES) {
alert(`최대 ${MAX_FILES}장까지만 업로드 가능합니다.`)
return
}
cameraInputRef.current?.click()
}

const handleDragEnter = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setIsDragging(true)
}

const handleDragOver = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
}

const handleDragLeave = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setIsDragging(false)
}

const handleDrop = (e: React.DragEvent) => {
e.preventDefault()
e.stopPropagation()
setIsDragging(false)

const droppedFiles = e.dataTransfer.files
if (droppedFiles && droppedFiles.length > 0) {
processFiles(droppedFiles)
}
}

const handleDelete = (fileId: string) => {
if (!window.confirm('정말 삭제하시겠습니까?')) return
setFiles(prev => prev.filter(f => f.id !== fileId))
}

const handlePreview = (file: PTWFile) => {
setPreviewFile(file)
}

const closePreview = () => {
setPreviewFile(null)
}

return (
<>
<div className="h-full flex flex-col p-3 md:p-6">
<div className="mb-2 md:mb-4">
<h3 className="font-semibold text-sm md:text-lg text-gray-800">첨부 파일</h3>
<p className="text-[10px] md:text-sm text-gray-500 mt-1">
사진 및 문서를 업로드하세요<br />
추가된 파일은 인쇄 시 문서와 함께 출력됩니다
</p>
</div>

<hr className="mb-3 md:mb-6" />

<div className="flex gap-2 mb-3 md:hidden">
<button
onClick={handleCameraCapture}
disabled={uploading || files.length >= MAX_FILES}
className="flex-1 flex items-center justify-center gap-1 py-2 bg-[var(--secondary)] text-white text-xs font-medium rounded-lg disabled:opacity-50"
>
<Camera size={14} />
촬영 ({files.length}/{MAX_FILES})
</button>
<input
ref={cameraInputRef}
type="file"
accept="image/*"
capture="environment"
className="hidden"
onChange={handleUpload}
disabled={uploading}
/>
</div>

<label 
className={`cursor-pointer mb-3 md:mb-6 block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
onDragEnter={handleDragEnter}
onDragOver={handleDragOver}
onDragLeave={handleDragLeave}
onDrop={handleDrop}
>
<div 
className={`border border-dashed rounded-xl p-6 md:p-12 text-center transition ${
isDragging 
? 'border-blue-400 bg-blue-100/50' 
: 'border-gray-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
}`}
>
<Upload className="mx-auto mb-2 md:mb-3 text-gray-400" size={32} strokeWidth={1.5} />
<p className="text-xs md:text-base font-medium text-gray-700 mb-1">
{uploading ? '업로드 중...' : isDragging ? '파일을 여기에 놓으세요' : '파일을 여기에 드롭하거나'}
</p>
{!isDragging && <p className="text-xs md:text-sm text-blue-600 font-medium">클릭하여 선택</p>}
<p className="text-[10px] md:text-xs text-gray-500 mt-2 md:mt-3">이미지, PDF 파일 (최대 {MAX_FILES}장)</p>
</div>
<input 
type="file" 
className="hidden" 
onChange={handleUpload}
disabled={uploading}
multiple
accept="image/*,application/pdf"
/>
</label>

<div className="mb-2 md:mb-4">
<h4 className="font-semibold text-xs md:text-base text-gray-600">
업로드된 파일 ({files.length}/{MAX_FILES})
</h4>
</div>

<div className="flex-1 overflow-auto">
{files.length === 0 ? (
<div className="flex flex-col items-center justify-center py-6 md:py-12">
<FileText className="text-gray-300 mb-2 md:mb-3" size={48} strokeWidth={1} />
<p className="text-[10px] md:text-sm text-gray-400">아직 업로드된 파일이 없습니다</p>
</div>
) : (
<div className="space-y-2">
{files.map(file => (
<div 
key={file.id} 
className="p-2 md:p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition"
>
<div className="flex items-center gap-2 md:gap-3">
<FileText className="text-gray-400 flex-shrink-0" size={16} />
<div className="flex-1 min-w-0">
<p className="text-xs md:text-sm font-medium text-gray-800 truncate">{file.name}</p>
<p className="text-[10px] md:text-xs text-gray-500">{file.size}</p>
</div>
<div className="flex gap-1 ml-2 md:ml-4">
<button
onClick={() => handlePreview(file)}
className="p-1 md:p-1.5 text-gray-500 hover:bg-gray-100 rounded transition"
title="미리보기"
>
<Eye size={14} />
</button>
<button
onClick={() => handleDelete(file.id)}
className="p-1 md:p-1.5 text-gray-500 hover:bg-gray-100 rounded transition"
title="삭제"
>
<X size={14} />
</button>
</div>
</div>
</div>
))}
</div>
)}
</div>
</div>

{previewFile && (
<div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
<div className="absolute inset-0 flex items-center justify-center p-2">
<div className="relative">
{previewFile.type?.startsWith('image/') ? (
<img 
src={previewFile.url} 
alt={previewFile.name}
className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
/>
) : previewFile.type === 'application/pdf' ? (
<iframe
src={previewFile.url}
className="w-[92vw] h-[90vh] rounded-lg shadow-2xl"
title={previewFile.name}
/>
) : (
<div className="bg-white rounded-lg shadow-2xl p-6 md:p-12">
<FileText className="mx-auto mb-4 text-gray-400" size={48} />
<p className="text-xs md:text-sm text-gray-600">미리보기를 지원하지 않는 파일입니다</p>
</div>
)}

<button 
aria-label="닫기" 
onClick={closePreview}
className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-md bg-black/60 text-white hover:bg-black/70"
>
<X size={14} />
</button>

<div className="absolute bottom-2 right-2 text-[10px] md:text-[11px] text-white/90 bg-black/50 rounded px-2 py-1 max-w-xs truncate">
{previewFile.name}
</div>
</div>
</div>
</div>
)}
</>
)
}