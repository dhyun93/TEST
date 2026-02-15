/**
 * 받은결재함 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 결재함 목록 조회
// ====================================================
export type ApprovalList_Request = {
  page?: number
  start_date?: string //YYYY-MM-DD
  end_date?: string //YYYY-MM-DD
  query?: string
  is_send: number //1,0 (0:받은결재함, 1:보낸결재함)
}
export type SentApprovalList_Post = {
  id: number //결재고유ID
  drafting_date: string //요청일 (YYYY-MM-DDTHH:MM:SS)
  category: number //결재유형
  contents: string //결재내용
  dafter: string //기안자
  state: number //상태(0:결재대기, 1:결재중, 2:결재완료, 3:반려)
}
export type ReceivedApprovalList_Post = {
  id: number
  drafting_date: string //기안일 (YYYY-MM-DDTHH:MM:SS)
  title: string //결재유형
  is_wrap_up: number //상태(0:결재대기, 1:결재완료, 2:결재반려)
  progress: number //결재진행
  total_progress: number //결재진행전체 (예: 3/4 = (결재진행):(결재진행전체))
  final: string //최종결재자
}

export type ApprovalList_Response = {
  code: number
  msg: string
  posts: ReceivedApprovalList_Post[] | SentApprovalList_Post[]
  all_page_count: number
  all_count: number
}
export const getReceivedApprovalList = async (data: ApprovalList_Request): Promise<ApprovalList_Response> => {
  const res = await axiosInstance.post<ApprovalList_Response>("/info/payment_list/", data)
  console.log("받은결재함리스트:", res)
  return res.data
}

// ====================================================
// 📋 결재 서명
// ====================================================
export type ReceivedApprovalSign_Request = {
  post_id: number
  seal?: File //새로운 서명일 경우에만
  my_seal: number //1,0 (내서명불러오기면 1, 새로운서명일경우 0) //내서명불러오기면 seal은 안보내도됨(서버에 있으니까). 새로운서명일경우 seal File로 보내면됨
  is_wrap_up: number //1,2 (1:결제완료, 2:결재반려)
}
export type ReceivedApprovalSign_Response = {
  code: number
  msg: string
}
export const sign_receivedApproval = async (data: ReceivedApprovalSign_Request): Promise<ReceivedApprovalSign_Response> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  formData.append("my_seal", String(data.my_seal))
  formData.append("is_wrap_up", String(data.is_wrap_up))

  // 파일
  if (data.seal) formData.append("seal", data.seal, data.seal.name)

  const res = await axiosInstance.post<ReceivedApprovalSign_Response>("/info/manage_payment/", formData)
  console.log("결재서명:", res)
  return res.data
}

// ====================================================
// 📋 결재 삭제
// ====================================================
export type ReceivedApprovalDelRequest = {
  post_id: number[] //포스트고유ID 리스트
  is_send: number //(0:받은결재함, 1:보낸결재함)
}
export type ReceivedApprovalDelResponse = {
  code: number
  msg: string
}
export const getApprovalDelete = async (data: ReceivedApprovalDelRequest): Promise<ReceivedApprovalDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  formData.append("is_send", String(data.is_send))

  const res = await axiosInstance.post<ReceivedApprovalDelResponse>("/info/delete_payment/", formData)
  console.log("결재함삭제:", res)
  return res.data
}
