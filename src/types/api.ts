/**
 * API 공통 타입 정의
 */

// ============================================================================
// 공통 응답 타입
// ============================================================================

/**
 * 표준 API 응답 래퍼
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * 에러 응답
 */
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

/**
 * 페이지네이션 메타 정보
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
  message?: string
}

// ============================================================================
// 인증 관련 타입
// ============================================================================

/**
 * 로그인 요청
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
  expiresIn: number
}

/**
 * 사용자 정보
 */
export interface UserInfo {
  id: string
  username: string
  name: string
  email: string
  position: string
  department: string
  role: UserRole
  factoryId?: string
  factoryName?: string
}

/**
 * 사용자 권한
 */
export type UserRole =
  | "admin" // 관리자
  | "safety_manager" // 안전관리자
  | "health_manager" // 보건관리자
  | "supervisor" // 관리감독자
  | "worker" // 작업자
  | "executive" // 경영책임자

/**
 * 토큰 갱신 요청
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// ============================================================================
// 공통 도메인 타입
// ============================================================================

/**
 * 파일 업로드 응답
 */
export interface FileUploadResponse {
  fileId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

/**
 * 파일 정보
 */
export interface FileInfo {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
}

/**
 * 첨부파일
 */
export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

/**
 * 승인 상태
 */
export type ApprovalStatus =
  | "pending" // 대기
  | "approved" // 승인
  | "rejected" // 반려
  | "cancelled" // 취소

/**
 * 승인 정보
 */
export interface ApprovalInfo {
  status: ApprovalStatus
  approver?: string
  approvedAt?: string
  comment?: string
}

// ============================================================================
// 검색/필터 타입
// ============================================================================

/**
 * 날짜 범위
 */
export interface DateRange {
  startDate: string
  endDate: string
}

/**
 * 정렬 옵션
 */
export interface SortOption {
  field: string
  order: "asc" | "desc"
}

/**
 * 공통 검색 파라미터
 */
export interface SearchParams {
  keyword?: string
  page?: number
  limit?: number
  sort?: SortOption
  dateRange?: DateRange
}

// ============================================================================
// 에러 코드
// ============================================================================

/**
 * API 에러 코드
 */
export enum ApiErrorCode {
  // 인증 관련
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
  FORBIDDEN = "FORBIDDEN",

  // 요청 관련
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",

  // 서버 관련
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // 비즈니스 로직
  BUSINESS_ERROR = "BUSINESS_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  INVALID_OPERATION = "INVALID_OPERATION",
}

// ============================================================================
// HTTP 메서드 타입
// ============================================================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// ============================================================================
// API 요청 설정
// ============================================================================

/**
 * API 요청 옵션
 */
export interface ApiRequestConfig {
  showLoading?: boolean // 로딩 표시 여부
  showError?: boolean // 에러 토스트 표시 여부
  errorMessage?: string // 커스텀 에러 메시지
  skipAuth?: boolean // 인증 토큰 스킵
}
