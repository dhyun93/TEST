/**
 * SafeOn Agent - 추천 API
 * KOSHA 데이터 기반 AI 추천 시스템
 *
 * @module RecommendAPI
 * @author SafeOn Agent
 * @date 2026-02-16
 */

import { axiosInstance } from '@/utils/axiosInterceptor';

// ============================================================
// 타입 정의
// ============================================================

/**
 * 공정 (Process)
 */
export interface Process {
  id: number;
  code: string;              // 예: "PROC_0001"
  name: string | null;       // 공정명 (현재 null, 향후 확장 가능)
  hazard_count: number;      // 연결된 위험요인 개수
}

/**
 * 위험요인 (Hazard)
 */
export interface Hazard {
  id: number;
  code: string;              // 예: "H_0001"
  description: string;       // 위험요인 설명
  category: string | null;   // 카테고리 (물리적, 화학적, 인간공학적 등)
  frequency: number;         // 빈도 (높을수록 흔한 위험)
  confidence: number;        // 추천 신뢰도 (0.0 ~ 1.0)
}

/**
 * 안전조치 (Measure)
 */
export interface Measure {
  measure_id: number;
  measure: string;           // 조치 설명
  regulation: string | null; // 관련 법규 조항명
  article_num: number | null;// 법규 조항 번호
  is_mandatory: boolean;     // 필수조치 여부 (빈도 상위 20%)
  priority_order: number;    // 우선순위 (1부터 시작)
}

/**
 * 위험요인별 안전조치 그룹
 */
export interface HazardWithMeasures {
  hazard_id: number;
  hazard: string;            // 위험요인 설명
  measures: Measure[];       // 안전조치 목록
}

/**
 * 피드백 요청 (Feedback Request)
 */
export interface FeedbackRequest {
  business_id: number;                    // 사업장 ID
  user_id: number;                        // 사용자 ID
  input_keyword?: string;                 // 검색 키워드 (선택)
  selected_process_ids: string;           // 선택한 공정 IDs (쉼표 구분: "1,2,3")
  recommended_hazard_ids: string;         // 추천된 위험요인 IDs
  recommended_measure_ids: string;        // 추천된 조치 IDs
  accepted_hazard_ids?: string;           // 수락한 위험요인 IDs
  rejected_hazard_ids?: string;           // 거부한 위험요인 IDs
  added_hazard_ids?: string;              // 사용자가 추가한 위험요인 IDs
  accepted_measure_ids?: string;          // 수락한 조치 IDs
  rejected_measure_ids?: string;          // 거부한 조치 IDs
}

/**
 * 피드백 응답 (Feedback Response)
 */
export interface FeedbackResponse {
  id: number;
  business_id: number;
  user_id: number;
  hazard_acceptance_rate: number | null;  // 위험요인 수락률 (0.0 ~ 1.0)
  measure_acceptance_rate: number | null; // 조치 수락률 (0.0 ~ 1.0)
  created_at: string;                     // ISO 8601 timestamp
}

// ============================================================
// API 응답 타입
// ============================================================

export interface ProcessSearchResponse {
  processes: Process[];
}

export interface HazardRecommendResponse {
  hazards: Hazard[];
}

export interface MeasureRecommendResponse {
  measures_by_hazard: HazardWithMeasures[];
}

// ============================================================
// API 함수
// ============================================================

/**
 * EP1: 공정 검색
 *
 * @param keyword - 검색 키워드 (공정 코드 또는 이름)
 * @returns 공정 목록 (위험요인 개수 순으로 정렬)
 *
 * @example
 * ```ts
 * const result = await searchProcesses('PROC_0001');
 * console.log(result.processes); // [{ id: 1, code: "PROC_0001", hazard_count: 5 }]
 * ```
 */
export async function searchProcesses(keyword: string): Promise<ProcessSearchResponse> {
  const response = await axiosInstance.get<ProcessSearchResponse>(
    `/api/recommend/processes`,
    { params: { keyword } }
  );
  return response.data;
}

