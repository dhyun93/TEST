import React, { useRef, useState } from "react"
import { X, Circle } from "lucide-react"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { routineChecklistItemsMockData } from "@/data/mockData"
import LoadListDialog, { RoutineListItem, ROUTINE_LIST_COLUMNS, ROUTINE_LIST_MOCK_DATA } from "@/components/dialog/LoadListDialog"
import { useInspectionRoutineHandlers } from "@/hooks/useHandlers"

interface PatrolData {
  id: number
  weekStart: string
  location: string
  dailyData: {
    [key: string]: {
      inspector: string
      signature: string
      headcount: number
      items: { [itemId: string]: "O" | "X" | "" }
    }
  }
  notes: string
  managerInstructions: string
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const BORDER_CLASS = "border-[var(--border)]"
const TEXT_SECONDARY = "text-gray-500"
const TEXT_SIZE_XS = "text-xs"
const CELL_CLASS = `border ${BORDER_CLASS} px-2 py-1.5 ${TEXT_SIZE_XS}`
const HEADER_CELL_CLASS = `${CELL_CLASS} bg-gray-50 font-medium text-center ${TEXT_SECONDARY}`
const CELL_HOVER = "cursor-pointer hover:bg-gray-50"

const MOCK_SIGNATURES = ["/images/signature-1.png", "/images/signature-2.png", "/images/signature-3.png"]

const MOCK_PHOTOS_BY_DAY: { [day: string]: { photo: string; category: string; content: string }[] } = {
  월: [
    { photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", category: "보호구", content: "작업에 적합한 보호구 준비 및 착용 여부" },
    { photo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80", category: "보호구", content: "안전검사에 합격한 보호구 지급 및 성능 여부" },
  ],
  화: [
    { photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", category: "관리", content: "안전작업 연장 승인 여부 (일정, 야간작업)" },
    { photo: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80", category: "관리", content: "안전교육 미필자 작업투입 여부" },
  ],
  수: [
    { photo: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80", category: "전기", content: "전원 Cable의 손상 및 절연상태" },
    { photo: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80", category: "전기", content: "콘센트, 기계기구의 접지 상태" },
  ],
  목: [
    { photo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", category: "추락", content: "고소작업(1.8M)에서의 안전대, 안전모 착용" },
    { photo: "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=800&q=80", category: "추락", content: "이동식 사다리의 기능 상태" },
  ],
  금: [
    { photo: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", category: "화재예방", content: "소화기 비치 및 사용가능 여부" },
    { photo: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80", category: "화재예방", content: "불티비산 방지조치 및 화재감시자 배치 여부" },
  ],
}

interface InspectionRoutineProps {
  listOpen: boolean
  onListClose: () => void
  registerOpen: boolean
  onRegisterClose: () => void
  mode: "view" | "edit"
  data?: PatrolData
}

export default function InspectionRoutine({ listOpen, onListClose, registerOpen, onRegisterClose, mode, data }: InspectionRoutineProps) {
  const listPrintRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<{ [day: string]: { [itemId: string]: "O" | "X" | "" } }>({})
  const [inspectors, setInspectors] = useState<{ [day: string]: string }>({})
  const [signatures, setSignatures] = useState<{ [day: string]: string }>({})
  const [headcounts, setHeadcounts] = useState<{ [day: string]: string }>({})
  const [notes, setNotes] = useState("")
  const [managerInstructions, setManagerInstructions] = useState("")
  const [checkDates, setCheckDates] = useState<{ [day: string]: string }>({})
  const [selectedListItem, setSelectedListItem] = useState<RoutineListItem | null>(null)

  const { handleItemClick, getItemValue, handleSave, handlePrintFromList } = useInspectionRoutineHandlers({
    formData,
    setFormData,
    checkDates,
    mode,
    days: DAYS,
    listPrintRef,
    setSelectedListItem,
    mockData: ROUTINE_LIST_MOCK_DATA,
    onRegisterClose,
  })

  const isEditMode = mode === "edit"
  let itemIndex = 0

  const daysWithPhotos = DAYS.filter(day => MOCK_PHOTOS_BY_DAY[day]?.length > 0)
  const totalPages = 1 + daysWithPhotos.length

  return (
    <>
      <LoadListDialog<RoutineListItem>
        isOpen={listOpen}
        items={ROUTINE_LIST_MOCK_DATA}
        onClose={onListClose}
        title="안전순회 점검일지"
        columns={ROUTINE_LIST_COLUMNS}
        emptyMessage="등록된 안전순회 점검일지가 없습니다."
        searchKeys={["inspector", "inspectionDate"]}
        actionLabel="인쇄"
        singleSelect={true}
        onChangeSelected={handlePrintFromList}
      />

      {registerOpen && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-none md:rounded-2xl w-full md:w-[900px] md:max-w-[95vw] p-4 md:p-6 shadow-2xl md:h-[95vh] flex flex-col relative dialog-mobile-height">
            <div className="flex items-center justify-end mb-2 shrink-0 print:hidden">
              <button onClick={onRegisterClose} className="p-1 hover:bg-[var(--neutral-bg)] rounded transition text-[var(--neutral)]">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="bg-white p-4">
                <div className="flex items-center mb-4">
                  <div className="flex-1 flex justify-center items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">안전순회 점검일지</h1>
                  </div>
                  <table className={`border-collapse border ${BORDER_CLASS} shrink-0`}>
                    <tbody>
                      <tr>
                        <td rowSpan={2} className={`border ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium text-gray-700 text-center align-middle bg-gray-50 w-8`}>
                          <div className="flex flex-col items-center gap-2.5">
                            <span>결</span>
                            <span>재</span>
                          </div>
                        </td>
                        <td className={`border ${BORDER_CLASS} bg-gray-50 px-3 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center w-16`}>담당</td>
                        <td className={`border ${BORDER_CLASS} bg-gray-50 px-3 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center w-16`}>검토</td>
                        <td className={`border ${BORDER_CLASS} bg-gray-50 px-2 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center whitespace-nowrap`}>관리책임자</td>
                      </tr>
                      <tr>
                        <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                        <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                        <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <table className={`w-full border-collapse border ${BORDER_CLASS}`}>
                  <tbody>
                    <tr>
                      <td className={HEADER_CELL_CLASS} style={{ width: "8%" }}>
                        점검장소
                      </td>
                      <td className={`${CELL_CLASS} text-center`} style={{ width: "10%" }}>
                        사업장 전체
                      </td>
                      <td className={HEADER_CELL_CLASS} style={{ width: "6%" }}>
                        점검일
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className={`${CELL_CLASS} text-center`} style={{ width: `${76 / 7}%` }}>
                          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={checkDates[day] || ""}
                                onChange={e => {
                                  const value = e.target.value.replace(/[^0-9]/g, "")
                                  setCheckDates(prev => ({ ...prev, [day]: value }))
                                }}
                                className={`w-10 h-5 text-center ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none`}
                              />
                            ) : (
                              <span className={TEXT_SIZE_XS}>{checkDates[day] || ""}</span>
                            )}
                            <span className={`${TEXT_SIZE_XS} ${TEXT_SECONDARY}`}>/{day}</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td rowSpan={3} colSpan={2} className={`${CELL_CLASS} ${TEXT_SIZE_XS} text-gray-600 align-middle text-center leading-relaxed`}>
                        ※건설기계 등<br />
                        중장비 작업 시<br />
                        별도 점검일지 사용
                      </td>
                      <td className={HEADER_CELL_CLASS} style={{ width: "6%" }}>
                        점검자
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className={`${CELL_CLASS} text-center`}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={inspectors[day] || ""}
                              onChange={e => setInspectors(prev => ({ ...prev, [day]: e.target.value }))}
                              className={`w-full h-6 text-center ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none`}
                            />
                          ) : (
                            <span className={TEXT_SIZE_XS}>{data?.dailyData?.[day]?.inspector || ""}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className={HEADER_CELL_CLASS} style={{ width: "6%" }}>
                        서명
                      </td>
                      {DAYS.map((day, idx) => (
                        <td key={day} className={`${CELL_CLASS} text-center h-10`}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={signatures[day] || ""}
                              onChange={e => setSignatures(prev => ({ ...prev, [day]: e.target.value }))}
                              className={`w-full h-6 text-center ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none`}
                            />
                          ) : (
                            <img src={MOCK_SIGNATURES[idx % MOCK_SIGNATURES.length]} alt="서명" className="h-8 w-auto mx-auto object-contain" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className={HEADER_CELL_CLASS} style={{ width: "6%" }}>
                        출력인원
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className={`${CELL_CLASS} text-center`}>
                          {isEditMode ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="text"
                                value={headcounts[day] || ""}
                                onChange={e => {
                                  const value = e.target.value.replace(/[^0-9]/g, "")
                                  setHeadcounts(prev => ({ ...prev, [day]: value }))
                                }}
                                className={`w-8 h-5 text-center ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none`}
                              />
                              <span className={`${TEXT_SIZE_XS} ${TEXT_SECONDARY}`}>명</span>
                            </div>
                          ) : (
                            <span className={TEXT_SIZE_XS}>{data?.dailyData?.[day]?.headcount ? `${data.dailyData[day].headcount}명` : ""}</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td colSpan={3} className={HEADER_CELL_CLASS}>
                        점 검 항 목
                      </td>
                      <td colSpan={7} className={`${HEADER_CELL_CLASS} text-left pl-3`}>
                        점검결과 표시방법{" "}
                        <span className="inline-flex items-center gap-2 ml-2 px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700 font-normal">
                          <span className="text-[var(--primary)] font-medium">O</span>:양호 / <span className="text-red-600 font-medium">X</span>:불량
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className={HEADER_CELL_CLASS} style={{ width: "8%" }}>
                        구분
                      </td>
                      <td colSpan={2} className={HEADER_CELL_CLASS} style={{ width: "16%" }}>
                        점검내용
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className={HEADER_CELL_CLASS} style={{ width: `${76 / 7}%` }}>
                          {day}
                        </td>
                      ))}
                    </tr>

                    {routineChecklistItemsMockData.map(section =>
                      section.items.map((item, idx) => {
                        const currentItemIndex = itemIndex++
                        const itemId = `item-${currentItemIndex}`
                        return (
                          <tr key={itemId}>
                            {idx === 0 && (
                              <td rowSpan={section.items.length} className={`${HEADER_CELL_CLASS} align-middle`} style={{ width: "8%" }}>
                                {section.category.length === 4 ? (
                                  <>
                                    {section.category.slice(0, 2)}
                                    <br />
                                    {section.category.slice(2)}
                                  </>
                                ) : (
                                  section.category
                                )}
                              </td>
                            )}
                            <td colSpan={2} className={`${CELL_CLASS} ${TEXT_SIZE_XS} text-left whitespace-nowrap`}>
                              {item}
                            </td>
                            {DAYS.map(day => {
                              const value = getItemValue(day, itemId)
                              return (
                                <td key={day} className={`${CELL_CLASS} text-center`}>
                                  {isEditMode ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <div onClick={() => handleItemClick(itemId, day, "O")} className={`flex items-center justify-center w-6 h-6 rounded ${CELL_HOVER}`}>
                                        <Circle size={14} className={`transition-colors ${value === "O" ? "text-[var(--primary)]" : "text-gray-300"}`} strokeWidth={2.5} />
                                      </div>
                                      <div onClick={() => handleItemClick(itemId, day, "X")} className={`flex items-center justify-center w-6 h-6 rounded ${CELL_HOVER}`}>
                                        <X size={14} className={`transition-colors ${value === "X" ? "text-red-700" : "text-gray-300"}`} strokeWidth={2.5} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      {value === "O" && <Circle size={14} className="text-[var(--primary)]" strokeWidth={2.5} />}
                                      {value === "X" && <X size={14} className="text-red-700" strokeWidth={2.5} />}
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })
                    )}

                    <tr className="notes-row">
                      <td colSpan={2} className={`${HEADER_CELL_CLASS} text-center align-middle`}>
                        특이사항 및 위험요인
                        <br />
                        (일자, 장소 표시 후 기록)
                      </td>
                      <td colSpan={8} className={`${CELL_CLASS} align-top`}>
                        {isEditMode ? (
                          <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`w-full h-14 ${TEXT_SIZE_XS} outline-none resize-none border ${BORDER_CLASS} rounded p-2`} />
                        ) : (
                          <span className={`${TEXT_SIZE_XS} whitespace-pre-wrap`}>{data?.notes || notes || "-"}</span>
                        )}
                      </td>
                    </tr>

                    <tr className="notes-row">
                      <td colSpan={2} className={`${HEADER_CELL_CLASS} text-center align-middle`}>
                        관리책임자
                        <br />
                        안전점검 지시사항
                      </td>
                      <td colSpan={8} className={`${CELL_CLASS} align-top`}>
                        {isEditMode ? (
                          <textarea
                            value={managerInstructions}
                            onChange={e => setManagerInstructions(e.target.value)}
                            className={`w-full h-14 ${TEXT_SIZE_XS} outline-none resize-none border ${BORDER_CLASS} rounded p-2`}
                          />
                        ) : (
                          <span className={`${TEXT_SIZE_XS} whitespace-pre-wrap`}>{data?.managerInstructions || managerInstructions || "-"}</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-end py-2">
              <button onClick={handleSave} className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg bg-[var(--primary)] text-white transition-opacity duration-200 hover:opacity-80">
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedListItem && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={listPrintRef} className="bg-white p-4" style={{ width: "800px" }}>
            <div className="print-first-page">
              <div className="flex items-center mb-4">
                <div className="flex-1 flex justify-center items-center">
                  <h1 className="text-2xl font-semibold text-gray-900">안전순회 점검일지</h1>
                </div>
                <table className={`border-collapse border ${BORDER_CLASS} shrink-0`}>
                  <tbody>
                    <tr>
                      <td rowSpan={2} className={`border ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium text-gray-700 text-center align-middle bg-gray-50 w-8`}>
                        <div className="flex flex-col items-center gap-2.5">
                          <span>결</span>
                          <span>재</span>
                        </div>
                      </td>
                      <td className={`border ${BORDER_CLASS} bg-gray-50 px-3 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center w-16`}>담당</td>
                      <td className={`border ${BORDER_CLASS} bg-gray-50 px-3 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center w-16`}>검토</td>
                      <td className={`border ${BORDER_CLASS} bg-gray-50 px-2 py-1 ${TEXT_SIZE_XS} font-medium text-gray-600 text-center whitespace-nowrap`}>관리책임자</td>
                    </tr>
                    <tr>
                      <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                      <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                      <td className={`border ${BORDER_CLASS} h-10 w-16`}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <table className={`w-full border-collapse border ${BORDER_CLASS}`}>
                <tbody>
                  <tr>
                    <td className={HEADER_CELL_CLASS} style={{ width: "8%" }}>
                      점검장소
                    </td>
                    <td className={`${CELL_CLASS} text-center`} style={{ width: "10%" }}>
                      사업장 전체
                    </td>
                    <td className={HEADER_CELL_CLASS} style={{ width: "6%" }}>
                      점검일
                    </td>
                    {DAYS.map((day, idx) => {
                      const dateRange = selectedListItem.inspectionDate.split(" ~ ")
                      const startDate = new Date(dateRange[0])
                      const dayDate = new Date(startDate)
                      dayDate.setDate(startDate.getDate() + idx)
                      const dateStr = String(dayDate.getDate()).padStart(2, "0")
                      return (
                        <td key={day} className={`${CELL_CLASS} text-center`} style={{ width: `${76 / 7}%` }}>
                          <span className={TEXT_SIZE_XS}>
                            {dateStr}/{day}
                          </span>
                        </td>
                      )
                    })}
                  </tr>

                  <tr>
                    <td rowSpan={3} colSpan={2} className={`${CELL_CLASS} ${TEXT_SIZE_XS} text-gray-600 align-middle text-center leading-relaxed`}>
                      ※건설기계 등<br />
                      중장비 작업 시<br />
                      별도 점검일지 사용
                    </td>
                    <td className={HEADER_CELL_CLASS}>점검자</td>
                    {DAYS.map(day => (
                      <td key={day} className={`${CELL_CLASS} text-center`}>
                        <span className={TEXT_SIZE_XS}>{selectedListItem.inspector}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={HEADER_CELL_CLASS}>서명</td>
                    {DAYS.map((day, idx) => (
                      <td key={day} className={`${CELL_CLASS} text-center h-10`}>
                        <img src={MOCK_SIGNATURES[idx % MOCK_SIGNATURES.length]} alt="서명" className="h-8 w-auto mx-auto object-contain" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={HEADER_CELL_CLASS}>출력인원</td>
                    {DAYS.map(day => (
                      <td key={day} className={`${CELL_CLASS} text-center`}>
                        <span className={TEXT_SIZE_XS}>-</span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td colSpan={3} className={HEADER_CELL_CLASS}>
                      점 검 항 목
                    </td>
                    <td colSpan={7} className={`${HEADER_CELL_CLASS} text-left pl-3`}>
                      점검결과 표시방법{" "}
                      <span className="inline-flex items-center gap-2 ml-2 px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700 font-normal">
                        <span className="text-[var(--primary)] font-medium">O</span>:양호 / <span className="text-red-600 font-medium">X</span>:불량
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className={HEADER_CELL_CLASS} style={{ width: "8%" }}>
                      구분
                    </td>
                    <td colSpan={2} className={HEADER_CELL_CLASS} style={{ width: "16%" }}>
                      점검내용
                    </td>
                    {DAYS.map(day => (
                      <td key={day} className={HEADER_CELL_CLASS} style={{ width: `${76 / 7}%` }}>
                        {day}
                      </td>
                    ))}
                  </tr>

                  {routineChecklistItemsMockData.map(section =>
                    section.items.map((item, idx) => (
                      <tr key={`${section.category}-${idx}`}>
                        {idx === 0 && (
                          <td rowSpan={section.items.length} className={`${HEADER_CELL_CLASS} align-middle`} style={{ width: "8%" }}>
                            {section.category.length === 4 ? (
                              <>
                                {section.category.slice(0, 2)}
                                <br />
                                {section.category.slice(2)}
                              </>
                            ) : (
                              section.category
                            )}
                          </td>
                        )}
                        <td colSpan={2} className={`${CELL_CLASS} ${TEXT_SIZE_XS} text-left whitespace-nowrap`}>
                          {item}
                        </td>
                        {DAYS.map(day => (
                          <td key={day} className={`${CELL_CLASS} text-center`}>
                            <Circle size={14} className="text-[var(--primary)] mx-auto" strokeWidth={2.5} />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}

                  <tr>
                    <td colSpan={2} className={`${HEADER_CELL_CLASS} text-center align-middle`}>
                      특이사항 및 위험요인
                      <br />
                      (일자, 장소 표시 후 기록)
                    </td>
                    <td colSpan={8} className={`${CELL_CLASS} align-top h-16`}>
                      <span className={`${TEXT_SIZE_XS} whitespace-pre-wrap`}>-</span>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className={`${HEADER_CELL_CLASS} text-center align-middle`}>
                      관리책임자
                      <br />
                      안전점검 지시사항
                    </td>
                    <td colSpan={8} className={`${CELL_CLASS} align-top h-16`}>
                      <span className={`${TEXT_SIZE_XS} whitespace-pre-wrap`}>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="print-page-footer">Page 1 / {totalPages}</div>
            </div>

            {daysWithPhotos.map((day, dayIdx) => {
              const dayPhotos = MOCK_PHOTOS_BY_DAY[day]
              const currentPage = dayIdx + 2
              const dayIndex = DAYS.indexOf(day)
              const dateRange = selectedListItem?.inspectionDate?.split(" ~ ") || []
              const weekStartDate = dateRange[0] ? new Date(dateRange[0]) : new Date()
              const dayDate = new Date(weekStartDate)
              dayDate.setDate(weekStartDate.getDate() + dayIndex)
              const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`
              return (
                <div key={day} className="print-photo-page">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold">안전순회 점검일지</h2>
                      <span className="text-sm text-gray-600">현장사진</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>
                        {dateStr} ({day})
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {dayPhotos.map((photoData, idx) => (
                      <div key={idx}>
                        <div className={`border ${BORDER_CLASS}`}>
                          <img src={photoData.photo} alt={`사진 ${idx + 1}`} className="w-full h-[180px] object-cover" />
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          {photoData.category} | {photoData.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="print-page-footer">
                    Page {currentPage} / {totalPages}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
