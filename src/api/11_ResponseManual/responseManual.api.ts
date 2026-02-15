/**
 * 대응매뉴얼 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 대응매뉴얼 목록 조회
// ====================================================
export type ResponseManualListRequest = {
  page?: number
  start_date?: string //YYYY-MM-DD
  end_date?: string //YYYY-MM-DD
  query?: string
}
export type ResponseManualFile = {
  id: number
  url: string
}
export type ResponseManualListPost = {
  id: number
  business_id_id: number | string //???
  title: string
  userid_id: number
  contents: string //응답예:"<h3>전기 감전사고 비상조치 매뉴얼전기 감전사고 비상조치 매뉴얼</h3><p><strong>목적</strong></p><p>감전사고 발생 시 신속한 응급조치와 안전확보로 인명피해 최소화</p><p><strong>조치 절차</strong></p><ol><li><strong>전원 차단</strong>: 즉시 전기 공급 중단</li><li><strong>피해자 분리</strong>: 절연체(고무장갑, 목재 등) 사용해 접촉 해제</li><li><strong>응급조치</strong>: 의식·호흡 확인 후 필요 시 심폐소생술(CPR) 시행</li><li><strong>신고 및 이송</strong>: 즉시 119 신고 후 의료기관 이송</li><li><strong>현장 안전 확보</strong>: 2차 감전 방지, 원인점검 및 임시 조치</li></ol><p><strong>사후 관리</strong></p><ul><li>사고 원인 조사 및 재발방지 대책 수립</li><li>관련 근로자 안전교육 및 설비 점검 강화</li></ul>"
  date: string //YYYY-MM-DD
  files: ResponseManualFile[]
  created_at: string //YYYY-MM-DDTHH:MM:SS.SSS
  view_count: number
  username: string
}
export type ResponseManualListResponse = {
  code: number
  msg: string
  posts: ResponseManualListPost[]
  all_page_count: number
  all_count: number
}
export const getResponseManualList = async (data: ResponseManualListRequest): Promise<ResponseManualListResponse> => {
  const res = await axiosInstance.post<ResponseManualListResponse>("/info/response_manual_list/", data)
  console.log("대응매뉴얼리스트:", res)
  return res.data
}

// ====================================================
// 📋 대응매뉴얼 목록 삭제
// ====================================================
export type ResponseManualDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type ResponseManualDelResponse = {
  code: number
  msg: string
}
export const getResponseManualDelete = async (data: ResponseManualDelRequest): Promise<ResponseManualDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<ResponseManualDelResponse>("/info/delete_response_manual/", formData)
  console.log("대응매뉴얼리스트삭제:", res)
  return res.data
}

// ====================================================
// 📋 대응매뉴얼 편집/등록
// ====================================================
export type ResponseManualRegistRequest = {
  post_id: number
  title: string //제목
  contents: string //내용
  date: string //작성일(YYYY-MM-DD) //추후 이건 안보내되 되도록하는게 나을것같음
  files: File[] //신규파일업로드(???)
  photofiles: File[] //신규파일업로드 (이걸로 사용하기)
  photo_id: number[] //기존파일 중 유지할 항목 id
}
export type ResponseManualRegistResponse = {
  code: number
  msg: string
}
export const regist_responseManual = async (data: ResponseManualRegistRequest): Promise<ResponseManualRegistResponse> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("title", data.title)
  fd.append("contents", data.contents)
  fd.append("date", data.date)

  // 기존 파일 ID 리스트 (JSON 형태로)
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))

  // 새 현장사진 파일들
  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<ResponseManualRegistResponse>("/info/manage_response_manual/", fd)
  console.log("대응매뉴얼편집/등록:", res)
  return res.data
}
