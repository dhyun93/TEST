// 도급안전보건 협의체 회의록 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type ContractSafetyListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type ContractSafetyFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type ContractSafetyListPost = {
  id: number //포스트고유ID
  meet_date: string //회의일 YYYY-MM-DD
  start_time: string //회의시작시간 HH:MM
  end_time: string //회의종료시간 HH:MM
  place: string //회의장소
  contractor: string //도급인
  recipient: string //수급인
  contents: string //회의내용
  // TODO: 백엔드 확인 필요
  // user_name: string //작성자명
  photofile: ContractSafetyFile[] //현장사진
  proceedings: ContractSafetyFile[] //회의록파일
  file: ContractSafetyFile[] //첨부파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type ContractSafetyListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: ContractSafetyListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getContractSafetyList = async (data: ContractSafetyListRequest): Promise<ContractSafetyListResponse> => {
  const res = await axiosInstance.post<ContractSafetyListResponse>("/posts/contract_safety_list/", data)
  return res.data
}

// 삭제
export type ContractSafetyDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type ContractSafetyDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteContractSafety = async (data: ContractSafetyDeleteRequest): Promise<ContractSafetyDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<ContractSafetyDeleteResponse>("/posts/delete_contract_safety/", formData)
  return res.data
}

// 등록/수정
export type ContractSafetyRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  meet_date: string //회의일 YYYY-MM-DD
  start_time: string //회의시작시간 HH:MM
  end_time: string //회의종료시간 HH:MM
  place: string //회의장소
  contractor: string //도급인
  recipient: string //수급인
  contents: string //회의내용
  photo_id: number[] //기존현장사진중유지할파일ID리스트
  photofiles?: File[] //현장사진
  proceed_id: number[] //기존회의록중유지할파일ID리스트
  proceedings?: File[] //회의록파일
  file?: File[] //첨부파일
}

export type ContractSafetyRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registContractSafety = async (data: ContractSafetyRegistRequest): Promise<ContractSafetyRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("meet_date", data.meet_date)
  fd.append("start_time", data.start_time)
  fd.append("end_time", data.end_time)
  fd.append("place", data.place)
  fd.append("contractor", data.contractor)
  fd.append("recipient", data.recipient)
  fd.append("contents", data.contents)
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))
  fd.append("proceed_id", JSON.stringify(data.proceed_id ?? []))

  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }
  if (data.proceedings && data.proceedings.length > 0) {
    data.proceedings.forEach(file => fd.append("proceedings", file))
  }
  if (data.file && data.file.length > 0) {
    data.file.forEach(file => fd.append("file", file))
  }

  const res = await axiosInstance.post<ContractSafetyRegistResponse>("/posts/manage_contract_safety/", fd)
  return res.data
}
