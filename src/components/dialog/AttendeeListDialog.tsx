import React from "react"
import { X } from "lucide-react"
import { DIALOG_STYLES } from "./DialogCommon"

interface Attendee {
  name: string
  phone: string
  signed: boolean
  signature?: string
  signedAt?: string
}

interface AttendeeListDialogProps {
  isOpen: boolean
  onClose: () => void
  attendees: Attendee[]
}

export default function AttendeeListDialog({ isOpen, onClose, attendees }: AttendeeListDialogProps) {
  if (!isOpen) return null

  const totalCount = attendees.length
  const signedCount = attendees.filter(a => a.signed).length

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={DIALOG_STYLES.containerSm}>
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${DIALOG_STYLES.textSizeTd} font-medium`}>
            <span className={DIALOG_STYLES.textSecondary}>총 {totalCount}명</span>
            <span className={DIALOG_STYLES.textSecondary}>|</span>
            <span>
              <span className="text-[var(--primary)]">서명완료</span>
              <span className={`ml-1 ${DIALOG_STYLES.textSecondary}`}>{signedCount}명</span>
            </span>
          </div>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {attendees.length > 0 ? (
            <div className="space-y-2">
              {attendees.map((attendee, index) => (
                <div key={index} className={DIALOG_STYLES.cardItem}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${DIALOG_STYLES.textPrimary}`}>{attendee.name}</span>
                        <span className={`text-xs ${DIALOG_STYLES.textSecondary}`}>{attendee.phone}</span>
                      </div>
                      {attendee.signed ? (
                        <p className="text-xs flex items-center gap-2">
                          <span className="text-[var(--primary)] font-medium">서명완료</span>
                          {attendee.signedAt && <span className="text-gray-400 text-[11px]">{attendee.signedAt}</span>}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">서명대기</p>
                      )}
                    </div>
                    {attendee.signed && attendee.signature && (
                      <div className={`shrink-0 w-20 h-12 border ${DIALOG_STYLES.border} rounded bg-white`}>
                        <img src={attendee.signature} alt="서명" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={DIALOG_STYLES.emptyStateTable}>등록된 참석자가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}
