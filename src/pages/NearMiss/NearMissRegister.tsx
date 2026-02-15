import React, { useState, useMemo, useEffect } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import useHandlers from "@/hooks/useHandlers"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { risk_factor: string; place: string; photofiles: File[] }) => void
}

type FormData = {
  content: string
  place: string
  photos: string
}

export default function NearMissRegisterModal({ isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<FormData>({ content: "", place: "", photos: "" })
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  useEffect(() => {
    if (!isOpen) return
    setFormData({ content: "", place: "", photos: "" })
    setPhotoFiles([])
  }, [isOpen])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      place: { required: true },
      content: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const fields: Field[] = [
    { label: "장소", name: "place", type: "text", placeholder: "장소 입력", required: true, hasError: isFieldInvalid("place") },
    { label: "내용", name: "content", type: "textarea", placeholder: "내용 입력", required: true, hasError: isFieldInvalid("content") },
    { label: "현장사진", name: "photos", type: "photoUpload", required: false },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (name: string, files: File[]) => {
    if (name !== "photos") return
    setPhotoFiles(prev => [...prev, ...files])
  }

  const handlePhotoRemove = (name: string, fileName: string) => {
    if (name !== "photos") return
    setPhotoFiles(prev => prev.filter(file => file.name !== fileName))
  }

  const { handleSave: handleTableSave } = useHandlers<FormData>({
    data: [formData],
    checkedIds: [],
    onSave: () => onSave({ risk_factor: formData.content, place: formData.place, photofiles: photoFiles }),
  })

  const handleSave = () => {
    if (!validateForm(formData)) return
    handleTableSave()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>아차사고 등록</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          <FormScreen fields={fields} values={formData} onChange={handleChange} onFileChange={handlePhotoChange} onFileRemove={handlePhotoRemove} onClose={onClose} onSave={handleSave} isModal />
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
