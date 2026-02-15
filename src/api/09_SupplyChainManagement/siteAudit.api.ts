// 협동 안전보건점검 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type InspectionListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type InspectionFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type InspectionListPost = {
  id: number //포스트고유ID
  inspection_date: string //점검일 YYYY-MM-DD
  type: number //점검종류(0부터시작)
  title: string //점검계획명
  result: number //점검결과(0:이상없음,1:주의,2:위험)
  contents: string //조치내용
  name: string //점검자
  photofile: InspectionFile[] //현장사진
  inspection_info: InspectionFile[] //점검지파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type InspectionListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: InspectionListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getInspectionList = async (data: InspectionListRequest): Promise<InspectionListResponse> => {
  const res = await axiosInstance.post<InspectionListResponse>("/posts/inspection_list/", data)
  return res.data
}

// 삭제
export type InspectionDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type InspectionDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteInspection = async (data: InspectionDeleteRequest): Promise<InspectionDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<InspectionDeleteResponse>("/posts/delete_inspection/", formData)
  return res.data
}

// 상세 조회
export type InspectionDetailRequest = {
  post_id: number //포스트고유ID
}

export type InspectionDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  post: InspectionListPost //상세데이터
}

export const getInspectionDetail = async (data: InspectionDetailRequest): Promise<InspectionDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<InspectionDetailResponse>("/posts/detail_inspection/", formData)
  return res.data
}

// 등록/수정
export type InspectionRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  inspection_date: string //점검일 YYYY-MM-DD
  type: number //점검종류(0부터시작)
  title: string //점검계획명
  result: number //점검결과(0:이상없음,1:주의,2:위험)
  contents: string //조치내용
  name: string //점검자
  info_id: number[] //기존점검지중유지할파일ID리스트
  inspection_info?: File[] //점검지파일
  photo_id: number[] //기존현장사진중유지할파일ID리스트
  photofiles?: File[] //현장사진
}

export type InspectionRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registInspection = async (data: InspectionRegistRequest): Promise<InspectionRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("inspection_date", data.inspection_date)
  fd.append("type", String(data.type))
  fd.append("title", data.title)
  fd.append("result", String(data.result))
  fd.append("contents", data.contents)
  fd.append("name", data.name)
  fd.append("info_id", JSON.stringify(data.info_id ?? []))
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))

  if (data.inspection_info && data.inspection_info.length > 0) {
    data.inspection_info.forEach(file => fd.append("inspection_info", file))
  }
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<InspectionRegistResponse>("/posts/manage_inspection/", fd)
  return res.data
}
