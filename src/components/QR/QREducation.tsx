import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { GraduationCap, Calendar, Download, X } from "lucide-react"
import { safetyEducationMockData } from "@/data/mockData"

const S = {
  card: "bg-white rounded-xl p-4 border border-gray-100",
  label: "text-xs text-gray-500 mb-1",
  value: "text-sm text-gray-800",
}

export default function QREducation() {
  const [searchParams] = useSearchParams()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const id = searchParams.get("id")
  const raw = id ? (safetyEducationMockData as any[]).find(item => String(item.id) === id) || safetyEducationMockData[0] : safetyEducationMockData[0] || {}
  const d = {
    date: (raw as any).date || "",
    eduName: (raw as any).eduName || "",
    targetGroup: (raw as any).targetGroup || "",
    course: (raw as any).course || "",
    eduPeriod: (raw as any).eduPeriod || "",
    eduTime: (raw as any).eduTime || "",
    eduMethod: (raw as any).eduMethod || "",
    eduManager: (raw as any).eduManager || "",
    externalInstructor: (raw as any).externalInstructor || "",
    eduMaterial: (raw as any).eduMaterial || null,
    sitePhotos: (raw as any).sitePhotos || [],
    attachmentFiles: (raw as any).attachmentFiles || [],
    manage: (raw as any).manage || "",
  }

  const handleDownload = (file: { name: string; url: string }) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <header className="bg-[var(--primary)] text-white p-4 sticky top-0 z-10" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <h1 className="text-base font-semibold">안전보건교육</h1>
      </header>

      <main className="p-4 space-y-3">
        <div className={S.card}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <span className="text-base font-semibold text-gray-800">{d.date}</span>
          </div>
        </div>

        <div className={S.card}>
          <p className={S.label}>교육명</p>
          <p className="text-base font-semibold text-gray-800">{d.eduName}</p>
        </div>

        <div className={`${S.card} space-y-3`}>
          <div>
            <p className={S.label}>교육대상</p>
            <p className={S.value}>{d.targetGroup || "-"}</p>
          </div>
          <div>
            <p className={S.label}>교육과정</p>
            <p className={S.value}>{d.course || "-"}</p>
          </div>
        </div>

        <div className={`${S.card} space-y-3`}>
          <div>
            <p className={S.label}>교육기간</p>
            <p className={S.value}>{d.eduPeriod || "-"}</p>
          </div>
          <div>
            <p className={S.label}>교육시간</p>
            <p className={S.value}>{d.eduTime || "-"}</p>
          </div>
          <div>
            <p className={S.label}>교육방식</p>
            <p className={S.value}>{d.eduMethod || "-"}</p>
          </div>
        </div>

        <div className={`${S.card} space-y-3`}>
          <div>
            <p className={S.label}>교육담당자</p>
            <p className={S.value}>{d.eduManager || "-"}</p>
          </div>
          <div>
            <p className={S.label}>외부강사</p>
            <p className={S.value}>{d.externalInstructor || "-"}</p>
          </div>
        </div>

        <div className={S.card}>
          <p className={S.label}>교육자료</p>
          {d.eduMaterial ? (
            <button onClick={() => handleDownload(d.eduMaterial)} className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left w-full">
              <Download size={14} className="text-[var(--primary)] shrink-0" />
              <span className="text-sm text-gray-700 truncate">{d.eduMaterial.name}</span>
            </button>
          ) : (
            <p className={S.value}>-</p>
          )}
        </div>

        {d.sitePhotos.length > 0 && (
          <div className={S.card}>
            <p className={`${S.label} mb-3`}>현장사진</p>
            <div className="flex gap-2 overflow-x-auto">
              {d.sitePhotos.map((photo: string, i: number) => (
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

        <div className={S.card}>
          <p className={`${S.label} mb-3`}>첨부파일</p>
          {d.attachmentFiles.length > 0 ? (
            <div className="space-y-2">
              {d.attachmentFiles.map((file: { name: string; url: string }, i: number) => (
                <button key={i} onClick={() => handleDownload(file)} className="flex items-center gap-2 w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                  <Download size={14} className="text-[var(--primary)] shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">첨부파일이 없습니다</p>
          )}
        </div>

        <div className={S.card}>
          <p className={S.label}>비고</p>
          <p className={S.value}>{d.manage || "-"}</p>
        </div>
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
