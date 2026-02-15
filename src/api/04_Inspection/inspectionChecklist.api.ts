// 점검표 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 점검표 목록 조회
export type ChecklistListRequest = {
  page: number //페이지번호
  query?: string //검색어
  subject: number //점검분야(0부터시작)
  type: number //점검종류(0부터시작)
}

export type ChecklistListPost = {
  id: number //포스트고유ID
  subject: number //점검분야
  type: number //점검종류
  is_use: number //사용여부(0:미사용,1:사용)
  title: string //점검표명
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type ChecklistListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: ChecklistListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getChecklistList = async (data: ChecklistListRequest): Promise<ChecklistListResponse> => {
  const fd = new FormData()
  fd.append("page", String(data.page))
  if (data.query) fd.append("query", data.query)
  fd.append("subject", String(data.subject))
  fd.append("type", String(data.type))
  const res = await axiosInstance.post<ChecklistListResponse>("/posts/inspection_checklist_list/", fd)
  return res.data
}

// 점검표 삭제
export type ChecklistDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type ChecklistDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteChecklist = async (data: ChecklistDeleteRequest): Promise<ChecklistDeleteResponse> => {
  const fd = new FormData()
  fd.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<ChecklistDeleteResponse>("/posts/delete_inspection_checklist/", fd)
  return res.data
}

// 점검표 등록/수정
export type ChecklistRegistItem = {
  content: string //점검항목내용
}

export type ChecklistRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  subject: number //점검분야(0부터시작)
  type: number //점검종류(0부터시작)
  is_use: number //사용여부(0:미사용,1:사용)
  title: string //점검표명
  data: ChecklistRegistItem[] //점검항목배열
}

export type ChecklistRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registChecklist = async (data: ChecklistRegistRequest): Promise<ChecklistRegistResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("subject", String(data.subject))
  fd.append("type", String(data.type))
  fd.append("is_use", String(data.is_use))
  fd.append("title", data.title)
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<ChecklistRegistResponse>("/posts/manage_inspection_checklist/", fd)
  return res.data
}

// 점검표 상세 조회
export type ChecklistDetailRequest = {
  post_id: number //포스트고유ID
}

export type ChecklistDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getChecklistDetail = async (data: ChecklistDetailRequest): Promise<ChecklistDetailResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<ChecklistDetailResponse>("/posts/detail_checklist_list/", fd)
  return res.data
}
