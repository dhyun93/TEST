import React, { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/common/base/Button"
import TabMenu from "@/components/common/base/TabMenu"
import PageTitle from "@/components/common/base/PageTitle"
import { Trash2, GripVertical, Check, Plus, Search, X, FileText } from "lucide-react"
import InfoBox from "@/components/common/base/InfoBox"
import { checklistTemplateMockData } from "@/data/mockData"
import Sortable from "sortablejs"
import useForm, { ValidationRules } from "@/hooks/useForm"
import { useInspectionChecklistHandlers, ChecklistRow } from "@/hooks/useHandlers"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"

const TAB_LABELS = ["점검목록", "점검표(체크리스트)관리"]

type ItemRow = { id: number; content: string; isEditing?: boolean; draft?: string }

type EditingChecklist = {
  templateName: string
  items: ItemRow[]
}

const BORDER_CLASS = "border-[var(--border)]"
const TEXT_PRIMARY = "text-gray-800"
const TEXT_SECONDARY = "text-gray-500"
const INPUT_CLASS = "border rounded-lg px-3 bg-white focus:outline-none focus:border-[var(--primary)] text-sm text-gray-800 placeholder:text-gray-500"
const BTN_CLASS = "inline-flex items-center justify-center rounded-md hover:bg-gray-50"

const initialData: ChecklistRow[] = checklistTemplateMockData.slice(0, 5).map(row => ({
  id: row.id,
  template: row.name,
  items: row.items || [],
  createdAt: "2025-01-05",
}))

export default function InspectionChecklist() {
  const navigate = useNavigate()
  const currentIndex = 1

  useEffect(() => {
    navigate(`/inspection/checklist?tab=${encodeURIComponent(TAB_LABELS[1])}`, { replace: true })
  }, [])

  const handleTabClick = (idx: number) => {
    const tabName = TAB_LABELS[idx]
    if (idx === 0) {
      navigate(`/inspection?tab=${encodeURIComponent(tabName)}`)
    } else if (idx === 1) {
      navigate(`/inspection/checklist?tab=${encodeURIComponent(tabName)}`)
    }
  }

  const [data, setData] = useState<ChecklistRow[]>(initialData)
  const [editingData, setEditingData] = useState<EditingChecklist>({ templateName: "", items: [] })
  const [editSelectedIds, setEditSelectedIds] = useState<(number | string)[]>([])
  const [templateSearch, setTemplateSearch] = useState("")
  const [listSearch, setListSearch] = useState("")
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingChecklist, setViewingChecklist] = useState<ChecklistRow | null>(null)
  const tableWrapRef = useRef<HTMLDivElement | null>(null)
  const nextIdRef = useRef(1)

  const validationRules = useMemo<ValidationRules>(
    () => ({
      templateName: { required: true },
    }),
    []
  )

  const formValues = useMemo(
    () => ({
      templateName: editingData.templateName,
    }),
    [editingData.templateName]
  )

  const { validateForm, isFieldInvalid, getFieldError, clearErrors } = useForm(validationRules, formValues)

  const filteredData = useMemo(() => {
    if (!listSearch.trim()) return data
    return data.filter(row => row.template.toLowerCase().includes(listSearch.toLowerCase()))
  }, [data, listSearch])

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return checklistTemplateMockData
    return checklistTemplateMockData.filter((t: any) => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
  }, [templateSearch])

  const {
    handleViewChecklist,
    handleDeleteSelected,
    handleAddItem,
    handleItemCheck,
    handleItemContentChange,
    handleItemConfirm,
    handleItemEdit,
    handleSelectTemplate,
    handleSave,
    handleDeleteChecklistById,
  } = useInspectionChecklistHandlers({
    data,
    setData,
    editingData,
    setEditingData,
    editSelectedIds,
    setEditSelectedIds,
    nextIdRef,
    validateForm,
    clearErrors,
    setViewingChecklist,
    setViewModalOpen,
    setIsTemplateModalOpen,
    setTemplateSearch,
    setPreviewTemplateId,
    checklistTemplateMockData,
  })

  useEffect(() => {
    if (!editingData || !tableWrapRef.current) return
    const el = tableWrapRef.current.querySelector("tbody")
    if (!el) return
    const sortable = Sortable.create(el as HTMLElement, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: evt => {
        const { oldIndex, newIndex } = evt
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        setEditingData(prev => {
          const newItems = [...prev.items]
          const [removed] = newItems.splice(oldIndex, 1)
          newItems.splice(newIndex, 0, removed)
          return { ...prev, items: newItems }
        })
      },
    })
    return () => sortable.destroy()
  }, [editingData])

  return (
    <section className="w-full bg-white">
      <PageTitle>점검표(체크리스트)관리</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={currentIndex} onTabClick={handleTabClick} className="mb-6" />

      <div className="mb-6">
        <InfoBox message="점검표 항목을 직접 구성하거나 템플릿으로 손쉽게 시작해보세요" />
      </div>

      <div className="flex flex-col md:flex-row gap-4" style={{ minHeight: "560px" }}>
        <div className={`w-full md:w-96 md:shrink-0 border ${BORDER_CLASS} rounded-lg p-4 bg-white flex flex-col min-h-[300px] md:min-h-0`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${TEXT_PRIMARY}`}>점검표 목록</h3>
            <span className="text-xs text-gray-400">{data.length}개</span>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="검색" className={`${INPUT_CLASS} w-full h-8 pl-8 border-[var(--border)]`} />
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[200px] md:max-h-none">
            {filteredData.map(row => (
              <li key={row.id} className="group flex items-center justify-between px-3 py-2.5 text-gray-700">
                <div className="flex-1 min-w-0">
                  <p onClick={() => handleViewChecklist(row)} className="text-sm font-medium truncate cursor-pointer hover:underline">
                    {row.template}
                  </p>
                  <p className="text-xs text-gray-400">
                    {row.createdAt} | {row.items.length}개 항목
                  </p>
                </div>
                <button onClick={() => handleDeleteChecklistById(row.id)} className="shrink-0 p-1.5 transition text-gray-400 hover:text-[var(--primary)] cursor-pointer" title="삭제">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
            {filteredData.length === 0 && <li className="py-8 text-center text-sm text-gray-400">저장된 점검표가 없습니다.</li>}
          </ul>
        </div>

        <div className={`flex-1 border ${BORDER_CLASS} rounded-lg p-4 bg-white flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${TEXT_PRIMARY}`}>새 점검표 작성</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3 md:gap-0">
            <div className="flex items-start gap-2 flex-1">
              <span className={`text-sm font-medium ${TEXT_SECONDARY} shrink-0 leading-9`}>점검표명</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={editingData.templateName}
                  onChange={e => setEditingData(prev => ({ ...prev, templateName: e.target.value }))}
                  placeholder="점검표명 입력"
                  className={`${INPUT_CLASS} w-full h-9 ${isFieldInvalid("templateName") ? "border-red-500" : "border-[var(--border)]"}`}
                />
                {isFieldInvalid("templateName") && <p className="text-red-500 text-xs mt-1">{getFieldError("templateName")}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 md:ml-4 h-auto md:h-9">
              <Button variant="action" onClick={() => setIsTemplateModalOpen(true)} className="flex items-center gap-1 text-xs">
                <FileText size={14} />
                템플릿 불러오기
              </Button>
              <Button variant="action" onClick={handleAddItem} className="flex items-center gap-1 text-xs">
                <Plus size={14} />
                항목추가
              </Button>
              <Button variant="action" onClick={handleDeleteSelected} className="flex items-center gap-1 text-xs" disabled={editSelectedIds.length === 0}>
                <Trash2 size={14} />
                삭제
              </Button>
              <Button variant="actionPrimary" onClick={handleSave} className="flex items-center gap-1 text-xs">
                점검표 저장하기
              </Button>
            </div>
          </div>

          <div ref={tableWrapRef} className={`flex-1 border ${BORDER_CLASS} rounded-lg overflow-auto`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className={`w-10 border-b ${BORDER_CLASS} px-2 py-2`}></th>
                  <th className={`w-10 border-b ${BORDER_CLASS} px-2 py-2 text-xs font-medium ${TEXT_SECONDARY}`}>No</th>
                  <th className={`w-10 border-b ${BORDER_CLASS} px-2 py-2`}></th>
                  <th className={`border-b ${BORDER_CLASS} px-3 py-2 text-xs font-medium ${TEXT_SECONDARY} text-left`}>점검항목</th>
                </tr>
              </thead>
              <tbody>
                {editingData.items.map((item, idx) => (
                  <tr key={item.id} className="group">
                    <td className={`border-b ${BORDER_CLASS} px-2 py-2 text-center`}>
                      <input type="checkbox" checked={editSelectedIds.includes(item.id)} onChange={() => handleItemCheck(item.id)} className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className={`border-b ${BORDER_CLASS} px-2 py-2 text-center text-xs ${TEXT_SECONDARY}`}>{idx + 1}</td>
                    <td className={`border-b ${BORDER_CLASS} px-2 py-2 text-center`}>
                      <span className="drag-handle cursor-grab text-gray-300 hover:text-gray-500">
                        <GripVertical size={16} />
                      </span>
                    </td>
                    <td className={`border-b ${BORDER_CLASS} px-3 py-2`}>
                      {item.isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.draft ?? ""}
                            onChange={e => handleItemContentChange(item.id, e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleItemConfirm(item.id)}
                            className={`${INPUT_CLASS} flex-1 h-8 border-[var(--border)]`}
                            autoFocus
                          />
                          <button onClick={() => handleItemConfirm(item.id)} className={`${BTN_CLASS} w-7 h-7 text-[var(--primary)]`}>
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <span onClick={() => handleItemEdit(item.id)} className={`text-sm ${TEXT_PRIMARY} cursor-pointer hover:text-[var(--primary)]`}>
                          {item.content || <span className="text-gray-400 italic">내용을 입력하세요</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {editingData.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="h-[400px] text-center align-middle text-sm text-gray-400">
                      템플릿을 불러오거나 항목을 직접 추가해보세요
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isTemplateModalOpen && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-[900px] max-w-[95vw] h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-gray-900">체크리스트 템플릿</h3>
              <button
                onClick={() => {
                  setIsTemplateModalOpen(false)
                  setTemplateSearch("")
                  setPreviewTemplateId(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-80 border-r border-[var(--border)] flex flex-col bg-gray-50/50">
                <div className="p-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      placeholder="검색"
                      className={`${INPUT_CLASS} w-full h-8 pl-8 text-xs border-[var(--border)]`}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ul className="divide-y divide-gray-100">
                    {filteredTemplates.map((t: any) => (
                      <li
                        key={t.id}
                        onClick={() => setPreviewTemplateId(t.id)}
                        className={`px-4 py-3 cursor-pointer transition ${previewTemplateId === t.id ? "bg-gray-100" : "hover:bg-gray-100 bg-white"} text-gray-700`}
                      >
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs mt-0.5 text-gray-400">{t.items?.length || 0}개 항목</p>
                      </li>
                    ))}
                    {filteredTemplates.length === 0 && <li className="py-12 text-center text-sm text-gray-400 bg-white">검색 결과가 없습니다.</li>}
                  </ul>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                {previewTemplateId ? (
                  <>
                    <div className="px-5 py-3 border-b border-[var(--border)] bg-gray-50/50">
                      <h4 className="text-sm font-semibold text-gray-800">{(checklistTemplateMockData as any[]).find(t => t.id === previewTemplateId)?.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{(checklistTemplateMockData as any[]).find(t => t.id === previewTemplateId)?.items?.length || 0}개 항목</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ul className="divide-y divide-gray-100">
                        {(checklistTemplateMockData as any[])
                          .find(t => t.id === previewTemplateId)
                          ?.items?.map((item: string, idx: number) => (
                            <li key={idx} className="px-5 py-3 hover:bg-gray-50 transition">
                              <span className="text-sm text-gray-700 leading-relaxed">
                                {idx + 1}. {item}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end bg-gray-50/30">
                      <Button variant="actionPrimary" onClick={() => handleSelectTemplate(previewTemplateId)}>
                        선택
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400">좌측에서 템플릿을 선택하세요.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewModalOpen && viewingChecklist && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-[600px] max-w-[95vw] max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{viewingChecklist.template}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {viewingChecklist.createdAt} | {viewingChecklist.items.length}개 항목
                </p>
              </div>
              <button
                onClick={() => {
                  setViewModalOpen(false)
                  setViewingChecklist(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {viewingChecklist.items.map((item, idx) => (
                  <li key={idx} className="px-5 py-2.5 flex">
                    <span className="text-xs text-gray-700 shrink-0 w-6">{idx + 1}.</span>
                    <span className="text-xs text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
