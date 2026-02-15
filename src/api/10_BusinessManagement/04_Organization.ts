/**
 * 사업장관리 > 조직도 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// 전체인력목록 조회
export type OrganizationListRequest = {
  page: number //페이지번호
  is_over: number //일반리스트:0,이월예산불러오기:1
  end_date: string //검색년도 YYYY
}

export type OrganizationListPost = {
  id: number //포스트고유ID
  name: string //성함
  position: number //안전직위
  subject: string //부서
  rank: string //직급
  phone: string //연락처
  employment_date: string //입사일 YYYY-MM-DD
  designated_date: string //지정일 YYYY-MM-DD
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type OrganizationListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: OrganizationListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getOrganizationList = async (data: OrganizationListRequest): Promise<OrganizationListResponse> => {
  const fd = new FormData()
  fd.append("page", String(data.page))
  fd.append("is_over", String(data.is_over))
  fd.append("end_date", data.end_date)
  const res = await axiosInstance.post<OrganizationListResponse>("/posts/organization_list/", fd)
  return res.data
}

// 전체인력목록 삭제
export type OrganizationDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type OrganizationDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteOrganization = async (data: OrganizationDeleteRequest): Promise<OrganizationDeleteResponse> => {
  const fd = new FormData()
  fd.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<OrganizationDeleteResponse>("/posts/delete_organization/", fd)
  return res.data
}

// 전체인력목록 등록/수정
export type OrganizationRegistItem = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  name: string //성함
  position: number //안전직위
  subject: string //부서
  rank: string //직급
  phone: string //연락처
  employment_date: string //입사일 YYYY-MM-DD
  designated_date?: string //지정일 YYYY-MM-DD
}

export type OrganizationRegistRequest = {
  data: OrganizationRegistItem[] //등록/수정데이터배열
}

export type OrganizationRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registOrganization = async (data: OrganizationRegistRequest): Promise<OrganizationRegistResponse> => {
  const fd = new FormData()
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<OrganizationRegistResponse>("/posts/manage_organization/", fd)
  return res.data
}

// 조직도 이미지 등록
export type OrganizationUploadRequest = {
  image: File //조직도이미지파일
}

export type OrganizationUploadResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const uploadOrganization = async (data: OrganizationUploadRequest): Promise<OrganizationUploadResponse> => {
  const fd = new FormData()
  fd.append("image", data.image)
  const res = await axiosInstance.post<OrganizationUploadResponse>("/posts/upload_organization/", fd)
  return res.data
}
