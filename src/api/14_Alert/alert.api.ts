/**
 * SafeOn Agent - 알림 API
 * 선제적 위험 감지 및 알림 관리
 *
 * @module AlertAPI
 * @author SafeOn Agent
 * @date 2026-02-16
 */

import { axiosInstance } from '@/utils/axiosInterceptor';

// ============================================================
// 타입 정의
// ============================================================

/**
 * 알림 타입
 */
export type AlertType =
  | 'MISSING_MEASURE'           // 필수조치 누락
  | 'OVERDUE_INSPECTION'        // 점검 기한초과
  | 'INCOMPLETE_ASSESSMENT';    // 미완료 평가

/**
 * 심각도
 */
export type AlertSeverity =
  | 'CRITICAL'    // 즉시 조치 필요 (>30일 경과)
  | 'HIGH'        // 긴급 (>14일 경과)
  | 'MEDIUM'      // 주의 필요
  | 'LOW';        // 참고

/**
 * 알림 (Alert)
 */
export interface Alert {
  id: number;
  business_id: number;              // 사업장 ID
  rule_id: number | null;           // 적용된 규칙 ID
  alert_type: AlertType;            // 알림 타입
  severity: AlertSeverity;          // 심각도
  title: string;                    // 알림 제목
  description: string;              // 상세 설명
  context_json: Record<string, any>;// 추가 컨텍스트 (위험요인, 조치, 일정 등)
  is_read: boolean;                 // 읽음 여부
  is_resolved: boolean;             // 해결 여부
  resolved_by: number | null;       // 해결 담당자 ID
  resolved_at: string | null;       // 해결 시간 (ISO 8601)
  created_at: string;               // 생성 시간 (ISO 8601)
}

/**
 * 알림 목록 응답
 */
export interface AlertListResponse {
  results: Alert[];
  count: number;              // 전체 알림 개수
  unresolved_count: number;   // 미해결 알림 개수
}

/**
 * 알림 통계
 */
export interface AlertStatistics {
  total_count: number;
  unresolved_count: number;
  by_severity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  by_type: {
    MISSING_MEASURE: number;
    OVERDUE_INSPECTION: number;
    INCOMPLETE_ASSESSMENT: number;
  };
}

/**
 * 알림 필터
 */
export interface AlertFilter {
  business_id: number;        // 필수
  is_resolved?: 0 | 1;        // 0=미해결, 1=해결
  alert_type?: AlertType;     // 알림 타입 필터
  severity?: AlertSeverity;   // 심각도 필터
}

// ============================================================
// API 함수
// ============================================================

/**
 * 알림 목록 조회
 *
 * @param filter - 필터 조건
 * @returns 알림 목록
 *
 * @example
 * ```ts
 * // 미해결 알림만 조회
 * const alerts = await getAlerts({
 *   business_id: 1,
 *   is_resolved: 0
 * });
 *
 * // 긴급 알림만 조회
 * const urgentAlerts = await getAlerts({
 *   business_id: 1,
 *   severity: 'HIGH'
 * });
 * ```
 */
export async function getAlerts(filter: AlertFilter): Promise<AlertListResponse> {
  const response = await axiosInstance.get<AlertListResponse>('/api/alerts/', {
    params: filter
  });
  return response.data;
}

/**
 * 알림 상세 조회
 *
 * @param alertId - 알림 ID
 * @returns 알림 상세 정보
 */
export async function getAlert(alertId: number): Promise<Alert> {
  const response = await axiosInstance.get<Alert>(`/api/alerts/${alertId}/`);
  return response.data;
}

/**
 * 알림 해결 처리
 *
 * @param alertId - 알림 ID
 * @param resolvedBy - 해결 담당자 ID (선택)
 * @returns 업데이트된 알림
 *
 * @example
 * ```ts
 * const resolved = await resolveAlert(123, userId);
 * console.log(`알림이 ${resolved.resolved_at}에 해결되었습니다.`);
 * ```
 */
export async function resolveAlert(
  alertId: number,
  resolvedBy?: number
): Promise<Alert> {
  const response = await axiosInstance.patch<Alert>(
    `/api/alerts/${alertId}/resolve/`,
    { resolved_by: resolvedBy }
  );
  return response.data;
}

