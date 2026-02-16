/**
 * 법률 검색 API
 * 국가법령정보센터 연동 (중대재해처벌법 등)
 *
 * @module LawAPI
 */

import { axiosInstance } from '@/utils/axiosInterceptor'

// ============================================================
// 타입 정의
// ============================================================

/** 법률 항목 */
export interface LawItem {
  id: number
  title: string           // 법령명
  organization: string    // 소관기관 (고용노동부, 환경부 등)
  date: string            // 시행일자 (YYYY-MM-DD)
  content: string         // 상세 내용 (약칭, 법령구분, 공포일자 등)
  fileAttach: boolean     // 첨부파일 여부
  link?: string           // 법령 상세 링크
}

/** 법률 검색 요청 */
export interface LawSearchRequest {
  query?: string          // 검색어 (기본값: '중대재해')
  page?: number           // 페이지 번호 (기본값: 1)
  display?: number        // 페이지당 건수 (기본값: 20)
}

/** 법률 검색 응답 */
export interface LawSearchResponse {
  code: number
  msg: string
  data: LawItem[]
  total: number
}

// ============================================================
// API 함수
// ============================================================

/**
 * 법률 검색
 *
 * @param params - 검색 조건
 * @returns 법률 목록
 *
 * @example
 * ```ts
 * const result = await searchLaws({ query: '중대재해', page: 1 })
 * console.log(result.data) // LawItem[]
 * ```
 */
export async function searchLaws(params: LawSearchRequest = {}): Promise<LawSearchResponse> {
  const formData = new FormData()
  formData.append('query', params.query || '중대재해')
  formData.append('page', String(params.page || 1))
  formData.append('display', String(params.display || 20))

  const response = await axiosInstance.post<LawSearchResponse>(
    '/info/law_search/',
    formData
  )
  return response.data
}
