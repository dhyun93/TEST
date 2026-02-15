import React, { useRef, useState } from "react"
import { X, Circle, Camera, Image } from "lucide-react"
import SignaturePadDialog from "@/components/dialog/SignaturePadDialog"
import SitePhotoViewer from "@/components/snippet/SitePhotoViewer"
import { useInspectionLogHandlers } from "@/hooks/useHandlers"
import { InspectionCheckItem, inspectionLogInitialItems, inspectionLogViewItems } from "@/data/mockData"

const BORDER_CLASS = "border-[var(--border)]"
const TEXT_PRIMARY = "text-gray-800"
const TEXT_SECONDARY = "text-gray-500"
const TEXT_SIZE_XS = "text-xs"
const TH_BASE = `bg-gray-50 ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center whitespace-nowrap`
const TD_BASE = `${BORDER_CLASS} px-2.5 py-2.5 ${TEXT_SIZE_XS} ${TEXT_PRIMARY} whitespace-nowrap`
const CELL_HOVER = "cursor-pointer hover:bg-gray-50"

interface ResultRow {
  id: number | string
  template: string
  workplace: string
  field: string
  kind: string
  inspector: string
  inspectedAt: string
  confirmed: boolean
  notes: string
  signature?: string
}

interface InspectionLogProps {
  open: boolean
  onClose: () => void
  data: ResultRow | null
  mode?: "view" | "edit"
  onSubmitSuccess?: (signature: string) => void
}

