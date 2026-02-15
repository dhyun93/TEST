// 안전보건수준 평가 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type SafetyAssessmentListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type SafetyAssessmentFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type SafetyAssessmentListPost = {
  id: number //포스트고유ID
  name: string //업체명
  title: string //평가명
  type: number //평가종류(0부터시작)
  start_date: string //평가시작일 YYYY-MM-DD
  end_date: string //평가종료일 YYYY-MM-DD
  // TODO: 백엔드 확인 필요
  // evaluator: string //평가자
  external: string //외부평가업체
  sheet: SafetyAssessmentFile[] //평가지파일
  file: SafetyAssessmentFile[] //첨부파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type SafetyAssessmentListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: SafetyAssessmentListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getSafetyAssessmentList = async (data: SafetyAssessmentListRequest): Promise<SafetyAssessmentListResponse> => {
  const res = await axiosInstance.post<SafetyAssessmentListResponse>("/posts/safety_assessment_list/", data)
  return res.data
}

// 삭제
export type SafetyAssessmentDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type SafetyAssessmentDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteSafetyAssessment = async (data: SafetyAssessmentDeleteRequest): Promise<SafetyAssessmentDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<SafetyAssessmentDeleteResponse>("/posts/delete_safety_assessment/", formData)
  return res.data
}

// 상세 조회
export type SafetyAssessmentDetailRequest = {
  post_id: number //포스트고유ID
}

export type SafetyAssessmentDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  post: SafetyAssessmentListPost //상세데이터
}

export const getSafetyAssessmentDetail = async (data: SafetyAssessmentDetailRequest): Promise<SafetyAssessmentDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<SafetyAssessmentDetailResponse>("/posts/detail_safety_assessment/", formData)
  return res.data
}

// 등록/수정
export type SafetyAssessmentRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  name: string //업체명
  title: string //평가명
  type: number //평가종류(0부터시작)
  start_date: string //평가시작일 YYYY-MM-DD
  end_date: string //평가종료일 YYYY-MM-DD
  external: string //외부평가업체
  sheet_id: number[] //기존평가지중유지할파일ID리스트
  sheet?: File[] //평가지파일
  file_id: number[] //기존첨부파일중유지할파일ID리스트
  file?: File[] //첨부파일
}

export type SafetyAssessmentRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registSafetyAssessment = async (data: SafetyAssessmentRegistRequest): Promise<SafetyAssessmentRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("name", data.name)
  fd.append("title", data.title)
  fd.append("type", String(data.type))
  fd.append("start_date", data.start_date)
  fd.append("end_date", data.end_date)
  fd.append("external", data.external)
  fd.append("sheet_id", JSON.stringify(data.sheet_id ?? []))
  fd.append("file_id", JSON.stringify(data.file_id ?? []))

  if (data.sheet && data.sheet.length > 0) {
    data.sheet.forEach(file => fd.append("sheet", file))
  }
  if (data.file && data.file.length > 0) {
    data.file.forEach(file => fd.append("file", file))
  }

  const res = await axiosInstance.post<SafetyAssessmentRegistResponse>("/posts/manage_safety_assessment/", fd)
  return res.data
}