/**
 * 알림 읽음 표시
 *
 * @param alertId - 알림 ID
 * @param isRead - 읽음 여부 (기본값: true)
 * @returns 업데이트된 알림
 */
export async function markAlertAsRead(
  alertId: number,
  isRead: boolean = true
): Promise<Alert> {
  const response = await axiosInstance.patch<Alert>(
    `/api/alerts/${alertId}/mark-read/`,
    { is_read: isRead }
  );
  return response.data;
}

/**
 * 알림 통계 조회
 *
 * @param businessId - 사업장 ID
 * @returns 알림 통계
 *
 * @example
 * ```ts
 * const stats = await getAlertStatistics(1);
 * console.log(`미해결: ${stats.unresolved_count}건`);
 * console.log(`긴급: ${stats.by_severity.HIGH}건`);
 * ```
 */
export async function getAlertStatistics(
  businessId: number
): Promise<AlertStatistics> {
  const response = await axiosInstance.get<AlertStatistics>('/api/alerts/statistics/', {
    params: { business_id: businessId }
  });
  return response.data;
}

/**
 * 여러 알림 일괄 해결
 *
 * @param alertIds - 알림 ID 배열
 * @param resolvedBy - 해결 담당자 ID
 * @returns 성공한 알림 개수
 */
export async function resolveMultipleAlerts(
  alertIds: number[],
  resolvedBy?: number
): Promise<number> {
  let successCount = 0;
  for (const alertId of alertIds) {
    try {
      await resolveAlert(alertId, resolvedBy);
      successCount++;
    } catch (error) {
      console.error(`Failed to resolve alert ${alertId}:`, error);
    }
  }
  return successCount;
}

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * 알림 타입 한글 변환
 */
export function getAlertTypeLabel(type: AlertType): string {
  const labels: Record<AlertType, string> = {
    MISSING_MEASURE: '필수조치 누락',
    OVERDUE_INSPECTION: '점검 기한초과',
    INCOMPLETE_ASSESSMENT: '미완료 평가'
  };
  return labels[type] || type;
}

/**
 * 심각도 한글 변환
 */
export function getSeverityLabel(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    CRITICAL: '매우 긴급',
    HIGH: '긴급',
    MEDIUM: '주의',
    LOW: '참고'
  };
  return labels[severity] || severity;
}

/**
 * 심각도 색상 코드
 */
export function getSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    CRITICAL: '#DC2626',  // Red-600
    HIGH: '#EA580C',      // Orange-600
    MEDIUM: '#F59E0B',    // Amber-500
    LOW: '#64748B'        // Slate-500
  };
  return colors[severity] || '#6B7280';
}

/**
 * 알림 타입 아이콘
 */
export function getAlertTypeIcon(type: AlertType): string {
  const icons: Record<AlertType, string> = {
    MISSING_MEASURE: '⚠️',
    OVERDUE_INSPECTION: '⏰',
    INCOMPLETE_ASSESSMENT: '📋'
  };
  return icons[type] || '🔔';
}

/**
 * 경과 시간 계산 (human-readable)
 *
 * @param timestamp - ISO 8601 timestamp
 * @returns "3분 전", "2시간 전", "5일 전" 형식
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;
  return then.toLocaleDateString('ko-KR');
}

/**
 * 미해결 알림 필터링
 */
export function filterUnresolvedAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter(alert => !alert.is_resolved);
}

/**
 * 심각도별 그룹화
 */
export function groupAlertsBySeverity(alerts: Alert[]): Record<AlertSeverity, Alert[]> {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.severity]) {
      acc[alert.severity] = [];
    }
    acc[alert.severity].push(alert);
    return acc;
  }, {} as Record<AlertSeverity, Alert[]>);
}

/**
 * 타입별 그룹화
 */
export function groupAlertsByType(alerts: Alert[]): Record<AlertType, Alert[]> {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.alert_type]) {
      acc[alert.alert_type] = [];
    }
    acc[alert.alert_type].push(alert);
    return acc;
  }, {} as Record<AlertType, Alert[]>);
}
