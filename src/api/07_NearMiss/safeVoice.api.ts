/**
 * 안전보이스 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 안전보이스 목록 조회
// ====================================================
export type SafeVoiceListRequest = {
  page?: number
  start_date?: string //YYYY-MM-DD
  end_date?: string //YYYY-MM-DD
  query?: string
}
export type SafeVoiceFile = {
  id: number
  url: string
}
export type SafeVoiceListPost = {
  id: number
  business_id_id: number | string //???
  contents: string //내용
  user_id_id: number //등록인id
  is_anonymous: number //익명여부
  is_wrap_up: number //조치여부(1:조치/0:미조치)
  memo: string //미조치사유
  photofile: SafeVoiceFile[] //현장사진
  created_at: string //등록일 YYY-MM-DDTHH:MM:SS.SSS
  view_count: number //조회수
  user_name: string //등록인명
}
export type SafeVoiceListResponse = {
  code: number
  msg: string
  posts: SafeVoiceListPost[]
  all_page_count: number
  all_count: number
}
export const getSafeVoiceList = async (data: SafeVoiceListRequest): Promise<SafeVoiceListResponse> => {
  const res = await axiosInstance.post<SafeVoiceListResponse>("/posts/safety_voice_list/", data)
  console.log("안전보이스리스트:", res)
  return res.data
}

// ====================================================
// 📋 안전보이스 목록 삭제
// ====================================================
export type SafeVoiceDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type SafeVoiceDelResponse = {
  code: number
  msg: string
}
export const getSafeVoiceDelete = async (data: SafeVoiceDelRequest): Promise<SafeVoiceDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<SafeVoiceDelResponse>("/posts/delete_safety_voice/", formData)
  console.log("안전보이스리스트삭제:", res)
  return res.data
}

// ====================================================
// 📋 안전보이스 채택/미채택
// ====================================================
type SafeVoiceCheck_Request = {
  id: number
  is_wrap_up: number // 1 = 조치, 0 = 미조치
  memo: string
}
type SafeVoiceCheck_Response = {
  msg: string
  code: number
}
export const check_SafeVoice = async (data: SafeVoiceCheck_Request[]) => {
  const formData = new FormData()
  formData.append("data", JSON.stringify(data))

  const res = await axiosInstance.post<SafeVoiceCheck_Response>("/posts/safety_voice_is_check/", formData)
  console.log("안전보이스 조치/미조치: ", res)
  return res.data
}

// ====================================================
// 📋 안전보이스 신규등록
// ====================================================
type SafeVoiceRegist_Request = {
  post_id: number
  contents: string
  is_anonymous: number //익명(0:실명, 1:익명)
  photofiles?: File[]
}
type SafeVoiceRegist_Response = {
  msg: string
  code: number
}

export const regist_SafeVoice = async (data: SafeVoiceRegist_Request): Promise<SafeVoiceRegist_Response> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("contents", data.contents)
  fd.append("is_anonymous", String(data.is_anonymous))

  // 새 현장사진 파일들
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<SafeVoiceRegist_Response>("/posts/manage_safety_voice/", fd)
  console.log("안전보이스 등록:", res)
  return res.data
}