export default function InspectionLog({ open, onClose, data, mode = "view", onSubmitSuccess }: InspectionLogProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  const isEditMode = mode === "edit"

  const [items, setItems] = useState<InspectionCheckItem[]>(isEditMode ? inspectionLogInitialItems : inspectionLogViewItems)
  const [specialNotes, setSpecialNotes] = useState("")
  const [managerInstructions, setManagerInstructions] = useState("")
  const [signature, setSignature] = useState<string | null>(null)
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [photoViewerImages, setPhotoViewerImages] = useState<string[]>([])
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0)

  const { handleStatusChange, handleNoteChange, handleSubmit, handleSignatureSave, handlePhotoUpload, handleViewPhotos } = useInspectionLogHandlers({
    items,
    setItems,
    signature,
    setSignature,
    setIsSignaturePadOpen,
    setPhotoViewerOpen,
    setPhotoViewerImages,
    setPhotoViewerIndex,
    data,
    onSubmitSuccess,
    onClose,
  })

  if (!open || !data) return null

  const groupedItems = items.reduce(
    (acc, item) => {
      const cat = item.category || ""
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {} as Record<string, InspectionCheckItem[]>
  )

  const allPhotos = items.flatMap(item =>
    item.photos.map((photo, photoIdx) => ({
      photo,
      itemContent: item.content,
      itemCategory: item.category || "",
      photoIndex: photoIdx + 1,
    }))
  )
  const photosPerPage = 6
  const totalPages = 1 + (allPhotos.length > 0 ? Math.ceil(allPhotos.length / photosPerPage) : 0)

  return (
    <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-none md:rounded-2xl w-full md:w-[900px] md:max-w-[95vw] p-4 md:p-6 shadow-2xl md:h-[90vh] flex flex-col relative dialog-mobile-height">
        <div className="flex items-center justify-end mb-2 shrink-0 print:hidden">
          <button onClick={onClose} className="p-1 hover:bg-[var(--neutral-bg)] rounded transition text-[var(--neutral)]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-6 bg-white p-4">
            <div className="print-first-page flex flex-col gap-3">
              <div className="flex items-center">
                <div className="flex-1 flex justify-center items-center">
                  <h1 className="text-2xl font-semibold text-gray-900">점검일지</h1>
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

              <div className={`border ${BORDER_CLASS} overflow-hidden`}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <th className={`${TH_BASE} border-b border-r`} style={{ width: "11%" }}>
                        점검표명
                      </th>
                      <td className={`${TD_BASE} border-b`} style={{ width: "28%" }}>
                        {data.template}
                      </td>
                      <th className={`${TH_BASE} border-b border-l border-r`} style={{ width: "11%" }}>
                        점검종류
                      </th>
                      <td className={`${TD_BASE} border-b`} style={{ width: "12%" }}>
                        {data.kind}
                      </td>
                      <th className={`${TH_BASE} border-b border-l border-r`} style={{ width: "11%" }}>
                        점검일
                      </th>
                      <td className={`${TD_BASE} border-b`} style={{ width: "27%" }}>
                        {data.inspectedAt}
                      </td>
                    </tr>
                    <tr>
                      <th className={`${TH_BASE} border-r`}>점검장소</th>
                      <td className={`${TD_BASE}`}>{data.workplace}</td>
                      <th className={`${TH_BASE} border-l border-r`}>점검분야</th>
                      <td className={`${TD_BASE}`}>{data.field}</td>
                      <th className={`${TH_BASE} border-l border-r`}>점검자</th>
                      <td className={`${TD_BASE} ${isEditMode ? CELL_HOVER : ""}`} onClick={isEditMode ? () => setIsSignaturePadOpen(true) : undefined}>
                        {isEditMode ? (
                          <div className="flex items-center justify-between">
                            <span className="truncate">{data.inspector}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {signature && <img src={signature} alt="서명" className="h-5 w-10 object-contain border border-gray-200 rounded" />}
                              <span className={`${TEXT_SIZE_XS} ${signature ? "text-[var(--primary)]" : "text-gray-400"}`}>(인)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="truncate">{data.inspector}</span>
                            <span className="relative inline-flex items-center justify-center shrink-0">
                              <span className={`${TEXT_SIZE_XS} text-gray-200 select-none px-1`}>(인)</span>
                              {data.signature ? (
                                <img
                                  src={data.signature}
                                  alt="서명"
                                  className="absolute pointer-events-none max-w-none z-10"
                                  style={{ height: "40px", width: "auto", right: "0", top: "50%", transform: "translateY(-50%) translateX(20%)" }}
                                />
                              ) : (
                                <img
                                  src={`/images/signature-${Math.floor(Math.random() * 5) + 1}.png`}
                                  alt="서명"
                                  className="absolute pointer-events-none max-w-none z-10"
                                  style={{ height: "40px", width: "auto", right: "0", top: "50%", transform: "translateY(-50%) translateX(20%)" }}
                                />
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={`border ${BORDER_CLASS} overflow-hidden`}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className={`border-b ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "8%" }} rowSpan={2}>
                        구분
                      </th>
                      <th className={`border-b border-l ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "42%" }} rowSpan={2}>
                        점검항목
                      </th>
                      <th className={`border-b border-l ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "10%" }} colSpan={2}>
                        상태
                      </th>
                      <th className={`border-b border-l ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "34%" }} rowSpan={2}>
                        비고/조치사항
                      </th>
                      <th className={`border-b border-l ${BORDER_CLASS} px-1 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "6%" }} rowSpan={2}>
                        사진
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className={`border-b border-l ${BORDER_CLASS} px-1 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "5%" }}>
                        양호
                      </th>
                      <th className={`border-b border-l ${BORDER_CLASS} px-1 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center`} style={{ width: "5%" }}>
                        불량
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedItems).map(([category, categoryItems], catIdx, catArr) => (
                      <React.Fragment key={category}>
                        {categoryItems.map((item, idx) => {
                          const isLastCategory = catIdx === catArr.length - 1
                          const isLastItemInCategory = idx === categoryItems.length - 1
                          const isLastRow = isLastCategory && isLastItemInCategory
                          return (
                            <tr key={item.id} className={idx % 2 === 1 ? "bg-gray-50/30" : ""}>
                              {idx === 0 && category && (
                                <td
                                  rowSpan={categoryItems.length}
                                  className={`${isLastCategory ? "" : "border-b"} border-r ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_PRIMARY} text-center align-middle bg-gray-50`}
                                >
                                  {category.length === 4 ? (
                                    <>
                                      {category.slice(0, 2)}
                                      <br />
                                      {category.slice(2)}
                                    </>
                                  ) : (
                                    category
                                  )}
                                </td>
                              )}
                              <td className={`${isLastRow ? "" : "border-b"} border-l ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} ${TEXT_PRIMARY}`}>{item.content}</td>
                              <td
                                className={`${isLastRow ? "" : "border-b"} border-l ${BORDER_CLASS} px-1 py-2 ${isEditMode ? CELL_HOVER : ""}`}
                                onClick={isEditMode ? () => handleStatusChange(item.id, "양호") : undefined}
                              >
                                <div className="flex items-center justify-center">
                                  {isEditMode ? (
                                    <Circle size={14} className={`transition-colors ${item.status === "양호" ? "text-[var(--primary)]" : "text-gray-300"}`} strokeWidth={2.5} />
                                  ) : (
                                    item.status === "양호" && <Circle size={14} className="text-[var(--primary)]" strokeWidth={2.5} />
                                  )}
                                </div>
                              </td>
                              <td
                                className={`${isLastRow ? "" : "border-b"} border-l ${BORDER_CLASS} px-1 py-2 ${isEditMode ? CELL_HOVER : ""}`}
                                onClick={isEditMode ? () => handleStatusChange(item.id, "불량") : undefined}
                              >
                                <div className="flex items-center justify-center">
                                  {isEditMode ? (
                                    <X size={14} className={`transition-colors ${item.status === "불량" ? "text-red-700" : "text-gray-300"}`} strokeWidth={2.5} />
                                  ) : (
                                    item.status === "불량" && <X size={14} className="text-red-700" strokeWidth={2.5} />
                                  )}
                                </div>
                              </td>
                              <td className={`${isLastRow ? "" : "border-b"} border-l ${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} ${item.note ? TEXT_PRIMARY : TEXT_SECONDARY}`}>
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={item.note}
                                    onChange={e => handleNoteChange(item.id, e.target.value)}
                                    placeholder="비고 입력"
                                    className={`w-full px-1 py-1 ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none focus:border-[var(--primary)] placeholder:text-gray-300`}
                                  />
                                ) : (
                                  <span className="truncate block">{item.note || "-"}</span>
                                )}
                              </td>
                              <td className={`${isLastRow ? "" : "border-b"} border-l ${BORDER_CLASS} px-1 py-2`}>
                                <div className="flex items-center justify-center">
                                  {isEditMode ? (
                                    <>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        ref={el => {
                                          fileInputRefs.current[item.id] = el
                                        }}
                                        onChange={e => handlePhotoUpload(item.id, e.target.files)}
                                        className="hidden"
                                      />
                                      <button
                                        onClick={() => fileInputRefs.current[item.id]?.click()}
                                        className={`transition-colors ${item.photos.length > 0 ? "text-[var(--primary)] hover:opacity-70" : "text-gray-300 hover:text-gray-500"}`}
                                      >
                                        <Camera size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleViewPhotos(item.photos)}
                                      className={`flex justify-center items-center transition-colors ${
                                        item.photos.length > 0 ? "text-gray-800 hover:text-[var(--primary)] cursor-pointer" : "text-gray-300 cursor-default"
                                      }`}
                                      aria-label="사진 보기"
                                      disabled={item.photos.length === 0}
                                    >
                                      <Image size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`border ${BORDER_CLASS} overflow-hidden notes-section`}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <th className={`bg-gray-50 ${BORDER_CLASS} border-b border-r px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center align-middle`} style={{ width: "22%" }}>
                        특이사항 및 위험요인
                        <br />
                        (일자, 장소 표시 후 기록)
                      </th>
                      <td className={`${BORDER_CLASS} border-b px-2 py-2 ${TEXT_SIZE_XS} ${TEXT_PRIMARY} align-top`}>
                        {isEditMode ? (
                          <textarea
                            value={specialNotes}
                            onChange={e => setSpecialNotes(e.target.value)}
                            className={`w-full h-14 px-2 py-1 ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none resize-none focus:border-[var(--primary)]`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{data.notes || "-"}</p>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className={`bg-gray-50 ${BORDER_CLASS} border-r px-2 py-2 ${TEXT_SIZE_XS} font-medium ${TEXT_SECONDARY} text-center align-middle`} style={{ width: "22%" }}>
                        관리책임자
                        <br />
                        안전점검 지시사항
                      </th>
                      <td className={`${BORDER_CLASS} px-2 py-2 ${TEXT_SIZE_XS} ${TEXT_PRIMARY} align-top`}>
                        {isEditMode ? (
                          <textarea
                            value={managerInstructions}
                            onChange={e => setManagerInstructions(e.target.value)}
                            className={`w-full h-14 px-2 py-1 ${TEXT_SIZE_XS} border ${BORDER_CLASS} rounded outline-none resize-none focus:border-[var(--primary)]`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">-</p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="print-page-footer hidden print-only">Page 1 / {totalPages}</div>
            </div>

            {allPhotos.length > 0 &&
              Array.from({ length: Math.ceil(allPhotos.length / photosPerPage) }).map((_, pageIdx) => {
                const pagePhotos = allPhotos.slice(pageIdx * photosPerPage, (pageIdx + 1) * photosPerPage)
                const currentPage = pageIdx + 2
                return (
                  <div key={pageIdx} className="print-photo-page hidden print-only">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold">점검일지</h2>
                        <span className="text-sm text-gray-600">현장사진</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{data.inspectedAt}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {pagePhotos.map((photoData, idx) => (
                        <div key={idx}>
                          <div className={`border ${BORDER_CLASS}`}>
                            <img src={photoData.photo} alt={`사진 ${idx + 1}`} className="w-full h-[140px] object-contain bg-white" />
                          </div>
                          <div className="text-xs text-gray-700 mt-1">{photoData.itemCategory}</div>
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

        {isEditMode && (
          <div className="shrink-0 pt-4 border-t border-[var(--border)] flex items-center justify-end gap-1 print:hidden">
            <button
              onClick={handleSubmit}
              className="relative flex items-center justify-center gap-1 select-none whitespace-nowrap font-medium transition-opacity duration-200 hover:opacity-80 px-3 py-1.5 text-xs md:text-sm rounded-lg bg-[var(--primary)] text-white border border-[var(--primary)]"
            >
              제출하기
            </button>
          </div>
        )}
      </div>

      <SignaturePadDialog isOpen={isSignaturePadOpen} onClose={() => setIsSignaturePadOpen(false)} onSave={handleSignatureSave} title="점검자 서명" />

      <SitePhotoViewer
        open={photoViewerOpen}
        images={photoViewerImages}
        index={photoViewerIndex}
        onClose={() => setPhotoViewerOpen(false)}
        onPrev={() => setPhotoViewerIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setPhotoViewerIndex(prev => Math.min(photoViewerImages.length - 1, prev + 1))}
      />
    </div>
  )
}
