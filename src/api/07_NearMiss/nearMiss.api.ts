/**
 * 아차사고 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 아차사고 목록 조회
// ====================================================
export type NearMissListRequest = {
  page?: number
  start_date?: string //YYYY-MM-DD
  end_date?: string //YYYY-MM-DD
  query?: string
}
export type NearMissFile = {
  id: number
  url: string
}
export type NearMissListPost = {
  id: number
  business_id_id: number | string //???
  risk_factor: string //유해위험요인(내용)
  place: string //장소
  files: string //불필요제거요망
  user_id_id: number //등록인id
  created_at: string //등록일 YYY-MM-DDTHH:MM:SS.SSS
  is_wrap_up: number //처리결과(0:미채택,1:채택)
  memo: string //미채택사유
  view_count: number //조회수
  user_name: string //등록인명
  photofile: NearMissFile[] //현장사진
}
export type NearMissListResponse = {
  code: number
  msg: string
  posts: NearMissListPost[]
  all_page_count: number
  all_count: number
}
export const getNearMissList = async (data: NearMissListRequest): Promise<NearMissListResponse> => {
  const res = await axiosInstance.post<NearMissListResponse>("/posts/near_miss_list/", data)
  console.log("아차사고리스트:", res)
  return res.data
}

// ====================================================
// 📋 아차사고 목록 삭제
// ====================================================
export type NearMissDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type NearMissDelResponse = {
  code: number
  msg: string
}
export const getNearMissDelete = async (data: NearMissDelRequest): Promise<NearMissDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<NearMissDelResponse>("/posts/delete_near_miss/", formData)
  console.log("아차사고리스트삭제:", res)
  return res.data
}

// ====================================================
// 📋 아차사고 채택/미채택
// ====================================================
type NearMissCheck_Request = {
  id: number
  is_wrap_up: number // 1 = 채택, 0 = 미채택
  memo: string
}
type NearMissCheck_Response = {
  msg: string
  code: number
}
export const check_NearMiss = async (data: NearMissCheck_Request[]) => {
  const formData = new FormData()
  formData.append("data", JSON.stringify(data))

  const res = await axiosInstance.post<NearMissCheck_Response>("/posts/near_miss_is_check/", formData)
  console.log("아차사고 채택/미채택: ", res)
  return res.data
}

// ====================================================
// 📋 아차사고 신규등록
// ====================================================
type NearMissRegist_Request = {
  post_id: number
  risk_factor: string
  place: string
  photofiles?: File[]
}
type NearMissRegist_Response = {
  msg: string
  code: number
}

export const regist_NearMiss = async (data: NearMissRegist_Request): Promise<NearMissRegist_Response> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("risk_factor", data.risk_factor)
  fd.append("place", data.place)

  // 새 현장사진 파일들
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<NearMissRegist_Response>("/posts/manage_near_miss/", fd)
  console.log("아차사고 등록:", res)
  return res.data
}
