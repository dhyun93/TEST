/**
 * 안전점검 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// 점검일정 목록 조회
export type InspectionListRequest = {
  page?: number //페이지번호
  category?: number //점검분야(0부터시작)
  type?: number //점검종류(0부터시작)
  query?: string //검색어
}

export type InspectionListPost = {
  id: number //포스트고유ID
  title: string //점검표명
  place: string //장소
  category: number //점검분야
  type: number //점검종류
  start_date: string //점검일정(시작일) YYYY-MM-DD
  end_date: string //점검일정(종료일)
  name: string //점검자
  person: string //등록인
  is_wrap_up: number //0,1
}

export type InspectionListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: InspectionListPost[] //목록데이터
  all_page_count: number //총페이지수
  all_count: number //전체포스트수
}

export const getPlans = async (params?: InspectionListRequest): Promise<InspectionListResponse> => {
  const res = await axiosInstance.post<InspectionListResponse>("/posts/inspection_schedule_list/", params)
  console.log("안전점검 점검목록: ", res)
  return res.data
}

// 점검일정 상세 조회
export type InspectionDetailRequest = {
  post_id: number //포스트고유ID
}

export type InspectionDetailPost = {
  id: number //포스트고유ID
  business_id_id: number | string
  place: string //점검장소
  category: number //점검분야
  type: number //점검종류
  start_date: string //점검일(시작일) YYYY-MM-DD
  end_date: string //점검일(종료일)
  check_id_id: number //체크리스트고유ID
  name: string //점검자
  phone: string //연락처
  day: string //요일 "0,1,1,0,1,0,0"
  date: number //점검일자
  is_wrap_up: number //0,1
  created_at: string //YYYY-MM-DDTHH:MM:SS.SSS
  title: string //점검표명
}

export type InspectionDetailContents = {
  id: number //항목고유ID
  content: string //점검항목내용
  is_check: number //확인여부(0,1)
  memo: string //비고
}

export type InspectionDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: InspectionDetailPost[] //상세데이터
  contents: InspectionDetailContents[] //점검항목목록
}

export const getInspectionDetail = async (data: InspectionDetailRequest): Promise<InspectionDetailResponse> => {
  const res = await axiosInstance.post<InspectionDetailResponse>("/posts/detail_inspection_schedule/", data)
  console.log("안전점검 점검일지디테일:", res)
  return res.data
}


// 점검일정 삭제
export type InspectionScheduleDeleteRequest = {
  post_id: number[] //삭제할고유ID리스트
}

export type InspectionScheduleDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteInspectionSchedule = async (data: InspectionScheduleDeleteRequest): Promise<InspectionScheduleDeleteResponse> => {
  const fd = new FormData()
  fd.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<InspectionScheduleDeleteResponse>("/posts/delete_inspection_schedule/", fd)
  return res.data
}

// 점검일정 등록/수정
export type InspectionScheduleRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  category: number //점검분야(0부터시작)
  type: number //점검종류(0부터시작)
  place: string //장소
  start_date: string //시작일 YYYY-MM-DD
  end_date: string //종료일 YYYY-MM-DD
  check_id: number //체크리스트고유ID
  name: string //점검자
  phone: string //핸드폰번호
  day: string //요일(콤마구분) "1,0,1,0,0,0,0"
  date: number //점검일자
}

export type InspectionScheduleRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const manageInspectionSchedule = async (data: InspectionScheduleRegistRequest): Promise<InspectionScheduleRegistResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  fd.append("category", String(data.category))
  fd.append("type", String(data.type))
  fd.append("place", data.place)
  fd.append("start_date", data.start_date)
  fd.append("end_date", data.end_date)
  fd.append("check_id", String(data.check_id))
  fd.append("name", data.name)
  fd.append("phone", data.phone)
  fd.append("day", data.day)
  fd.append("date", String(data.date))
  const res = await axiosInstance.post<InspectionScheduleRegistResponse>("/posts/manage_inspection_schedule/", fd)
  return res.data
}

// 점검하기
export type SetInspectionScheduleItem = {
  id: number //항목고유ID
  is_check: number //확인여부(0,1)
  memo: string //비고
}

export type SetInspectionScheduleRequest = {
  post_id: number //점검일정고유ID
  data: SetInspectionScheduleItem[] //점검데이터배열
}

export type SetInspectionScheduleResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setInspectionSchedule = async (data: SetInspectionScheduleRequest): Promise<SetInspectionScheduleResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<SetInspectionScheduleResponse>("/posts/set_inspection_schedule/", fd)
  return res.data
}
