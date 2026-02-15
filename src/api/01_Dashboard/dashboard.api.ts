// 대시보드 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 대시보드 정보 조회
export type DashboardInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getDashboardInfo = async (): Promise<DashboardInfoResponse> => {
  const res = await axiosInstance.post<DashboardInfoResponse>("/info/dashboard_info/")
  return res.data
}

// 캘린더 조회
export type CalendarRequest = {
  month: string //월 MM
}

export type CalendarResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getCalendar = async (data: CalendarRequest): Promise<CalendarResponse> => {
  const fd = new FormData()
  fd.append("month", data.month)
  const res = await axiosInstance.post<CalendarResponse>("/info/calendar/", fd)
  return res.data
}

// 안전정보 조회
export type SafetyInfoRequest = {
  type: number //0:7일,1:6개월
}

export type SafetyInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getSafetyInfo = async (data: SafetyInfoRequest): Promise<SafetyInfoResponse> => {
  const fd = new FormData()
  fd.append("type", String(data.type))
  const res = await axiosInstance.post<SafetyInfoResponse>("/info/safety_info/", fd)
  return res.data
}

// 안전보건 경영방침/목표 조회
export type SafetyMainInfoRequest = {
  type: number //0:안전보건경영방침,1:안전보건목표
}

export type SafetyMainInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getSafetyMainInfo = async (data: SafetyMainInfoRequest): Promise<SafetyMainInfoResponse> => {
  const fd = new FormData()
  fd.append("type", String(data.type))
  const res = await axiosInstance.post<SafetyMainInfoResponse>("/info/safety_main_info/", fd)
  return res.data
}
