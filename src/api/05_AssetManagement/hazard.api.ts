// 유해 위험물질 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회 요청
export type HazardListRequest = {
  page?: number
  start_date?: string
  end_date?: string
  query?: string
}

// 파일 타입
export type HazardFile = {
  id: number
  url: string
}

// 목록 아이템
export type HazardListPost = {
  id: number
  name: string
  cas_number: string
  exposure_limit: string
  exposure_limit_unit: number
  daily_usage: string
  daily_usage_unit: number
  storage_limit: string
  storage_limit_unit: number
  is_corrosiveness: number
  toxicity_level: string
  adverse_reaction: string
  registration_date: string
  memo: string
  is_alarm: number
  alarm_time: number
  cycle: number
  files: HazardFile[]
  created_at: string
}

// 목록 조회 응답
export type HazardListResponse = {
  code: number
  msg: string
  posts: HazardListPost[]
  all_page_count: number
  all_count: number
}

// 목록 조회
export const getHazardList = async (data: HazardListRequest): Promise<HazardListResponse> => {
  const res = await axiosInstance.post<HazardListResponse>("/posts/hazmat_list/", data)
  return res.data
}

// 삭제 요청
export type HazardDeleteRequest = {
  post_id: number[]
}

// 삭제 응답
export type HazardDeleteResponse = {
  code: number
  msg: string
}

// 삭제
export const deleteHazard = async (data: HazardDeleteRequest): Promise<HazardDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<HazardDeleteResponse>("/posts/delete_hazmat/", formData)
  return res.data
}

// 상세 조회 요청
export type HazardDetailRequest = {
  post_id: number
}

// 상세 조회 응답
export type HazardDetailResponse = {
  code: number
  msg: string
  post: HazardListPost
}

// 상세 조회
export const getHazardDetail = async (data: HazardDetailRequest): Promise<HazardDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<HazardDetailResponse>("/posts/detail_hazmat/", formData)
  return res.data
}

// 등록 수정 요청
export type HazardRegistRequest = {
  post_id: number
  name: string
  cas_number: string
  exposure_limit: string
  exposure_limit_unit: number
  daily_usage: string
  daily_usage_unit: number
  storage_limit: string
  storage_limit_unit: number
  is_corrosiveness: number
  toxicity_level: string
  adverse_reaction: string
  registration_date: string
  memo: string
  is_alarm: number
  alarm_time: number
  cycle: number
  files?: File[]
}

// 등록 수정 응답
export type HazardRegistResponse = {
  code: number
  msg: string
}

// 등록 수정
export const registHazard = async (data: HazardRegistRequest): Promise<HazardRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("name", data.name)
  fd.append("cas_number", data.cas_number)
  fd.append("exposure_limit", data.exposure_limit)
  fd.append("exposure_limit_unit", String(data.exposure_limit_unit))
  fd.append("daily_usage", data.daily_usage)
  fd.append("daily_usage_unit", String(data.daily_usage_unit))
  fd.append("storage_limit", data.storage_limit)
  fd.append("storage_limit_unit", String(data.storage_limit_unit))
  fd.append("is_corrosiveness", String(data.is_corrosiveness))
  fd.append("toxicity_level", data.toxicity_level)
  fd.append("adverse_reaction", data.adverse_reaction)
  fd.append("registration_date", data.registration_date)
  fd.append("memo", data.memo)
  fd.append("is_alarm", String(data.is_alarm))
  fd.append("alarm_time", String(data.alarm_time))
  fd.append("cycle", String(data.cycle))

  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file))
  }

  const res = await axiosInstance.post<HazardRegistResponse>("/posts/manage_hazmat/", fd)
  return res.data
}
