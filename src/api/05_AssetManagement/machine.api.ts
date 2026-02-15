// 위험기계 기구 설비 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회 요청
export type MachineListRequest = {
  page?: number
  start_date?: string
  end_date?: string
  query?: string
}

// 파일 타입
export type MachineFile = {
  id: number
  url: string
}

// 목록 아이템
export type MachineListPost = {
  id: number
  name: string
  capacity: string
  unit: number
  quantity: number
  place: string
  inspection_interval: number
  inspection_date: string
  potential_hazards: string
  is_alarm: number
  alarm_time: number
  is_repeat: number
  photofile: MachineFile[]
  created_at: string
}

// 목록 조회 응답
export type MachineListResponse = {
  code: number
  msg: string
  posts: MachineListPost[]
  all_page_count: number
  all_count: number
}

// 목록 조회
export const getMachineList = async (data: MachineListRequest): Promise<MachineListResponse> => {
  const res = await axiosInstance.post<MachineListResponse>("/posts/hazardous_list/", data)
  return res.data
}

// 삭제 요청
export type MachineDeleteRequest = {
  post_id: number[]
}

// 삭제 응답
export type MachineDeleteResponse = {
  code: number
  msg: string
}

// 삭제
export const deleteMachine = async (data: MachineDeleteRequest): Promise<MachineDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<MachineDeleteResponse>("/posts/delete_hazardous/", formData)
  return res.data
}

// 등록 수정 요청
export type MachineRegistRequest = {
  post_id: number
  name: string
  capacity: string
  unit: number
  quantity: number
  place: string
  inspection_interval: number
  inspection_date: string
  potential_hazards: string
  is_alarm: number
  alarm_time: number
  is_repeat: number
  photo_id: number[]
  photofiles?: File[]
}

// 등록 수정 응답
export type MachineRegistResponse = {
  code: number
  msg: string
}

// 등록 수정
export const registMachine = async (data: MachineRegistRequest): Promise<MachineRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("name", data.name)
  fd.append("capacity", data.capacity)
  fd.append("unit", String(data.unit))
  fd.append("quantity", String(data.quantity))
  fd.append("place", data.place)
  fd.append("inspection_interval", String(data.inspection_interval))
  fd.append("inspection_date", data.inspection_date)
  fd.append("potential_hazards", data.potential_hazards)
  fd.append("is_alarm", String(data.is_alarm))
  fd.append("alarm_time", String(data.alarm_time))
  fd.append("is_repeat", String(data.is_repeat))
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))

  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<MachineRegistResponse>("/posts/manage_hazardous/", fd)
  return res.data
}
