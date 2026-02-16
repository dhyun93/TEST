/**
 * 프로젝트 전역 Enum 타입 정의
 * 백엔드 API 응답 코드값을 TypeScript Enum으로 매핑
 * 백엔드 모델: posts/models.py 기준 확정
 */

/**
 * 점검 타입
 * 백엔드: InspectionSchedule.type, Inspection.type
 */
export enum InspectionType {
  REGULAR = 0,        // 정기점검
  IRREGULAR = 1,      // 수시점검
  SPECIAL = 2,        // 특별점검
  JOINT = 3,          // 합동점검
  OTHER = 4,          // 기타
}

export const InspectionTypeLabels: Record<InspectionType, string> = {
  [InspectionType.REGULAR]: '정기점검',
  [InspectionType.IRREGULAR]: '수시점검',
  [InspectionType.SPECIAL]: '특별점검',
  [InspectionType.JOINT]: '합동점검',
  [InspectionType.OTHER]: '기타',
}

/**
 * 점검 결과
 * 백엔드: Inspection.result (0=이상없음, 1=주의, 2=위험)
 */
export enum InspectionResult {
  NO_ISSUE = 0,       // 이상없음
  CAUTION = 1,        // 주의
  DANGER = 2,         // 위험
}

export const InspectionResultLabels: Record<InspectionResult, string> = {
  [InspectionResult.NO_ISSUE]: '이상없음',
  [InspectionResult.CAUTION]: '주의',
  [InspectionResult.DANGER]: '위험',
}

/**
 * 협력사 평가 타입
 * 백엔드: SafetyAssessment.type
 */
export enum EvaluationType {
  SELECTION = 0,      // 선정평가
  REGULAR = 1,        // 정기평가
  REEVALUATION = 2,   // 재평가
  IRREGULAR = 3,      // 수시평가
  OTHER = 4,          // 기타
}

export const EvaluationTypeLabels: Record<EvaluationType, string> = {
  [EvaluationType.SELECTION]: '선정평가',
  [EvaluationType.REGULAR]: '정기평가',
  [EvaluationType.REEVALUATION]: '재평가',
  [EvaluationType.IRREGULAR]: '수시평가',
  [EvaluationType.OTHER]: '기타',
}

/**
 * 현장점검 타입 (협력사)
 * 백엔드: Inspection.type (협력사 현장점검 용도)
 */
export enum SiteAuditType {
  REGULAR = 0,        // 정기점검
  IRREGULAR = 1,      // 수시점검
  SPECIAL = 2,        // 특별점검
  JOINT = 3,          // 합동점검
  OTHER = 4,          // 기타
}

export const SiteAuditTypeLabels: Record<SiteAuditType, string> = {
  [SiteAuditType.REGULAR]: '정기점검',
  [SiteAuditType.IRREGULAR]: '수시점검',
  [SiteAuditType.SPECIAL]: '특별점검',
  [SiteAuditType.JOINT]: '합동점검',
  [SiteAuditType.OTHER]: '기타',
}

/**
 * 조직 직위 타입
 * 백엔드: Profile.is_level, OrganizationChart.position
 * 주의: 0=일반(해당없음), 5=경영책임자 순서임
 */
export enum OrganizationPosition {
  NOT_APPLICABLE = 0,               // 일반(해당없음)
  SAFETY_MANAGER = 1,               // 안전보건관리책임자
  SAFETY_OFFICER = 2,               // 안전관리자
  HEALTH_OFFICER = 3,               // 보건관리자
  SUPERVISOR = 4,                   // 관리감독자
  CEO = 5,                          // 경영책임자
}

export const OrganizationPositionLabels: Record<OrganizationPosition, string> = {
  [OrganizationPosition.NOT_APPLICABLE]: '일반(해당없음)',
  [OrganizationPosition.SAFETY_MANAGER]: '안전보건관리책임자',
  [OrganizationPosition.SAFETY_OFFICER]: '안전관리자',
  [OrganizationPosition.HEALTH_OFFICER]: '보건관리자',
  [OrganizationPosition.SUPERVISOR]: '관리감독자',
  [OrganizationPosition.CEO]: '경영책임자',
}

/**
 * 사용자 레벨
 * 백엔드: Profile.is_level 필드 매핑
 */
