// 공지사항 / 자료실 통합 API (is_notice 파라미터로 구분)

import { axiosInstance } from "@/utils/axiosInterceptor"

// 목록 조회
export type NoticeListRequest = {
  page?: number //페이지번호
  start_date?: string //검색시작일 YYYY-MM-DD
  end_date?: string //검색종료일 YYYY-MM-DD
  query?: string //검색어
  is_notice: number //0:자료실, 1:공지사항
}

export type NoticeFile = {
  id: number //파일고유ID
  url: string //파일URL
}

export type NoticeListPost = {
  id: number //포스트고유ID
  title: string //제목
  contents: string //내용
  date: string //작성일 YYYY-MM-DD
  is_notice: number //0:자료실, 1:공지사항
  /**
   * TODO: [P1] 백엔드 API 응답 필드 확정 필요
   * - 담당: 백엔드팀
   * - 예상 완료: 2026-03-01
   * - 의존성: 백엔드 /posts/board_list/ 스펙 확정
   * - 임시 처리: optional 필드로 처리, UI에서 미표시
   * - 관련: api-spec.json (NoticeBoard 섹션)
   */
  // user_name: string //작성자명
  // view_count: number //조회수
  photofile: NoticeFile[] //첨부파일
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS
}

export type NoticeListResponse = {
  code: number //응답코드
  msg: string //응답메시지
  posts: NoticeListPost[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getNoticeList = async (data: NoticeListRequest): Promise<NoticeListResponse> => {
  const res = await axiosInstance.post<NoticeListResponse>("/info/notice_list/", data)
  return res.data
}

// 삭제
export type NoticeDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type NoticeDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteNotice = async (data: NoticeDeleteRequest): Promise<NoticeDeleteResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<NoticeDeleteResponse>("/info/delete_notice/", formData)
  return res.data
}

// 상세 조회
export type NoticeDetailRequest = {
  post_id: number //포스트고유ID
}

export type NoticeDetailResponse = {
  code: number //응답코드
  msg: string //응답메시지
  post: NoticeListPost //상세데이터
}

export const getNoticeDetail = async (data: NoticeDetailRequest): Promise<NoticeDetailResponse> => {
  const formData = new FormData()
  formData.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<NoticeDetailResponse>("/info/detail_notice/", formData)
  return res.data
}

// 등록/수정
export type NoticeRegistRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  title: string //제목
  date: string //작성일 YYYY-MM-DD
  contents: string //내용
  is_notice: number //0:자료실, 1:공지사항
  photo_id: number[] //기존파일중유지할파일ID리스트
  photofiles?: File[] //새로추가되는파일
}

export type NoticeRegistResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const registNotice = async (data: NoticeRegistRequest): Promise<NoticeRegistResponse> => {
  const fd = new FormData()

  fd.append("post_id", String(data.post_id ?? 0))
  fd.append("title", data.title)
  fd.append("date", data.date)
  fd.append("contents", data.contents)
  fd.append("is_notice", String(data.is_notice))
  fd.append("photo_id", JSON.stringify(data.photo_id ?? []))

  if (data.photofiles && data.photofiles.length > 0) {
    data.photofiles.forEach(file => fd.append("photofiles", file))
  }

  const res = await axiosInstance.post<NoticeRegistResponse>("/info/manage_notice/", fd)
  return res.data
}
