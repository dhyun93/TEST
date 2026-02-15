// 1:1 지원 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 문의 등록
export type SupportRequest = {
  category: number //문의유형(0부터시작)
  title: string //제목
  contents: string //내용
  email: string //이메일
}

export type SupportResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registSupport = async (data: SupportRequest): Promise<SupportResponse> => {
  const fd = new FormData()

  fd.append("category", String(data.category))
  fd.append("title", data.title)
  fd.append("contents", data.contents)
  fd.append("email", data.email)

  const res = await axiosInstance.post<SupportResponse>("/info/set_support/", fd)
  return res.data
}