export enum UserLevel {
  GENERAL = 0,                      // 일반(해당없음)
  SAFETY_HEALTH_MANAGER = 1,        // 안전보건관리책임자
  SAFETY_MANAGER = 2,               // 안전관리자
  HEALTH_MANAGER = 3,               // 보건관리자
  SUPERVISOR = 4,                   // 관리감독자
  CEO = 5,                          // 경영책임자
}

export const UserLevelLabels: Record<UserLevel, string> = {
  [UserLevel.GENERAL]: '일반(해당없음)',
  [UserLevel.SAFETY_HEALTH_MANAGER]: '안전보건관리책임자',
  [UserLevel.SAFETY_MANAGER]: '안전관리자',
  [UserLevel.HEALTH_MANAGER]: '보건관리자',
  [UserLevel.SUPERVISOR]: '관리감독자',
  [UserLevel.CEO]: '경영책임자',
}

/**
 * 결재 상태
 */
export enum ApprovalStatus {
  PENDING = 'pending',      // 대기
  APPROVED = 'approved',    // 승인
  REJECTED = 'rejected',    // 반려
  CANCELLED = 'cancelled',  // 취소
}

export const ApprovalStatusLabels: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: '대기',
  [ApprovalStatus.APPROVED]: '승인',
  [ApprovalStatus.REJECTED]: '반려',
  [ApprovalStatus.CANCELLED]: '취소',
}

/**
 * 위험성 평가 방법
 */
export enum RiskAssessmentMethod {
  FREQUENCY = 'frequency',    // 빈도강도법
  CHECKLIST = 'checklist',    // 체크리스트법
  THREE_STEP = 'threestep',   // 3단계법
  CHEMICAL = 'chemical',      // 화학물질평가법
}

export const RiskAssessmentMethodLabels: Record<RiskAssessmentMethod, string> = {
  [RiskAssessmentMethod.FREQUENCY]: '빈도강도법',
  [RiskAssessmentMethod.CHECKLIST]: '체크리스트법',
  [RiskAssessmentMethod.THREE_STEP]: '3단계법',
  [RiskAssessmentMethod.CHEMICAL]: '화학물질평가법',
}

/**
 * 위험 등급
 */
export enum RiskLevel {
  VERY_HIGH = 5,    // 매우 높음
  HIGH = 4,         // 높음
  MEDIUM = 3,       // 보통
  LOW = 2,          // 낮음
  VERY_LOW = 1,     // 매우 낮음
}

export const RiskLevelLabels: Record<RiskLevel, string> = {
  [RiskLevel.VERY_HIGH]: '매우 높음',
  [RiskLevel.HIGH]: '높음',
  [RiskLevel.MEDIUM]: '보통',
  [RiskLevel.LOW]: '낮음',
  [RiskLevel.VERY_LOW]: '매우 낮음',
}

/**
 * 교육 타입
 */
export enum EducationType {
  REGULAR = 'regular',          // 정기교육
  SPECIAL = 'special',          // 특별교육
  HIRING = 'hiring',            // 채용시교육
  WORK_CHANGE = 'work_change',  // 작업내용변경시교육
  MANAGER = 'manager',          // 관리감독자교육
}

export const EducationTypeLabels: Record<EducationType, string> = {
  [EducationType.REGULAR]: '정기교육',
  [EducationType.SPECIAL]: '특별교육',
  [EducationType.HIRING]: '채용시교육',
  [EducationType.WORK_CHANGE]: '작업내용변경시교육',
  [EducationType.MANAGER]: '관리감독자교육',
}

/**
 * 알림 타입
 */
export enum NotificationType {
  INSPECTION = 'inspection',      // 점검
  TBM = 'tbm',                   // TBM
  EDUCATION = 'education',        // 교육
  RISK = 'risk',                 // 위험성평가
  APPROVAL = 'approval',         // 결재
  NOTICE = 'notice',             // 공지
  SYSTEM = 'system',             // 시스템
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.INSPECTION]: '점검',
  [NotificationType.TBM]: 'TBM',
  [NotificationType.EDUCATION]: '교육',
  [NotificationType.RISK]: '위험성평가',
  [NotificationType.APPROVAL]: '결재',
  [NotificationType.NOTICE]: '공지',
  [NotificationType.SYSTEM]: '시스템',
}

/**
 * Enum 값으로 라벨 가져오기 헬퍼
 */
export const getEnumLabel = <T extends number | string>(
  value: T,
  labels: Record<any, string>
): string => {
  return labels[value as any] || '알 수 없음'
}
