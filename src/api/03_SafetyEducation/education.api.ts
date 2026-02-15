/**
 * 안전교육 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 안전교육 목록 조회
// ====================================================
export type EducationListRequest = {
  page?: number
  training_target?: number //교육대상
  category?: number //교육과정
  [key: string]: string | number | boolean | null | undefined
}

export type EducationPhotoFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type EducationPost = {
  id: number //포스트고유ID
  type: number | string //교육과정ID
  category: number | string //교육대상ID
  title: string //교육명
  training_start: string //교육시작일 YYYY-MM-DD
  training_end: string //교육종료일 YYYY-MM-DD
  name: string //교육담당자명
  view_count: number //조회수
  teacher: string //강사명
  photofile: EducationPhotoFile[] //현장사진
  files: EducationPhotoFile[] //첨부파일
  education_data: EducationPhotoFile[] //교육자료
}

export type EducationListResponse = {
  code: number
  msg: string
  posts: EducationPost[]
  all_page_count: number //총 페이지 수
  all_count: number //전체 포스트 수
}

export const getEducationList = async (data: EducationListRequest): Promise<EducationListResponse> => {
  const res = await axiosInstance.post<EducationListResponse>("/posts/education_list/", data)
  console.log("안전보건교육리스트:", res)
  return res.data
}

// ====================================================
// 📋 안전교육 상세 조회
// ====================================================
export type EducationDetailRequest = {
  post_id: number //포스트고유ID
}

export type EducationTargetList = {
  target_id: 1
  target_name: string
  target_phone: string
  is_wrap_up: number //1,0 (신경안써도됨_여기서사용안함_참석자알림체크여부)
  //그룹 ()
}

export type EducationDetailPost = {
  id: number //포스트고유ID
  business_id_id: number | string //위험성평가ID?
  type: number | string //교육과정
  title: string
  training_start: string //YYYY-MM-DD
  training_end: string
  start_time: string //HH:MM
  end_time: string
  category: number | string //교육방식인가?
  training_target: number
  is_alarm: boolean //1,0
  alarm_time: number //(0:1일 전, 1:1주일 전, 2:1개월 전)
  files: EducationPhotoFile[]
  created_at: string //YYYY-MM-DDTHH:MM:SS.SSS
  name: string
  teacher: string
  education_data: EducationPhotoFile[]
  memo: string
  view_count: number
  photofile: EducationPhotoFile[]
  risk_id?: number | string
  /**
   * TODO: [P0] 백엔드 필드명 오탈자 수정 필요
   * - 담당: 백엔드팀
   * - 예상 완료: 2026-02-20
   * - 의존성: 백엔드 /posts/education_list/ 응답 필드명 수정
   * - 임시 처리: rist_title로 받아서 사용 중 (오탈자)
   * - 수정 내용: rist_title → risk_title 로 변경 필요
   */
  rist_title?: string
  attendeeList?: { name: string; phoneNumber: string }[]
  education_target_list: EducationTargetList[]
}

export type EducationDetailResponse = {
  code: number
  msg?: string
  post?: EducationDetailPost
  posts?: EducationDetailPost[]
}

export const getEducationDetail = async (data: EducationDetailRequest): Promise<EducationDetailResponse> => {
  const res = await axiosInstance.post<EducationDetailResponse>("/posts/detail_education/", data)
  console.log("안전보건교육디테일:", res)
  return res.data
}

// ====================================================
// 📋 안전교육 등록/수정
// ====================================================
export type EducationRegistRequest = {
  post_id: number //포스트고유ID (0:생성, 기존고유ID:수정)
  training_target: number
  type: number
  title: string
  training_start: string //YYYY-MM-DD
  training_end: string
  start_time: string //HH:MM
  end_time: string
  category: number
  is_alarm: boolean //1,0
  alarm_time: number
  name: string
  teacher: string
  memo: string
  photo_id: number[] //# 기존 현장사진 중 유지할 파일 아이디 리스트
  photofiles: File[] //새롭게 추가되는 현장사진
  file_id: number[]
  files: File[]
  data_id: number[]
  education_data: File[]
  risk_id?: number | string
  attendeeList?: { name: string; phoneNumber: string }[]
  target_list: EducationTargetList_Request[]
}
export type EducationTargetList_Request = {
  phone: string //010-0000-0000
  name: string
}
export type EducationRegistResponse = {
  code: number
  msg: string
}

export const getEducationRegist = async (data: EducationRegistRequest): Promise<EducationRegistResponse> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("training_target", String(data.training_target))
  fd.append("type", String(data.type))
  fd.append("title", data.title)
  fd.append("training_start", data.training_start)
  fd.append("training_end", data.training_end)
  fd.append("start_time", data.start_time)
  fd.append("end_time", data.end_time)
  fd.append("risk_id", String(data.risk_id))
  fd.append("category", String(data.category))
  fd.append("is_alarm", String(data.is_alarm == true ? 1 : 0))
  fd.append("alarm_time", String(data.alarm_time))
  fd.append("name", data.name)
  fd.append("teacher", data.teacher)
  fd.append("memo", data.memo)

  // 기존 파일 ID 리스트 (JSON 형태로)
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))
  fd.append("file_id", JSON.stringify(data.file_id ?? []))
  fd.append("data_id", JSON.stringify(data.data_id ?? []))

  // 타겟리스트
  fd.append("target_list", JSON.stringify(data.target_list ?? []))

  // 새 현장사진 파일들
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  // 새 첨부파일들
  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file))
  }

  // 새 교육자료 파일들
  if (data.education_data && data.education_data.length > 0) {
    data.education_data.forEach(file => fd.append("education_data", file))
  }

  const res = await axiosInstance.post<EducationRegistResponse>("/posts/manage_education/", fd)
  console.log("안전보건교육등록/수정:", res)
  return res.data
}

// ====================================================
// 📋 안전교육 삭제
// ====================================================
export type EducationDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type EducationDelResponse = {
  code: number
  msg: string
}

export const getEducationDelete = async (data: EducationDelRequest): Promise<EducationDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<EducationDelResponse>("/posts/delete_education/", formData)
  console.log("안전보건교육삭제:", res)
  return res.data
}
