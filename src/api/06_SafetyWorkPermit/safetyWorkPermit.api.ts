// 안전작업허가서 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type PtwListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
}

export type PtwFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type PtwListPost = {
  id: number //포스트고유ID
  category: number //작업유형(0:크레인운전 등)
  contents: string //작업내용
  potential_hazard: string //잠재위험요소
  risk_level: number //위험수준(0:낮음,1:중간,2:높음)
  safety_plan: string //안전조치계획
  place: string //작업장소
  start_date: string //작업시작일 YYYY-MM-DD
  end_date: string //작업종료일 YYYY-MM-DD
  start_time: string //작업시작시간 HH:MM
  end_time: string //작업종료시간 HH:MM
  workforce: number //작업인원
  memo: string //비고
  // TODO: 백엔드 확인 필요
  // approval_status: number //승인상태
  // user_name: string //등록인명
  // view_count: number //조회수
  photofile: PtwFile[] //첨부파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
  /**
   * TODO: [P0] 백엔드 API 검토자 필드 추가 필요
   * - 검토자 목록과 서명 상태 포함
   */
  reviewers?: PtwReviewer[] //검토자목록
}

export type PtwListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: PtwListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getPtwList = async (data: PtwListRequest): Promise<PtwListResponse> => {
  const res = await axiosInstance.post<PtwListResponse>("/posts/ptw_list/", data)
  return res.data
}

// 삭제
export type PtwDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type PtwDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deletePtw = async (data: PtwDeleteRequest): Promise<PtwDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<PtwDeleteResponse>("/posts/delete_ptw/", formData)
  return res.data
}

// 상세 조회
export type PtwDetailRequest = {
  post_id: number //포스트고유ID
}

export type PtwDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  post: PtwListPost //상세데이터
}

export const getPtwDetail = async (data: PtwDetailRequest): Promise<PtwDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<PtwDetailResponse>("/posts/detail_ptw/", formData)
  return res.data
}

// 검토자 정보
export type PtwReviewer = {
  role: string //역할(생산반장,생산팀장,안전담당자,승인자)
  user_id: number //조직도인력ID
  name: string //성명
  position: string //안전직위
  rank: string //직급
  phone: string //연락처
  subject: string //부서
}

// 등록/수정
export type PtwRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  category: number //작업유형(0:크레인운전 등)
  contents: string //작업내용
  potential_hazard: string //잠재위험요소
  risk_level: number //위험수준(0:낮음,1:중간,2:높음)
  safety_plan: string //안전조치계획
  place: string //작업장소
  start_date: string //작업시작일 YYYY-MM-DD
  end_date: string //작업종료일 YYYY-MM-DD
  start_time: string //시작시간 HH:MM
  end_time: string //종료시간 HH:MM
  workforce: number //작업인원
  memo: string //비고
  photo_id: number[] //기존파일중유지할파일ID리스트
  photofiles?: File[] //새로추가되는파일
  /**
   * TODO: [P0] 백엔드 API 검토자 필드 추가 필요
   * - 담당: 백엔드팀
   * - 예상 완료: 2026-02-25
   * - 의존성: 백엔드 /posts/manage_ptw/ 검토자 필드 추가
   * - 관련: 전자서명 시스템 (카카오톡 알림 연동)
   * - 설명: 검토 및 서명란 기능을 위한 검토자 정보 필드
   * - 포함 정보: 역할, 조직도 인력 ID, 성명, 연락처 등
   */
  reviewers?: PtwReviewer[] //검토자목록
}

export type PtwRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registPtw = async (data: PtwRegistRequest): Promise<PtwRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("category", String(data.category))
  fd.append("contents", data.contents)
  fd.append("potential_hazard", data.potential_hazard)
  fd.append("risk_level", String(data.risk_level))
  fd.append("safety_plan", data.safety_plan)
  fd.append("place", data.place)
  fd.append("start_date", data.start_date)
  fd.append("end_date", data.end_date)
  fd.append("start_time", data.start_time)
  fd.append("end_time", data.end_time)
  fd.append("workforce", String(data.workforce))
  fd.append("memo", data.memo)
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))

  // TODO: 백엔드 API 검토자 필드 추가 대기
  if (data.reviewers && data.reviewers.length > 0) {
    fd.append("reviewers", JSON.stringify(data.reviewers))
  }

  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<PtwRegistResponse>("/posts/manage_ptw/", fd)
  return res.data
}
