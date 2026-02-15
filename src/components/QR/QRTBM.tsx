import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ClipboardCheck, Calendar, Download, X } from "lucide-react"
import { tbmListMockData } from "@/data/mockData"

const S = {
  card: "bg-white rounded-xl p-4 border border-gray-100",
  label: "text-xs text-gray-500 mb-1",
  value: "text-sm text-gray-800",
}

export default function QRTBM() {
  const [searchParams] = useSearchParams()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const id = searchParams.get("id")
  const raw = id ? (tbmListMockData as any[]).find(item => String(item.id) === id) || tbmListMockData[0] : tbmListMockData[0] || {}
  const d = {
    tbm: (raw as any).tbm || "",
    date: (raw as any).date || "",
    place: (raw as any).place || "",
    eduTime: (raw as any).eduTime || "",
    riskAssessment: (raw as any).riskAssessment || "",
    supervisor: (raw as any).supervisor || "",
    workContent: (raw as any).workContent || "",
    note: (raw as any).note || "",
    sitePhotos: (raw as any).sitePhotos || [],
    attachmentFiles: (raw as any).attachmentFiles || [],
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
        <h1 className="text-base font-semibold">TBM 안전일지</h1>
      </header>

      <main className="p-4 space-y-3">
        <div className={S.card}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <span className="text-base font-semibold text-gray-800">{d.date}</span>
          </div>
        </div>

        <div className={S.card}>
          <p className={S.label}>작업명</p>
          <p className="text-base font-semibold text-gray-800">{d.tbm}</p>
        </div>

        <div className={`${S.card} space-y-3`}>
          <div>
            <p className={S.label}>TBM 장소</p>
            <p className={S.value}>{d.place || "-"}</p>
          </div>
          <div>
            <p className={S.label}>진행시간</p>
            <p className={S.value}>{d.eduTime || "-"}</p>
          </div>
          <div>
            <p className={S.label}>위험성평가표</p>
            <p className={S.value}>{d.riskAssessment || "-"}</p>
          </div>
          <div>
            <p className={S.label}>관리감독자</p>
            <p className={S.value}>{d.supervisor || "-"}</p>
          </div>
        </div>

        <div className={S.card}>
          <p className={S.label}>작업내용</p>
          <p className={S.value}>{d.workContent || "-"}</p>
        </div>

        <div className={S.card}>
          <p className={S.label}>비고</p>
          <p className={S.value}>{d.note || "-"}</p>
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
