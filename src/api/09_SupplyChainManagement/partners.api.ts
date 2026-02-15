// 수급업체 관리 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type ConsultativeListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type ConsultativeFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type ConsultativeListPost = {
  id: number //포스트고유ID
  name: string //업체명
  start_date: string //계약시작일 YYYY-MM-DD
  end_date: string //계약종료일 YYYY-MM-DD
  manager: string //관리자
  phone: string //연락처
  photofile: ConsultativeFile[] //계약서류
  planfile: ConsultativeFile[] //안전보건계획서
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type ConsultativeListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: ConsultativeListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getConsultativeList = async (data: ConsultativeListRequest): Promise<ConsultativeListResponse> => {
  const res = await axiosInstance.post<ConsultativeListResponse>("/posts/consultative_list/", data)
  return res.data
}

// 삭제
export type ConsultativeDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type ConsultativeDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteConsultative = async (data: ConsultativeDeleteRequest): Promise<ConsultativeDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<ConsultativeDeleteResponse>("/posts/delete_consultative/", formData)
  return res.data
}

// 등록/수정
export type ConsultativeRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  name: string //업체명
  start_date: string //계약시작일 YYYY-MM-DD
  end_date: string //계약종료일 YYYY-MM-DD
  manager: string //관리자
  phone: string //연락처
  photo_id: number[] //기존파일중유지할파일ID리스트
  photofiles?: File[] //새로추가되는파일
  plan_id: number[] //기존안전보건계획서중유지할파일ID리스트
  planfiles?: File[] //안전보건계획서
}

export type ConsultativeRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registConsultative = async (data: ConsultativeRegistRequest): Promise<ConsultativeRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("name", data.name)
  fd.append("start_date", data.start_date)
  fd.append("end_date", data.end_date)
  fd.append("manager", data.manager)
  fd.append("phone", data.phone)
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))
  fd.append("plan_id", JSON.stringify(data.plan_id ?? []))

  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }
  if (data.planfiles && data.planfiles.length > 0) {
    data.planfiles.forEach(file => fd.append("planfiles", file))
  }

  const res = await axiosInstance.post<ConsultativeRegistResponse>("/posts/manage_consultative/", fd)
  return res.data
}
