// 안전보건 교육/훈련 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type TrainingListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type TrainingFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type TrainingListPost = {
  id: number //포스트고유ID
  name: string //도급협의체명
  updated_at: string //최종업데이트날짜 YYYY-MM-DD
  is_danger: number //위험성평가확인(0:미완료,1:완료)
  is_hazardous: number //유해물질확인(0:미완료,1:완료)
  is_manual: number //대응매뉴얼확인(0:미완료,1:완료)
  memo: string //개선및조치사항
  files: TrainingFile[] //첨부파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type TrainingListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: TrainingListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getTrainingList = async (data: TrainingListRequest): Promise<TrainingListResponse> => {
  const res = await axiosInstance.post<TrainingListResponse>("/posts/training_list/", data)
  return res.data
}

// 삭제
export type TrainingDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type TrainingDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteTraining = async (data: TrainingDeleteRequest): Promise<TrainingDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<TrainingDeleteResponse>("/posts/delete_training/", formData)
  return res.data
}

// 상세 조회
export type TrainingDetailRequest = {
  post_id: number //포스트고유ID
}

export type TrainingDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  post: TrainingListPost //상세데이터
}

export const getTrainingDetail = async (data: TrainingDetailRequest): Promise<TrainingDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<TrainingDetailResponse>("/posts/detail_training/", formData)
  return res.data
}

// 등록/수정
export type TrainingRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  name: string //도급협의체명
  updated_at: string //최종업데이트날짜 YYYY-MM-DD
  is_danger: number //위험성평가확인(0:미완료,1:완료)
  is_hazardous: number //유해물질확인(0:미완료,1:완료)
  is_manual: number //대응매뉴얼확인(0:미완료,1:완료)
  memo: string //개선및조치사항
  files_id: number[] //기존파일중유지할파일ID리스트
  files?: File[] //첨부파일
}

export type TrainingRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registTraining = async (data: TrainingRegistRequest): Promise<TrainingRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("name", data.name)
  fd.append("updated_at", data.updated_at)
  fd.append("is_danger", String(data.is_danger))
  fd.append("is_hazardous", String(data.is_hazardous))
  fd.append("is_manual", String(data.is_manual))
  fd.append("memo", data.memo)
  fd.append("files_id", JSON.stringify(data.files_id ?? []))

  if (data.files && data.files.length > 0) {
    data.files.forEach(file => fd.append("files", file))
  }

  const res = await axiosInstance.post<TrainingRegistResponse>("/posts/manage_training/", fd)
  return res.data
}