/**
 * EP2: 위험요인 추천
 *
 * @param processIds - 선택한 공정 ID 배열
 * @returns 위험요인 목록 (빈도 + 신뢰도 순으로 정렬)
 *
 * @example
 * ```ts
 * const result = await recommendHazards([1, 2, 3]);
 * console.log(result.hazards); // 빈도가 높은 위험요인부터 반환
 * ```
 */
export async function recommendHazards(processIds: number[]): Promise<HazardRecommendResponse> {
  const response = await axiosInstance.get<HazardRecommendResponse>(
    `/api/recommend/hazards`,
    { params: { process_ids: processIds.join(',') } }
  );
  return response.data;
}

/**
 * EP3: 안전조치 추천
 *
 * @param hazardIds - 선택한 위험요인 ID 배열
 * @returns 위험요인별 안전조치 목록 (우선순위 순으로 정렬)
 *
 * @example
 * ```ts
 * const result = await recommendMeasures([10, 11, 12]);
 * result.measures_by_hazard.forEach(group => {
 *   console.log(`위험요인: ${group.hazard}`);
 *   console.log(`조치 목록:`, group.measures);
 * });
 * ```
 */
export async function recommendMeasures(hazardIds: number[]): Promise<MeasureRecommendResponse> {
  const response = await axiosInstance.get<MeasureRecommendResponse>(
    `/api/recommend/measures`,
    { params: { hazard_ids: hazardIds.join(',') } }
  );
  return response.data;
}

/**
 * EP4: 피드백 제출
 *
 * @param feedback - 피드백 데이터 (추천 결과에 대한 사용자 반응)
 * @returns 피드백 기록 (수락률 포함)
 *
 * @example
 * ```ts
 * const feedback = await submitFeedback({
 *   business_id: 1,
 *   user_id: 42,
 *   selected_process_ids: "1,2,3",
 *   recommended_hazard_ids: "10,11,12",
 *   recommended_measure_ids: "50,51,52",
 *   accepted_hazard_ids: "10,11",
 *   rejected_hazard_ids: "12",
 *   accepted_measure_ids: "50,51",
 *   rejected_measure_ids: "52"
 * });
 * console.log(`위험요인 수락률: ${feedback.hazard_acceptance_rate * 100}%`);
 * ```
 */
export async function submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
  const response = await axiosInstance.post<FeedbackResponse>(
    `/api/recommend/feedback`,
    feedback
  );
  return response.data;
}

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * ID 배열을 쉼표 구분 문자열로 변환
 *
 * @param ids - ID 배열
 * @returns 쉼표 구분 문자열 ("1,2,3")
 */
export function idsToString(ids: number[]): string {
  return ids.join(',');
}

/**
 * 쉼표 구분 문자열을 ID 배열로 변환
 *
 * @param str - 쉼표 구분 문자열 ("1,2,3")
 * @returns ID 배열
 */
export function stringToIds(str: string): number[] {
  return str.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
}

/**
 * 수락률 계산 (위험요인)
 *
 * @param recommended - 추천된 위험요인 개수
 * @param accepted - 수락한 위험요인 개수
 * @param added - 사용자가 추가한 위험요인 개수
 * @returns 수락률 (0.0 ~ 1.0)
 */
export function calculateHazardAcceptanceRate(
  recommended: number,
  accepted: number,
  added: number
): number {
  const total = recommended + added;
  return total > 0 ? (accepted + added) / total : 0;
}

/**
 * 수락률 계산 (조치)
 *
 * @param recommended - 추천된 조치 개수
 * @param accepted - 수락한 조치 개수
 * @returns 수락률 (0.0 ~ 1.0)
 */
export function calculateMeasureAcceptanceRate(
  recommended: number,
  accepted: number
): number {
  return recommended > 0 ? accepted / recommended : 0;
}
