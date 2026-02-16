/**
 * 백엔드 API 미확정 필드 타입 정의
 *
 * 이 파일은 백엔드 API 스펙이 확정되지 않은 필드들을 정리합니다.
 * 백엔드 작업 완료 후 해당 필드를 required로 변경하거나 삭제해야 합니다.
 */

/**
 * 공지사항 (NoticeList)
 * 파일: src/api/08_NoticeBoard/noticeList.api.ts
 */
export interface NoticeExtended {
  id: number
  title: string
  content: string
  created_at: string
  updated_at?: string

  /**
   * TODO: 백엔드 API 확정 후 required로 변경
   * 현재 백엔드에서 해당 필드를 보내지 않음
   */
  user_name?: string      // 작성자
  view_count?: number     // 조회수
}

/**
 * 안전작업허가 (SafetyWorkPermit)
 * 파일: src/api/06_SafetyWorkPermit/safetyWorkPermit.api.ts
 */
export interface SafetyWorkPermitExtended {
  id: number
  title: string
  work_date: string
  location: string
  status: string

  /**
   * TODO: 백엔드 API 확정 후 required로 변경
   */
  approval_status?: string  // 결재 상태
  user_name?: string        // 작성자
}

/**
 * 협력사 평가 (Evaluation)
 * 파일: src/api/09_SupplyChainManagement/evaluation.api.ts
 */
export interface EvaluationExtended {
  id: number
  partner_name: string
  evaluation_date: string
  type: number  // 0=선정평가, 1=정기평가, 2=재평가, 3=수시평가, 4=기타
  score: number
  result: string

  /**
   * TODO: 백엔드 API 확정 후 required로 변경
   */
  evaluator?: string  // 평가자
}

/**
 * 도급협의체 (Committee)
 * 파일: src/api/09_SupplyChainManagement/committee.api.ts
 */
export interface CommitteeExtended {
  id: number
  title: string
  meeting_date: string
  location: string
  attendee_count: number

  /**
   * TODO: 백엔드 API 확정 후 required로 변경
   */
  user_name?: string      // 작성자
  photofile?: string      // 사진 파일
}

/**
 * 현장점검 (SiteAudit)
 * 파일: src/api/09_SupplyChainManagement/siteAudit.api.ts
 */
export interface SiteAuditExtended {
  id: number
  partner_name: string
  inspection_date: string
  location: string

  /**
   * 점검 종류 (숫자)
   * 0=정기점검, 1=수시점검, 2=특별점검, 3=합동점검, 4=기타
   */
  type: number

  /**
   * 점검 종류 (문자열) - 백엔드에서 매핑 제공
   */
  type_name?: string

  /**
   * 점검 결과 (숫자)
   * 0=이상없음, 1=주의, 2=위험
   */
  result: number

  /**
   * 점검 결과 (문자열) - 백엔드에서 매핑 제공
   */
  result_name?: string
}

/**
 * 조직도 직위 (Organization Position)
 * 파일: src/pages/BusinessManagement/Organization.tsx
 */
export interface OrganizationStaffExtended {
  id: number
  name: string
  department: string
  phone: string
  email: string

  /**
   * 안전직위 (숫자) - 백엔드 Profile.is_level 확정
   * 0: 일반(해당없음)
   * 1: 안전보건관리책임자
   * 2: 안전관리자
   * 3: 보건관리자
   * 4: 관리감독자
   * 5: 경영책임자
   */
  position: number

  /**
   * 안전직위 (문자열) - 백엔드에서 매핑 제공
   */
  position_name?: string

  /**
   * 선임신고서 파일 URL
   * NOTE: DB에 필드 없음 - 추가하려면 ALTER TABLE 필요
   * ALTER TABLE posts_organizationchart ADD COLUMN appointment_certificate VARCHAR(255);
   */
  appointment_certificate?: string
}

/**
 * 안전교육 (Education)
 * 파일: src/api/03_SafetyEducation/education.api.ts
 */
export interface EducationExtended {
  id: number
  title: string
  education_date: string
  location: string
  instructor: string
  attendee_count: number

  risk_title?: string  // 위험성평가 제목
}

/**
 * 조직도 이미지
 * 파일: src/pages/BusinessManagement/Organization.tsx:236
 */
export interface OrganizationImageExtended {
  /**
   * 조직도 이미지 URL
   * GET /posts/organization_list/ 응답의 'image' 필드에서 제공됨
   */
  organization_image_url?: string
}

/**
 * 날씨 정보
 * 백엔드 구현 완료: GET /info/weather/
 */
export interface WeatherInfo {
  temperature?: number
  condition?: string
  humidity?: number
  location?: string
}

/**
 * 배너 정보
 * 백엔드 구현 완료: GET /info/banners/
 */
export interface BannerInfo {
  id?: number
  title?: string
  image_url?: string
  link_url?: string
}

/**
 * 알림 전송 요청
 * 백엔드 구현 완료: POST /api/notifications/send/
 * FCM 앱 푸시 방식 채택 (api/15_Notification/notification.api.ts 참조)
 */
export interface NotificationSendRequest {
  title: string
  contents: string
  category: number                // Alarm.category (0=TBM, 4=교육 등)
  user_ids?: number[]             // 수신자 user_id 배열
  phones?: string[]               // 수신자 전화번호 배열 (user_ids 대안)
}

/**
 * 전체 엑셀 생성
 * 백엔드 미작업 (⚪️)
 */
export interface ExcelGenerateRequest {
  start_date?: string
  end_date?: string
  modules?: string[]  // 포함할 모듈 목록
}

/**
 * 타입 가드 헬퍼
 */
export const hasUserName = (obj: any): obj is { user_name: string } => {
  return typeof obj?.user_name === 'string'
}

export const hasViewCount = (obj: any): obj is { view_count: number } => {
  return typeof obj?.view_count === 'number'
}

export const hasEvaluator = (obj: any): obj is { evaluator: string } => {
  return typeof obj?.evaluator === 'string'
}
