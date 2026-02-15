import React from "react"
import { List, Edit2, Settings } from "lucide-react"

type StepBarProps = {
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}

const steps = [
  { label: "유해위험요인 파악", icon: List },
  { label: "위험성평가", icon: Edit2 },
  { label: "감소대책 및 개선관리", icon: Settings },
]

const StepBar: React.FC<StepBarProps> = ({ currentStep }) => (
  <div className="w-full mt-3 mb-3">
    <div className="w-full bg-white px-3 py-3 border border-[#DDDDDD] rounded-[13px] h-[66px] md:flex hidden">
      <div className="flex items-center justify-center w-full">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep
          const Icon = step.icon
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${isActive ? "bg-[#FF3300] text-white" : "bg-gray-200 text-gray-400"}`}>
                  <Icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-normal ${isActive ? "text-gray-900" : "text-gray-400"}`}>Step {idx + 1}</span>
                  <span className={`text-sm font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                </div>
              </div>
              {idx !== steps.length - 1 && (
                <div className="flex items-center px-5">
                  <div className="w-6 border-t border-[#DDDDDD]" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>

    <div className="w-full bg-white px-3 py-2 border border-[#DDDDDD] rounded-[13px] flex items-center justify-between gap-2 md:hidden">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep
        const Icon = step.icon
        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold shrink-0 ${isActive ? "bg-[#FF3300] text-white" : "bg-gray-200 text-gray-400"}`}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className={`text-[11px] font-normal truncate ${isActive ? "text-gray-900" : "text-gray-400"}`}>Step {idx + 1}</span>
                <span className={`text-xs font-semibold truncate ${isActive ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
              </div>
            </div>
            {idx !== steps.length - 1 && <div className="w-4 border-t border-[#DDDDDD]" />}
          </React.Fragment>
        )
      })}
    </div>
  </div>
)

export default StepBar
