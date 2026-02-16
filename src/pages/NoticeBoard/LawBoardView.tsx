import React, { useState, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import { Download } from "lucide-react"

type FormDataState = {
  title: string
  organization: string
  date: string
  content: string
  fileAttach: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  initialData?: { id?: number | string; title?: string; organization?: string; date?: string; content?: string; fileAttach?: boolean; link?: string } | null
}

export default function LawBoardView({ isOpen, onClose, initialData = null }: Props): React.ReactElement | null {
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    organization: "",
    date: "",
    content: "",
    fileAttach: false,
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        organization: initialData.organization || "",
        date: initialData.date || "",
        content: initialData.content || "",
        fileAttach: initialData.fileAttach || false,
      })
    }
  }, [isOpen, initialData])

  const getMockFileNames = (): string[] => {
    if (!formData.fileAttach) return []
    const titleShort = formData.title.substring(0, 20).replace(/[^\w가-힣]/g, "_")
    return [`${titleShort}_본문.pdf`, `${titleShort}_별첨.hwp`]
  }

  const handleDownload = (fileName: string) => {
    alert(`${fileName} 다운로드 (데모)`)
  }

  const fields: Field[] = [
    { label: "제목", name: "title", type: "readonly" },
    { label: "소관기관", name: "organization", type: "readonly" },
    { label: "발표일", name: "date", type: "readonly" },
    {
      label: "내용",
      name: "content",
      type: "custom",
      customRender: <div className="min-h-[150px] bg-gray-50 px-3 py-2 rounded-lg text-sm whitespace-pre-wrap">{formData.content || "-"}</div>,
    },
    {
      label: "첨부파일",
      name: "fileAttach",
      type: "custom",
      customRender: formData.fileAttach ? (
        <ul className="rounded-md p-2 max-h-[120px] overflow-auto text-xs md:text-sm text-gray-900" style={{ border: "1px solid #d1d5db" }}>
          {getMockFileNames().map((fileName, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 py-1">
              <span className="truncate">{fileName}</span>
              <button type="button" onClick={() => handleDownload(fileName)} className="text-gray-400 hover:text-blue-600 shrink-0">
                <Download size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">첨부파일 없음</div>
      ),
    },
  ]

  if (!isOpen) return null

  const valuesForForm: { [key: string]: string } = {
    title: formData.title,
    organization: formData.organization,
    date: formData.date,
    content: formData.content,
    fileAttach: "",
  }

  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[800px] max-w-[95vw] p-8 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold tracking-wide mb-3">중대재해처벌법</h2>
        <FormScreen fields={fields} values={valuesForForm} onChange={() => {}} onClose={onClose} onSave={() => {}} isModal />
        <div className="mt-6 flex justify-center gap-2">
          {initialData?.link && (
            <Button variant="primary" onClick={() => window.open(initialData.link!, '_blank')}>
              법령 원문 보기
            </Button>
          )}
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
