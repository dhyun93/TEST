/**
 * 사업장관리 > 기본사업장관리 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 기본사업장관리 조회
// ====================================================
export type BaseManageInfoPost = {
  id: number
  title: string //회사명
  ceo_name: string //대표자이름
  business_num: string //사업자등록번호 000-00000-00
  phone: string //핸드폰번호 01000001111
  address: string //주소지
  business_type: number //업종
  subject: number //업태
  updated_at: string //YYYY-MM-DDTHH:MM:SS.SSS
  code: string //???
  state: number //1,0 //???
  created_at: string //YYYY-MM-DD
  memo: string //???
  is_alarm: number //1,0
  link: string //???
  seal: string //서명이미지url
}
export type BaseManageInfoResponse = {
  code: number
  msg: string
  posts: BaseManageInfoPost
}
export const getBaseManageInfo = async (): Promise<BaseManageInfoResponse> => {
  const res = await axiosInstance.get<BaseManageInfoResponse>("/posts/business_info/")
  console.log("기본사업장정보:", res)
  return res.data
}

// ====================================================
// 📋 기본사업장정보 등록/편집
// ====================================================
export type BaseManageRegistRequest = {
  title: string
  ceo_name: string
  business_num: string
  phone: string
  address: string
  business_type: number
  subject: number
  seal?: File
}
export type BaseManageRegistResponse = {
  msg: string
  code: number
}
export const registBaseManageInfo = async (data: BaseManageRegistRequest): Promise<BaseManageRegistResponse> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("title", data.title)
  fd.append("ceo_name", data.ceo_name)
  fd.append("business_num", data.business_num)
  fd.append("phone", data.phone)
  fd.append("address", data.address)
  fd.append("business_type", String(data.business_type))
  fd.append("subject", String(data.subject))

  // 파일
  if (data.seal) fd.append("seal", data.seal, data.seal.name)

  const res = await axiosInstance.post<BaseManageRegistResponse>("/posts/manage_business/", fd)
  console.log("기본사업장정보등록/수정:", res)
  return res.data
}

// ====================================================
// 📋 사업장목록 조회
// ====================================================
export type BusinessPlaceListRequest = {
  page?: number
}
export type BusinessPlaceListPost = {
  id: number
  business_id_id: number | string
  title: string
  manager: string
  phone: string //010-0000-0000
  address: string
}
export type BusinessPlaceListResponse = {
  code: number
  msg: string
  posts: BusinessPlaceListPost[]
  all_page_count: number
  all_count: number
}
export const getBusinessPlaceList = async (data: BusinessPlaceListRequest): Promise<BusinessPlaceListResponse> => {
  const res = await axiosInstance.post<BusinessPlaceListResponse>("/posts/business_place_list/", data)
  console.log("사업장목록조회:", res)
  return res.data
}

// ====================================================
// 📋 사업장목록 삭제
// ====================================================
// TODO: 확인필요: 현재 퍼블리싱디자인에는 사업장목록 삭제가 존재하지 않음
export type BusinessPlaceListDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type BusinessPlaceListDelResponse = {
  code: number
  msg: string
}
export const getBusinessPlaceDelete = async (data: BusinessPlaceListDelRequest): Promise<BusinessPlaceListDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<BusinessPlaceListDelResponse>("/posts/delete_business_place/", formData)
  console.log("사업장리스트삭제:", res)
  return res.data
}

// ====================================================
// 📋 사업장목록 등록/수정
// ====================================================
export type BusinessPlaceListRequestItem = {
  id?: number
  title: string
  manager: string
  phone: string //010-0000-0000
  address: string
}
export type BusinessPlaceListResponseItem = {
  msg: string
  code: number
}
export const manageBusinessPlaceList = async (data: BusinessPlaceListRequestItem[]) => {
  const formData = new FormData()
  formData.append("data", JSON.stringify(data))

  const res = await axiosInstance.post<BusinessPlaceListResponseItem>("/posts/manage_business_place/", formData)
  console.log("기본사업장관리 수정/등록: ", res)
  return res.data
}
