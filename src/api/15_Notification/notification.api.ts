/**
 * 알림(FCM 푸시) API
 * 디바이스 등록, 알림 전송, 읽음 처리
 *
 * @module NotificationAPI
 */

import { axiosInstance } from '@/utils/axiosInterceptor'

// ============================================================
// 타입 정의
// ============================================================

/** 알림 카테고리 (백엔드 Alarm.category 매핑) */
export const ALARM_CATEGORY = {
  TBM: 0,
  SAFETY_VOICE: 1,
  NEAR_MISS: 2,
  INSPECTION: 3,
  EDUCATION: 4,
  NOTICE: 5,
  RESPONSE_GUIDE: 6,
} as const

export type AlarmCategory = typeof ALARM_CATEGORY[keyof typeof ALARM_CATEGORY]

/** 디바이스 등록 요청 */
export interface RegisterDeviceRequest {
  fcm_token: string
  platform?: string     // 'ios' | 'android' | 'web'
  app_version?: string
}

/** 알림 전송 요청 */
export interface SendNotificationRequest {
  title: string
  contents: string
  category: AlarmCategory
  user_ids?: number[]
  phones?: string[]
}

/** 알림 전송 응답 */
export interface SendNotificationResponse {
  ok: boolean
  sent: number
  total: number
  msg?: string
}

// ============================================================
// API 함수
// ============================================================

/**
 * FCM 디바이스 등록
 *
 * @param data - FCM 토큰 및 디바이스 정보
 */
export async function registerDevice(data: RegisterDeviceRequest) {
  const response = await axiosInstance.post('/api/notifications/devices/register/', data)
  return response.data
}

/**
 * 참석자에게 알림 전송 (FCM 푸시)
 *
 * @param data - 알림 제목, 내용, 수신자 정보
 * @returns 전송 결과 (성공/전체 건수)
 *
 * @example
 * ```ts
 * const result = await sendNotification({
 *   title: '안전교육 안내',
 *   contents: '내일 14시 안전교육이 있습니다',
 *   category: ALARM_CATEGORY.EDUCATION,
 *   phones: ['010-1234-5678', '010-9876-5432']
 * })
 * ```
 */
export async function sendNotification(data: SendNotificationRequest): Promise<SendNotificationResponse> {
  const response = await axiosInstance.post<SendNotificationResponse>(
    '/api/notifications/send/',
    data
  )
  return response.data
}

/**
 * 모든 알림 읽음 처리
 */
export async function readAllNotifications() {
  const response = await axiosInstance.post('/api/notifications/read-all/')
  return response.data
}

/**
 * 단건 알림 읽음 처리
 *
 * @param alarmId - 알림 ID
 */
export async function markNotificationRead(alarmId: number) {
  const response = await axiosInstance.post('/api/notifications/mark-read/', {
    alarm_id: alarmId,
  })
  return response.data
}
