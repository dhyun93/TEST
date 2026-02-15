import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import Editor from "@/components/common/base/Editor"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { getFileNameFromUrl } from "@/utils/file"
import { hasRichTextContent, stripRichText } from "@/utils/editor"
import { useAlerts } from "@/hooks/useAlerts"

type FormDataState = {
  title: string
  author: string
  content: string
  fileUpload: string
}

type ExistingFile = {
  id: number
  url: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: { title: string; content: string; newFiles: File[]; keepFileIds: number[] }) => void
  userName: string
  isEdit?: boolean
  initialData?: {
    id?: number | string
    title?: string
    author?: string
    content?: string
    files?: ExistingFile[]
  }
}

export default function ResourcesListRegister({ isOpen, onClose, onSave, userName, isEdit, initialData }: Props): React.ReactElement | null {
  const { alertNoChanges } = useAlerts()
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    author: userName,
    content: "",
    fileUpload: "",
  })
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState({ title: "", content: "", fileIds: [] as number[] })

  useEffect(() => {
    if (!isOpen) return
    setFormData({
      title: initialData?.title || "",
      author: initialData?.author || userName,
      content: initialData?.content || "",
      fileUpload: "",
    })
    setNewFiles([])
    const files = initialData?.files || []
    setExistingFiles(files)
    setInitialSnapshot({
      title: (initialData?.title || "").trim(),
      content: initialData?.content || "",
      fileIds: files.map(file => file.id),
    })
  }, [initialData?.id, isOpen, userName])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      title: { required: true },
      content: {
        required: true,
        custom: hasRichTextContent,
      },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value: string): void => {
    setFormData(prev => ({ ...prev, content: value }))
  }

  const handleFileChange = (name: string, files: File[]) => {
    if (name !== "fileUpload") return
    setNewFiles(prev => [...prev, ...files])
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name !== "fileUpload") return
    setNewFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const normalizeContent = (value: string) => stripRichText(value)

  const hasChanges =
    formData.title.trim() !== initialSnapshot.title ||
    normalizeContent(formData.content) !== normalizeContent(initialSnapshot.content) ||
    newFiles.length > 0 ||
    existingFiles
      .map(file => file.id)
      .sort((a, b) => a - b)
      .join(",") !==
      initialSnapshot.fileIds
        .slice()
        .sort((a, b) => a - b)
        .join(",")

  const editedFields: Record<string, boolean> = {
    title: formData.title.trim() !== initialSnapshot.title,
    content: normalizeContent(formData.content) !== normalizeContent(initialSnapshot.content),
    fileUpload:
      newFiles.length > 0 ||
      existingFiles
        .map(file => file.id)
        .sort((a, b) => a - b)
        .join(",") !==
        initialSnapshot.fileIds
          .slice()
          .sort((a, b) => a - b)
          .join(","),
  }

  const handleSave = (): void => {
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (!validateForm(formData)) return
    onSave?.({
      title: formData.title,
      content: formData.content,
      newFiles,
      keepFileIds: existingFiles.map(file => file.id),
    })
  }

  const fields: Field[] = [
    { label: "자료명", name: "title", type: "text", placeholder: "자료명 입력", required: true, hasError: isFieldInvalid("title") },
    { label: "작성자", name: "author", type: "readonly", required: true },
    {
      label: "내용",
      name: "content",
      type: "custom",
      required: true,
      hasError: isFieldInvalid("content"),
      customRender: (
        <Editor
          value={formData.content}
          onChange={handleContentChange}
          className={`min-h-[300px] ${isFieldInvalid("content") ? "border border-red-600 rounded-lg" : ""} ${editedFields.content ? "bg-[#E9F0FE] rounded-lg" : ""}`}
        />
      ),
    },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
  ]

  if (!isOpen) return null

  const valuesForForm: { [key: string]: string } = {
    title: formData.title,
    author: formData.author,
    content: formData.content,
    fileUpload: formData.fileUpload,
  }

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>자료실 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={valuesForForm}
            editedFields={editedFields}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            existingFileMap={{
              fileUpload: existingFiles.map(file => ({ name: getFileNameFromUrl(file.url) || file.url, url: file.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onClose={onClose}
            onSave={handleSave}
            isModal
          />
        </div>
        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave} disabledStyleOnly={!hasChanges}>
            저장하기
          </Button>
        </div>
      </div>
    </div>
  )
}
