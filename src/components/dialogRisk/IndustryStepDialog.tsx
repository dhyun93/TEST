import { useState } from "react"
import { X } from "lucide-react"
import IndustrySelectDialog from "./IndustrySelectDialog"
import IndustryTypeDialog from "./IndustryTypeDialog"
import Button from "@/components/common/base/Button"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

type IndustryStepDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { industry: unknown; processIds: number[] }) => void
}

export default function IndustryStepDialog({ isOpen, onClose, onSubmit }: IndustryStepDialogProps) {
  const [step, setStep] = useState(1)
  const [selectedIndustry, setSelectedIndustry] = useState<unknown>(null)
  const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([])

  const handleNext = () => {
    if (selectedIndustry) setStep(2)
    else alert("업종을 선택해주세요")
  }

  const handleBack = () => {
    setStep(1)
    setSelectedProcessIds([])
  }

  const handleConfirm = () => {
    if (selectedIndustry && selectedProcessIds.length > 0) {
      onSubmit({ industry: selectedIndustry, processIds: selectedProcessIds })
      handleClose()
    } else if (selectedProcessIds.length === 0) {
      alert("공정을 선택해주세요")
    }
  }

  const handleClose = () => {
    onClose()
    setStep(1)
    setSelectedIndustry(null)
    setSelectedProcessIds([])
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className="bg-white w-full md:w-[85vw] md:h-[90vh] rounded-none md:rounded-2xl p-4 md:p-6 shadow-lg flex flex-col dialog-mobile-height">
        <div className={DIALOG_STYLES.headerNoBorder}>
          <h2 className={DIALOG_STYLES.title}>{step === 1 ? "업종 선택" : "공정 선택"}</h2>
          <button onClick={handleClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {step === 1 ? (
            <IndustrySelectDialog selectedIndustry={selectedIndustry as any} setSelectedIndustry={setSelectedIndustry} />
          ) : (
            <IndustryTypeDialog industry={selectedIndustry} selectedIds={selectedProcessIds} onSelectIds={setSelectedProcessIds} />
          )}
        </div>

        <div className={DIALOG_STYLES.footerGap}>
          {step === 1 && (
            <Button variant="primary" onClick={handleNext}>
              다음으로
            </Button>
          )}
          {step === 2 && (
            <>
              <Button variant="primaryOutline" onClick={handleBack}>
                이전
              </Button>
              <Button variant="primary" onClick={handleConfirm} disabled={selectedProcessIds.length === 0}>
                확인
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
