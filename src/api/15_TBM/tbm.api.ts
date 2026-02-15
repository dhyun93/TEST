/**
 * TBM (Tool Box Meeting) API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// TBM 목록 조회
// ====================================================
export type TBMListRequest = {
  page?: number
  query?: string
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  manager?: number
}

export type TBMPhotoFile = {
  id: number
  url: string
}

export type TBMFile = {
  id: number
  url: string
}

export type TBMTargetItem = {
  target_id: number
  target_name: string
  target_phone: string
  is_wrap_up: number
}

export type TBMItemList = {
  title: string
  contents: string
}

export type TBMListPost = {
  id: number
  title: string
  place: string
  tbm_date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  contents: string
  memo: string
  count: number
  user_name: string
  view_count: number
  photofile: TBMPhotoFile[]
  files: TBMFile[]
  created_at: string
  risk_id?: number | string
  item_list?: TBMItemList[]
  tbm_target_list?: TBMTargetItem[]
}

export type TBMListResponse = {
  code: number
  msg: string
  posts: TBMListPost[]
  all_page_count: number
  all_count: number
}

export const getTBMList = async (data: TBMListRequest): Promise<TBMListResponse> => {
  const res = await axiosInstance.post<TBMListResponse>("/posts/tbm_list/", data)
  console.log("TBM리스트:", res)
  return res.data
}

// ====================================================
// TBM 삭제
// ====================================================
export type TBMDelRequest = {
  post_id: number[]
}
export type TBMDelResponse = {
  code: number
  msg: string
}

export const getTBMDelete = async (data: TBMDelRequest): Promise<TBMDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<TBMDelResponse>("/posts/delete_tbm/", formData)
  console.log("TBM삭제:", res)
  return res.data
}

// ====================================================
// 📋 TBM 상세 조회
// ====================================================
export type TBMDetailRequest = {
  post_id: number
}

export type TBMDetailPost = {
  id: number
  title: string
  place: string
  tbm_date: string
  start_time: string
  end_time: string
  contents: string
  memo: string
  count: number
  user_name: string
  view_count: number
  risk_id?: number | string
  risk_title?: string
  photofile: TBMPhotoFile[]
  files: TBMFile[]
  item_list: TBMItemList[]
  tbm_target_list: TBMTargetItem[]
  created_at: string
}

export type TBMDetailResponse = {
  code: number
  msg?: string
  post?: TBMDetailPost
  posts?: TBMDetailPost[]
}

export const getTBMDetail = async (data: TBMDetailRequest): Promise<TBMDetailResponse> => {
  const res = await axiosInstance.post<TBMDetailResponse>("/posts/tbm_detail_info/", data)
  console.log("TBM디테일:", res)
  return res.data
}

// ====================================================
// TBM 등록/수정
// ====================================================
export type TBMRegistRequest = {
  post_id: number // 생성:0, 수정:기존고유ID
  title: string
  place: string
  tbm_date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  contents: string
  memo: string
  risk_id?: number | string
  item_list: TBMItemList[]
  tbm_target_list: { phone: string; name: string }[]
  count: number
  photofiles?: File[]
  photo_id: number[]
  files?: File[]
  file_id: number[]
}

export type TBMRegistResponse = {
  code: number
  msg: string
}

export const getTBMRegist = async (data: TBMRegistRequest): Promise<TBMRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("title", data.title)
  fd.append("place", data.place)
  fd.append("tbm_date", data.tbm_date)
  fd.append("start_time", data.start_time)
  fd.append("end_time", data.end_time)
  fd.append("contents", data.contents)
  fd.append("memo", data.memo)
  fd.append("count", String(data.count))

  if (data.risk_id !== undefined && data.risk_id !== null) {
    fd.append("risk_id", String(data.risk_id))
  }

  fd.append("item_list", JSON.stringify(data.item_list ?? []))
  fd.append("tbm_target_list", JSON.stringify(data.tbm_target_list ?? []))

  // 기존 파일 ID 리스트
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))
  fd.append("file_id", JSON.stringify(data.file_id ?? []))

  // 새 현장사진 파일들
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  // 새 첨부파일들
  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file))
  }

  const res = await axiosInstance.post<TBMRegistResponse>("/posts/manage_tbm/", fd)
  console.log("TBM등록/수정:", res)
  return res.data
}

// ====================================================
// TBM 체크
// ====================================================
export type TBMCheckRequest = {
  post_id: number
}
export type TBMCheckResponse = {
  code: number
  msg: string
}

export const getTBMCheck = async (data: TBMCheckRequest): Promise<TBMCheckResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))

  const res = await axiosInstance.post<TBMCheckResponse>("/posts/tbm_check/", formData)
  console.log("TBM체크:", res)
  return res.data
}
