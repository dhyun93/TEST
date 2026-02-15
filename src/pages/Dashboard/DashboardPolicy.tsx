import React, { useEffect, useState } from "react"
import { ShieldCheckIcon, FlagIcon } from "@heroicons/react/24/solid"
import { X } from "lucide-react"
import { policyGoalMockData, inspectionItemsMockData, budgetItemsMockData } from "@/data/mockBusinessData"
import YearPicker from "@/components/common/inputs/YearPicker"

type Policy = { id: number; title: string; btnText: string }
const policies: Policy[] = [
  { id: 1, title: "안전보건경영방침", btnText: "안전보건경영방침" },
  { id: 2, title: "안전보건목표", btnText: "안전보건목표" },
]

const BORDER_CLASS = "border-[var(--border)]"
const TEXT_PRIMARY = "text-gray-800"
const TEXT_SECONDARY = "text-gray-500"
const currentYear = new Date().getFullYear().toString()

const PolicyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null
  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[800px] p-4 md:p-6 shadow-2xl max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between mb-4 h-[36px] shrink-0">
          <h2 className={`text-base md:text-lg font-semibold tracking-tight ${TEXT_PRIMARY}`}>안전보건경영방침</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <div className="bg-gray-50 rounded-lg p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-4">방침목표명: {policyGoalMockData.goalTitle}</h3>
            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700 leading-relaxed">{policyGoalMockData.content}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatCurrency = (value: string) => {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10)
  return isNaN(num) ? "0원" : num.toLocaleString() + "원"
}

const GoalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [inspYear, setInspYear] = useState(currentYear)
  const [budgetYear, setBudgetYear] = useState(currentYear)

  const filteredInspItems = inspectionItemsMockData.filter(item => item.year === inspYear)
  const filteredBudgetItems = budgetItemsMockData.filter(item => item.year === budgetYear)

  const budgetSummary = filteredBudgetItems.reduce(
    (acc, item) => {
      const budget = parseInt(item.budget.replace(/[^0-9]/g, ""), 10) || 0
      const spent = parseInt(item.spent.replace(/[^0-9]/g, ""), 10) || 0
      const remaining = parseInt(item.remaining.replace(/[^0-9]/g, ""), 10) || 0
      return {
        totalBudget: acc.totalBudget + budget,
        totalSpent: acc.totalSpent + spent,
        totalRemaining: acc.totalRemaining + remaining,
      }
    },
    { totalBudget: 0, totalSpent: 0, totalRemaining: 0 }
  )

  if (!isOpen) return null
  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-[1200px] p-3 sm:p-4 md:p-6 shadow-2xl max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between mb-4 h-[36px] shrink-0">
          <h2 className={`text-base md:text-lg font-semibold tracking-tight ${TEXT_PRIMARY}`}>안전보건 목표 및 예산</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-all relative ${
              activeTab === 0 ? "text-[#1E3C6B] border-b-2 border-[#1E3C6B]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            안전보건 목표 및 추진계획
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-all relative ${
              activeTab === 1 ? "text-[#1E3C6B] border-b-2 border-[#1E3C6B]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            안전보건예산
          </button>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {activeTab === 0 ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">총 {filteredInspItems.length}건</span>
                <YearPicker year={inspYear} onChange={setInspYear} />
              </div>
              <div className={`border ${BORDER_CLASS} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-[var(--neutral-bg)]">
                      <tr>
                        <th className={`border-b ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center`}>No</th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center min-w-[120px] md:min-w-[200px]`}
                        >
                          세부추진계획
                        </th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center`} colSpan={4}>
                          추진계획(분기)
                        </th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center min-w-[100px] md:min-w-[150px]`}
                        >
                          KPI
                        </th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center min-w-[80px]`}>
                          담당부서
                        </th>
                      </tr>
                      <tr>
                        <th className={`border-b ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY}`}></th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY}`}></th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY} text-center`}>1분기</th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY} text-center`}>2분기</th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY} text-center`}>3분기</th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY} text-center`}>4분기</th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY}`}></th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-1 text-[10px] md:text-xs ${TEXT_SECONDARY}`}></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredInspItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={`border-b ${BORDER_CLASS} px-4 py-8 text-center text-gray-400`}>
                            해당 연도의 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredInspItems.map((item, idx) => (
                          <tr key={item.id}>
                            <td className={`border-b ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-center`}>{idx + 1}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY}`}>{item.detailPlan}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-center`}>
                              <div className="flex items-center justify-center">
                                <input type="checkbox" checked={item.q1} readOnly className="w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
                              </div>
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-center`}>
                              <div className="flex items-center justify-center">
                                <input type="checkbox" checked={item.q2} readOnly className="w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
                              </div>
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-center`}>
                              <div className="flex items-center justify-center">
                                <input type="checkbox" checked={item.q3} readOnly className="w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
                              </div>
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-center`}>
                              <div className="flex items-center justify-center">
                                <input type="checkbox" checked={item.q4} readOnly className="w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
                              </div>
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY}`}>{item.KPI}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-center`}>{item.department}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">총 {filteredBudgetItems.length}건</span>
                <YearPicker year={budgetYear} onChange={setBudgetYear} />
              </div>

              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">총 예산:</span>
                  <span className="text-sm font-semibold text-[#333]">{formatCurrency(budgetSummary.totalBudget.toString())}</span>
                </div>
                <div className="w-px h-4 bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">집행액:</span>
                  <span className="text-sm font-semibold text-[#555]">{formatCurrency(budgetSummary.totalSpent.toString())}</span>
                </div>
                <div className="w-px h-4 bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">잔액:</span>
                  <span className="text-sm font-semibold text-[#333]">{formatCurrency(budgetSummary.totalRemaining.toString())}</span>
                </div>
              </div>

              <div className={`border ${BORDER_CLASS} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-[var(--neutral-bg)]">
                      <tr>
                        <th className={`border-b ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center`}>No</th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center min-w-[60px]`}>분기</th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-left min-w-[120px] md:min-w-[180px]`}
                        >
                          항목명
                        </th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-left min-w-[150px] md:min-w-[200px]`}
                        >
                          세부내역
                        </th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-right min-w-[100px] md:min-w-[120px]`}
                        >
                          예산
                        </th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-right min-w-[100px] md:min-w-[120px]`}
                        >
                          지출
                        </th>
                        <th
                          className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-right min-w-[100px] md:min-w-[120px]`}
                        >
                          잔액
                        </th>
                        <th className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 md:px-3 py-2 text-[11px] md:text-sm font-medium ${TEXT_SECONDARY} text-center min-w-[80px]`}>작성자</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredBudgetItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={`border-b ${BORDER_CLASS} px-4 py-8 text-center text-gray-400`}>
                            해당 연도의 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredBudgetItems.map((item, idx) => (
                          <tr key={item.id}>
                            <td className={`border-b ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-center`}>{idx + 1}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-center`}>{item.quarter}분기</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY}`}>{item.itemName}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_SECONDARY}`}>{item.category}</td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-right font-medium`}>
                              {formatCurrency(item.budget)}
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_SECONDARY} text-right font-medium`}>
                              {formatCurrency(item.spent)}
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-right font-medium`}>
                              {formatCurrency(item.remaining)}
                            </td>
                            <td className={`border-b ${BORDER_CLASS} border-l ${BORDER_CLASS} px-2 py-2 text-[11px] md:text-[13px] ${TEXT_PRIMARY} text-center`}>{item.author}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardPolicy: React.FC = () => {
  const [modalType, setModalType] = useState<"policy" | "goal" | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 767)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  const openModal = (type: "policy" | "goal") => setModalType(type)
  const closeModal = () => setModalType(null)
  const IconFor = (id: number) => (id === 1 ? ShieldCheckIcon : FlagIcon)

  return (
    <>
      {isMobile ? (
        <div className="flex gap-2">
          {policies.map(p => (
            <button
              key={p.id}
              className="flex-1 inline-flex items-center justify-center text-sm font-medium rounded-lg h-[44px] sm:h-[50px] px-3 sm:px-4 bg-[#031E36] text-white hover:bg-black transition-colors"
              onClick={() => openModal(p.id === 1 ? "policy" : "goal")}
              type="button"
            >
              {p.btnText}
            </button>
          ))}
        </div>
      ) : (
        policies.map(p => {
          const Icon = IconFor(p.id)
          return (
            <article key={p.id} className="rounded-[16px] bg-white shadow-sm border border-[#E0E6EA] px-4 py-4">
              <div className="grid grid-cols-10 items-center min-h-[90px]">
                <div className="col-span-7 min-w-0 h-full flex flex-col justify-center">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-tight">{p.title}</h3>
                  <button
                    className="mt-1 inline-flex items-center rounded-lg whitespace-nowrap text-xs sm:text-sm transition-colors duration-300 bg-[#031E36] text-white px-6 py-3 hover:bg-black"
                    onClick={() => openModal(p.id === 1 ? "policy" : "goal")}
                    type="button"
                  >
                    {p.btnText} 확인하기
                  </button>
                </div>
                <div className="col-span-3 h-full flex items-center justify-end">
                  <div className="w-10 h-10 rounded-md bg-[#F4F7FA] ring-1 ring-[#E6EDF2] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#031E36]" />
                  </div>
                </div>
              </div>
            </article>
          )
        })
      )}
      <PolicyModal isOpen={modalType === "policy"} onClose={closeModal} />
      <GoalModal isOpen={modalType === "goal"} onClose={closeModal} />
    </>
  )
}

export default DashboardPolicy
