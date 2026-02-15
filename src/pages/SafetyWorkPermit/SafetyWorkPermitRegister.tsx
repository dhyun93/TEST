import React, { useState, useMemo } from "react"
import Button from "@/components/common/base/Button"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import RadioGroup from "@/components/common/base/RadioGroup"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import UserSelectModal, { SelectedUser } from "@/components/dialog/UserSelectModal"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import useHandlers from "@/hooks/useHandlers"
import useForm, { ValidationRules } from "@/hooks/useForm"
import useApproval from "@/hooks/useApproval"
import { X, UserPlus, Trash2 } from "lucide-react"
import { RISK_LEVEL_OPTIONS } from "@/constants/options/safetyWorkPermit"

type Reviewer = {
  role: string // 역할 (생산반장, 생산팀장 등)
  user_id: number
  name: string
  position: string // 안전직위
  rank: string // 직급
  phone: string
  subject: string // 부서
}

type FormData = {
  workType: string
  workContent: string
  hazardFactors: string
  risk_level: string
  safetyPlan: string
  workLocation: string
  startDate: string
  endDate: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  workerCount: string
  note: string
  fileUpload: string
  reviewers: Reviewer[] // 검토 및 서명란
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => void
  isEdit?: boolean
}

export default function SafetyWorkPermitRegister({ isOpen, onClose, onSave, isEdit }: Props) {
  const [formData, setFormData] = useState<FormData>({
    workType: "",
    workContent: "",
    hazardFactors: "",
    risk_level: "높음",
    safetyPlan: "",
    workLocation: "",
    startDate: "",
    endDate: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    workerCount: "",
    note: "",
    fileUpload: "",
    reviewers: [],
  })

  const [userSelectModalOpen, setUserSelectModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")

  const validationRules = useMemo<ValidationRules>(
    () => ({
      workType: { required: true },
      workContent: { required: true },
      hazardFactors: { required: true },
      safetyPlan: { required: true },
      workLocation: { required: true },
      startDate: { required: true },
      endDate: { required: true },
      workerCount: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const { isDialogOpen, approvalLineName, approvers, defaultContent: approvalDefaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "작업중지요청" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (name === "workerCount" && value !== "" && !/^\d+$/.test(value)) return
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const doSave = () => {
    onSave(formData)
  }

  const handleSave = () => {
    if (!validateForm(formData)) return
    checkAndSave(doSave, formData.workContent)
  }

  const handleAddReviewer = (role: string) => {
    setSelectedRole(role)
    setUserSelectModalOpen(true)
  }

  const handleUserSelect = (user: SelectedUser) => {
    const newReviewer: Reviewer = {
      role: selectedRole,
      user_id: user.id,
      name: user.name,
      position: user.position,
      rank: user.rank,
      phone: user.phone,
      subject: user.subject,
    }

    setFormData(prev => ({
      ...prev,
      reviewers: [...prev.reviewers.filter(r => r.role !== selectedRole), newReviewer],
    }))
  }

  const handleRemoveReviewer = (role: string) => {
    setFormData(prev => ({
      ...prev,
      reviewers: prev.reviewers.filter(r => r.role !== role),
    }))
  }

  const getReviewerByRole = (role: string): Reviewer | undefined => {
    return formData.reviewers.find(r => r.role === role)
  }

  const workTypeOptions = [
    { value: "밀폐공간", label: "밀폐공간 작업" },
    { value: "고소작업", label: "고소작업(2m 이상)" },
    { value: "화기작업", label: "화기작업(용접·절단 등)" },
    { value: "전기작업", label: "전기작업(고압 포함)" },
    { value: "중량물작업", label: "중량물 취급작업(하역·운반)" },
    { value: "크레인작업", label: "양중작업(크레인·호이스트 등)" },
    { value: "굴착작업", label: "굴착작업(지반굴착 등)" },
    { value: "방사선작업", label: "방사선 취급작업" },
    { value: "화학물질작업", label: "유해화학물질 취급작업" },
    { value: "지게차작업", label: "지게차 작업" },
    { value: "이동식기계작업", label: "이동식 기계·설비 작업" },
    { value: "고정식기계작업", label: "고정식 기계작업(프레스·전단기 등)" },
    { value: "기타", label: "기타 위험작업" },
  ]

  const fields: Field[] = [
    { label: "작업유형", name: "workType", type: "select", options: workTypeOptions, placeholder: "작업유형 선택", required: true, hasError: isFieldInvalid("workType") },
    { label: "작업내용", name: "workContent", type: "textarea", placeholder: "작업내용 입력", required: true, hasError: isFieldInvalid("workContent") },
    { label: "잠재 위험요소", name: "hazardFactors", type: "text", placeholder: "잠재 위험요소 입력", required: true, hasError: isFieldInvalid("hazardFactors") },
    {
      label: "위험수준",
      name: "risk_level",
      type: "custom",
      customRender: (
        <RadioGroup
          name="risk_level"
          value={formData.risk_level}
          options={RISK_LEVEL_OPTIONS.map(opt => ({ value: opt.label, label: opt.label }))}
          onChange={handleChange}
        />
      ),
    },
    { label: "안전조치 계획", name: "safetyPlan", type: "textarea", placeholder: "안전조치 계획 입력", required: true, hasError: isFieldInvalid("safetyPlan") },
    { label: "작업장소", name: "workLocation", type: "text", placeholder: "작업장소 입력", required: true, hasError: isFieldInvalid("workLocation") },
    { label: "작업기간", name: "workPeriod", type: "daterange", required: true, hasError: isFieldInvalid("startDate") || isFieldInvalid("endDate") },
    { label: "작업시간", name: "workTime", type: "timeRange", required: true },
    { label: "작업인원", name: "workerCount", type: "quantity", placeholder: "인원수 입력", required: true, hasError: isFieldInvalid("workerCount") },
    { label: "비고", name: "note", type: "textarea", placeholder: "비고 입력", required: false },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
  ]

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerLg}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>작업중지요청 {isEdit ? "편집" : "등록"}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className={DIALOG_STYLES.content}>
          {/* 검토 및 서명란 섹션 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus size={18} />
              검토 및 서명란
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              💡 각 역할별 검토자를 조직도에서 선택하세요. 저장 후 선택된 검토자에게 카카오톡으로 서명 요청이 발송됩니다.
            </p>

            <div className="space-y-3">
              {["생산반장", "생산팀장", "안전담당자", "승인자"].map(role => {
                const reviewer = getReviewerByRole(role)
                return (
                  <div key={role} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">{role}</div>
                      {reviewer ? (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">{reviewer.name}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span>{reviewer.subject}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span>{reviewer.rank}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span>{reviewer.phone}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">미선택</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="primaryOutline" onClick={() => handleAddReviewer(role)} className="text-xs px-3 py-1">
                        {reviewer ? "변경" : "선택"}
                      </Button>
                      {reviewer && (
                        <Button variant="action" onClick={() => handleRemoveReviewer(role)} className="text-xs px-2 py-1">
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 기존 작업 정보 입력 폼 */}
          <FormScreen fields={fields} values={formData} onChange={handleChange} onClose={onClose} onSave={handleSave} isModal />
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
      <ApprovalConfirmDialog
        isOpen={isDialogOpen}
        documentType="작업중지요청"
        approvalLineName={approvalLineName}
        approvers={approvers}
        defaultContent={approvalDefaultContent}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancel}
      />
      <UserSelectModal
        isOpen={userSelectModalOpen}
        onClose={() => setUserSelectModalOpen(false)}
        onSelect={handleUserSelect}
        title={`${selectedRole} 선택`}
      />
    </div>
  )
}
