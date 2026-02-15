import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AlertTriangle, MessageSquare, Camera, X, CheckCircle, ImageIcon, Calendar, ChevronRight, ArrowLeft } from "lucide-react"
import { nearMissMockData, safeVoiceMockData } from "@/data/mockData"

type NearMissType = "nearmiss" | "safevoice"

interface QRNearMissProps {
  type: NearMissType
}

interface FormState {
  place: string
  content: string
  registrant: string
  date: string
  isAnonymous: boolean
}

const STYLES = {
  card: "bg-white rounded-xl p-4",
  label: "text-xs text-gray-500 mb-1.5 block",
  required: "text-red-400",
  optional: "text-gray-400",
  input: "w-full text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:border-[var(--primary)] transition-colors placeholder:text-gray-400",
  inputDisabled: "w-full text-sm text-gray-400 bg-gray-100 rounded-lg px-3 py-2.5 border border-gray-200 cursor-not-allowed",
  inputReadonly: "text-sm text-gray-800 bg-gray-100 rounded-lg px-3 py-2.5 border border-gray-200",
  textarea:
    "w-full text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:border-[var(--primary)] transition-colors placeholder:text-gray-400 min-h-[120px] resize-none",
  primaryButton: "w-full py-3.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl disabled:opacity-50 active:opacity-80 transition-opacity",
  photoButton: "flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--primary)] bg-blue-50 rounded-lg font-medium active:bg-blue-100",
  removeButton: "absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm active:bg-red-600",
  emptyPhoto: "h-20 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center",
  row: "flex items-start gap-3",
  icon: "text-gray-400 mt-0.5 shrink-0",
  value: "text-sm text-gray-800",
} as const

const LABELS = {
  date: "등록일",
  registrant: "작성자",
  place: "발생장소",
  content: "내용",
  photo: "현장사진",
  anonymous: "익명으로 등록",
  submit: "등록하기",
  submitting: "등록 중...",
  newSubmit: "새로 작성",
  complete: "등록 완료",
  actionStatus: "조치여부",
  actionReason: "조치/미조치 사유",
} as const

const PLACEHOLDERS = {
  registrant: "이름 입력",
  place: "장소를 입력해주세요",
  photo: "사진을 추가해주세요",
} as const

const CONFIG = {
  nearmiss: {
    title: "아차사고",
    icon: AlertTriangle,
    successMessage: "아차사고가 등록되었습니다",
    contentPlaceholder: "아차사고 경위와 상황을 상세히 기술해주세요",
    contentLabel: "위험내용",
    hasPlace: true,
    hasAnonymous: false,
    mockData: nearMissMockData,
    getContent: (item: any) => item.danger,
    getStatus: (item: any) => item.result,
    getDisplayStatus: (item: any) => (item.result === "채택" ? "채택" : "미채택"),
    isCompleted: (item: any) => item.result === "채택",
    pendingLabel: "미채택 사유",
  },
  safevoice: {
    title: "안전보이스",
    icon: MessageSquare,
    successMessage: "안전보이스가 등록되었습니다",
    contentPlaceholder: "안전 관련 제안이나 의견을 작성해주세요",
    contentLabel: "제안내용",
    hasPlace: false,
    hasAnonymous: true,
    mockData: safeVoiceMockData,
    getContent: (item: any) => item.content,
    getStatus: (item: any) => item.status,
    getDisplayStatus: (item: any) => (item.status === "조치" ? "조치" : "미조치"),
    isCompleted: (item: any) => item.status === "조치",
    pendingLabel: "미조치 사유",
  },
} as const

const getTodayDate = () => new Date().toISOString().split("T")[0]

const getInitialForm = (): FormState => ({
  place: "",
  content: "",
  registrant: "",
  date: getTodayDate(),
  isAnonymous: false,
})

