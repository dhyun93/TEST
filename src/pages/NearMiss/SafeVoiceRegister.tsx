import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import ToggleSwitch from "@/components/common/base/ToggleSwitch"
import useHandlers from "@/hooks/useHandlers"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type SafeVoiceFormData = {
  content: string
  photo: string
  anonymous: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { contents: string; is_anonymous: number; photofiles: File[] }) => void
}

export default function SafeVoiceRegisterModal({ isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<SafeVoiceFormData>({ content: "", photo: "", anonymous: false })
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  useEffect(() => {
    if (!isOpen) return
    setFormData({ content: "", photo: "", anonymous: false })
    setPhotoFiles([])
  }, [isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      content: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (name: string, files: File[]) => {
    if (name !== "photo") return
    setPhotoFiles(prev => [...prev, ...files])
  }

  const handlePhotoRemove = (name: string, fileName: string) => {
    if (name !== "photo") return
    setPhotoFiles(prev => prev.filter(file => file.name !== fileName))
  }

  const AnonymousToggle = <ToggleSwitch checked={formData.anonymous} onChange={checked => setFormData(prev => ({ ...prev, anonymous: checked }))} />

  const fields: Field[] = [
    { label: "내용", name: "content", type: "textarea", placeholder: "내용을 입력하세요", required: true, hasError: isFieldInvalid("content") },
    { label: "현장사진", name: "photo", type: "photoUpload", required: false },
    { label: "익명", name: "anonymous", type: "custom", customRender: AnonymousToggle, required: false },
  ]

  const { handleSave: handleTableSave } = useHandlers<SafeVoiceFormData>({
    data: [formData],
    checkedIds: [],
    onSave: () =>
      onSave({
        contents: formData.content,
        is_anonymous: formData.anonymous ? 1 : 0,
        photofiles: photoFiles,
      }),
    saveMessage: "저장되었습니다",
  })

  const handleSave = () => {
    if (!validateForm({ content: formData.content })) return
    handleTableSave()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>안전보이스 등록</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen
            fields={fields}
            values={{ ...formData, anonymous: formData.anonymous ? "true" : "false" } as { [key: string]: string }}
            onChange={handleChange}
            onFileChange={handlePhotoChange}
            onFileRemove={handlePhotoRemove}
            onClose={onClose}
            onSave={handleSave}
            isModal
          />
        </div>
        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSave}>
            저장하기
          </Button>
        </div>
      </div>
    </div>
  )
}