function ListMode({ type, onSelectItem, onRegister }: { type: NearMissType; onSelectItem: (id: number | string) => void; onRegister: () => void }) {
  const { title, icon: Icon, mockData, getContent, getDisplayStatus, isCompleted } = CONFIG[type]
  const items = mockData as any[]

  const getStatusColor = (completed: boolean) => {
    if (type === "nearmiss") {
      return completed ? "text-sky-600 bg-sky-50" : "text-red-600 bg-red-50"
    }
    return completed ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">{title}</h1>
          <span className="ml-auto text-xs opacity-80">{items.length}건</span>
        </div>
      </header>

      <main className="p-4">
        {items.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {items.map(item => {
              const completed = isCompleted(item)
              const displayStatus = getDisplayStatus(item)
              const statusColor = getStatusColor(completed)
              return (
                <button key={item.id} onClick={() => onSelectItem(item.id)} className="w-full p-3 flex items-center gap-3 text-left active:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{getContent(item)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.date} | {item.registrant}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{displayStatus}</span>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">등록된 항목이 없습니다.</div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={onRegister} className={STYLES.primaryButton}>
          등록하기
        </button>
      </div>
    </div>
  )
}

function ViewMode({ type, data, onBack }: { type: NearMissType; data: any; onBack: () => void }) {
  const { title, icon: Icon, contentLabel, hasPlace, getContent, getDisplayStatus, isCompleted, pendingLabel } = CONFIG[type]
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const displayStatus = getDisplayStatus(data)
  const completed = isCompleted(data)
  const getStatusColor = () => {
    if (type === "nearmiss") {
      return completed ? "text-sky-600 bg-sky-50" : "text-red-600 bg-red-50"
    }
    return completed ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"
  }
  const statusColor = getStatusColor()

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={20} />
        </button>
      </header>

      <main className="p-4 space-y-3">
        <div className={STYLES.card}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <span className="text-base font-semibold text-gray-800">{data.date}</span>
          </div>
        </div>

        {hasPlace && (
          <div className={STYLES.card}>
            <p className={STYLES.label}>장소</p>
            <p className={STYLES.value}>{data.place || "-"}</p>
          </div>
        )}

        <div className={STYLES.card}>
          <p className={STYLES.label}>내용</p>
          <p className="text-base font-semibold text-gray-800">{getContent(data)}</p>
        </div>

        <div className={STYLES.card}>
          <p className={STYLES.label}>작성자</p>
          <p className={STYLES.value}>{data.registrant || "-"}</p>
        </div>

        <div className={STYLES.card}>
          <p className={STYLES.label}>{LABELS.actionStatus}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>{displayStatus}</span>
        </div>

        <div className={STYLES.card}>
          <p className={STYLES.label}>{pendingLabel}</p>
          <p className={STYLES.value}>{completed ? "-" : data.reason || "-"}</p>
        </div>

        {data.sitePhotos && data.sitePhotos.length > 0 && (
          <div className={STYLES.card}>
            <p className={`${STYLES.label} mb-3`}>현장사진</p>
            <div className="flex gap-2 overflow-x-auto">
              {data.sitePhotos.map((photo: string, i: number) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-24 h-24 object-cover rounded-lg shrink-0 bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            onClick={() => setSelectedPhoto(null)}
            style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))" }}
          >
            <X size={24} />
          </button>
          <img src={selectedPhoto} alt="" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function RegisterMode({ type, onBack, onSuccess }: { type: NearMissType; onBack: () => void; onSuccess: () => void }) {
  const { title, icon: Icon, successMessage, contentPlaceholder, contentLabel, hasPlace, hasAnonymous } = CONFIG[type]

  const [form, setForm] = useState<FormState>(getInitialForm)
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleAnonymousToggle = () => {
    setForm(prev => ({
      ...prev,
      isAnonymous: !prev.isAnonymous,
      registrant: !prev.isAnonymous ? "" : prev.registrant,
    }))
  }

  const handlePhotoFromCamera = () => {
    setShowPhotoSheet(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach(file => {
          const reader = new FileReader()
          reader.onload = ev => setPhotos(prev => [...prev, ev.target?.result as string])
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const handlePhotoFromLibrary = () => {
    setShowPhotoSheet(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach(file => {
          const reader = new FileReader()
          reader.onload = ev => setPhotos(prev => [...prev, ev.target?.result as string])
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const isRegistrantValid = hasAnonymous ? form.isAnonymous || form.registrant : form.registrant
    const isPlaceValid = hasPlace ? form.place : true
    const isValid = isRegistrantValid && isPlaceValid && form.content

    if (!isValid) {
      alert("필수 항목을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsSuccess(true)
    } catch {
      alert("등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{LABELS.complete}</h2>
        <p className="text-sm text-gray-500 mb-6">{successMessage}</p>
        <button onClick={onSuccess} className="px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium rounded-lg active:opacity-80">
          목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold">{title} 등록</h1>
        </div>
      </header>

      <main className="p-4 space-y-3">
        <div className={STYLES.card}>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={STYLES.label}>{LABELS.date}</label>
              <div className={STYLES.inputReadonly}>{form.date}</div>
            </div>
            <div className="flex-1">
              <label className={STYLES.label}>
                {LABELS.registrant} {!hasAnonymous && <span className={STYLES.required}>*</span>}
              </label>
              <input
                type="text"
                placeholder={PLACEHOLDERS.registrant}
                value={form.registrant}
                onChange={e => handleChange("registrant", e.target.value)}
                disabled={form.isAnonymous}
                className={form.isAnonymous ? STYLES.inputDisabled : STYLES.input}
              />
            </div>
          </div>
        </div>

        {hasPlace && (
          <div className={STYLES.card}>
            <label className={STYLES.label}>
              {LABELS.place} <span className={STYLES.required}>*</span>
            </label>
            <input type="text" placeholder={PLACEHOLDERS.place} value={form.place} onChange={e => handleChange("place", e.target.value)} className={STYLES.input} />
          </div>
        )}

        <div className={STYLES.card}>
          <label className={STYLES.label}>
            {contentLabel} <span className={STYLES.required}>*</span>
          </label>
          <textarea placeholder={contentPlaceholder} value={form.content} onChange={e => handleChange("content", e.target.value)} className={STYLES.textarea} />
        </div>

        <div className={STYLES.card}>
          <label className={STYLES.label}>
            {LABELS.photo} <span className={STYLES.optional}>(선택)</span>
          </label>
          {photos.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative">
                  <img src={photo} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button onClick={() => handleRemovePhoto(i)} className={STYLES.removeButton}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowPhotoSheet(true)}
                className="w-20 h-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 active:bg-gray-100"
              >
                <Camera size={18} className="text-gray-400" />
                <span className="text-xs text-gray-400">추가</span>
              </button>
            </div>
          ) : (
            <button onClick={() => setShowPhotoSheet(true)} className={`${STYLES.emptyPhoto} w-full mt-2 active:bg-gray-100 cursor-pointer`}>
              <div className="flex flex-col items-center gap-1">
                <Camera size={20} className="text-gray-400" />
                <p className="text-xs text-gray-400">사진추가</p>
              </div>
            </button>
          )}
        </div>

        {hasAnonymous && (
          <div className={STYLES.card}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={handleAnonymousToggle} className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:border-[var(--primary)]" />
              <span className="text-sm text-gray-700">익명으로 등록</span>
            </label>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <button onClick={handleSubmit} disabled={isSubmitting} className={STYLES.primaryButton}>
          {isSubmitting ? LABELS.submitting : LABELS.submit}
        </button>
      </div>

      {showPhotoSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowPhotoSheet(false)}>
          <div className="bg-white w-full rounded-t-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="py-2">
              <button onClick={handlePhotoFromCamera} className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors">
                <Camera size={20} className="text-gray-500" />
                <span className="text-sm text-gray-800">카메라로 촬영</span>
              </button>
              <button onClick={handlePhotoFromLibrary} className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors">
                <ImageIcon size={20} className="text-gray-500" />
                <span className="text-sm text-gray-800">라이브러리에서 선택</span>
              </button>
            </div>
            <div className="border-t border-gray-100">
              <button onClick={() => setShowPhotoSheet(false)} className="w-full py-3 text-sm text-gray-500 active:bg-gray-50 transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QRNearMiss({ type }: QRNearMissProps) {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<"list" | "view" | "register">("list")
  const [selectedId, setSelectedId] = useState<number | string | null>(null)
  const { mockData } = CONFIG[type]

  const urlId = searchParams.get("id")

  if (urlId && mode === "list") {
    const data = (mockData as any[]).find(item => String(item.id) === urlId)
    if (data) {
      return <ViewMode type={type} data={data} onBack={() => window.history.back()} />
    }
  }

  if (mode === "view" && selectedId) {
    const data = (mockData as any[]).find(item => item.id === selectedId)
    if (data) {
      return (
        <ViewMode
          type={type}
          data={data}
          onBack={() => {
            setMode("list")
            setSelectedId(null)
          }}
        />
      )
    }
  }

  if (mode === "register") {
    return <RegisterMode type={type} onBack={() => setMode("list")} onSuccess={() => setMode("list")} />
  }

  return (
    <ListMode
      type={type}
      onSelectItem={id => {
        setSelectedId(id)
        setMode("view")
      }}
      onRegister={() => setMode("register")}
    />
  )
}
