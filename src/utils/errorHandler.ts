/**
 * 에러 핸들링 유틸리티
 */

import { AxiosError } from "axios"
import type { ApiError, ApiErrorCode } from "@/types/api"

/**
 * API 에러 메시지 맵
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 인증 관련
  UNAUTHORIZED: "인증이 필요합니다. 다시 로그인해주세요.",
  TOKEN_EXPIRED: "세션이 만료되었습니다. 다시 로그인해주세요.",
  INVALID_TOKEN: "유효하지 않은 인증 정보입니다.",
  FORBIDDEN: "접근 권한이 없습니다.",

  // 요청 관련
  BAD_REQUEST: "잘못된 요청입니다.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요.",
  NOT_FOUND: "요청하신 정보를 찾을 수 없습니다.",
  CONFLICT: "이미 존재하는 데이터입니다.",

  // 서버 관련
  INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  SERVICE_UNAVAILABLE: "서비스를 일시적으로 사용할 수 없습니다.",

  // 비즈니스 로직
  BUSINESS_ERROR: "처리 중 오류가 발생했습니다.",
  DUPLICATE_ENTRY: "이미 등록된 정보입니다.",
  INVALID_OPERATION: "유효하지 않은 작업입니다.",
}

/**
 * HTTP 상태 코드별 기본 메시지
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "잘못된 요청입니다.",
  401: "인증이 필요합니다.",
  403: "접근 권한이 없습니다.",
  404: "요청하신 정보를 찾을 수 없습니다.",
  409: "이미 존재하는 데이터입니다.",
  422: "입력 정보를 확인해주세요.",
  500: "서버 오류가 발생했습니다.",
  502: "서버에 연결할 수 없습니다.",
  503: "서비스를 일시적으로 사용할 수 없습니다.",
  504: "서버 응답 시간이 초과되었습니다.",
}

/**
 * 에러에서 사용자 친화적 메시지 추출
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios 에러인 경우
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined

    // API 에러 코드가 있는 경우
    if (apiError?.error?.code) {
      const message = ERROR_MESSAGES[apiError.error.code]
      if (message) return message

      // API에서 제공한 메시지 사용
      if (apiError.error.message) {
        return apiError.error.message
      }
    }

    // HTTP 상태 코드 기반 메시지
    if (error.response?.status) {
      const message = HTTP_STATUS_MESSAGES[error.response.status]
      if (message) return message
    }

    // 네트워크 에러
    if (error.code === "ERR_NETWORK") {
      return "네트워크 연결을 확인해주세요."
    }

    // 타임아웃 에러
    if (error.code === "ECONNABORTED") {
      return "요청 시간이 초과되었습니다. 다시 시도해주세요."
    }

    // 요청이 취소된 경우
    if (error.code === "ERR_CANCELED") {
      return "요청이 취소되었습니다."
    }
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    return error.message || "알 수 없는 오류가 발생했습니다."
  }

  // 문자열인 경우
  if (typeof error === "string") {
    return error
  }

  // 기타
  return "알 수 없는 오류가 발생했습니다."
}

/**
 * 에러 로깅
 */
export const logError = (error: unknown, context?: string): void => {
  const errorMessage = getErrorMessage(error)
  const timestamp = new Date().toISOString()

  if (process.env.NODE_ENV === "development") {
    console.error(`[${timestamp}] ${context ? `[${context}] ` : ""}${errorMessage}`, error)
  }

  // 프로덕션 환경에서는 에러 추적 서비스로 전송 (예: Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}

/**
 * 에러를 토스트 메시지로 표시할지 판단
 */
export const shouldShowErrorToast = (error: unknown): boolean => {
  // Axios 에러인 경우
  if (error instanceof AxiosError) {
    // 401 에러는 자동으로 리다이렉트되므로 토스트 불필요
    if (error.response?.status === 401) {
      return false
    }

    // 요청이 취소된 경우 토스트 불필요
    if (error.code === "ERR_CANCELED") {
      return false
    }
  }

  return true
}

/**
 * 검증 에러 추출
 */
export const getValidationErrors = (error: unknown): Record<string, string> | null => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined

    if (apiError?.error?.code === "VALIDATION_ERROR" && apiError.error.details) {
      return apiError.error.details as Record<string, string>
    }
  }

  return null
}

/**
 * 에러 타입 판별
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.code === "ERR_NETWORK"
}

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.code === "ECONNABORTED"
}

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403
  }
  return false
}

export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined
    return apiError?.error?.code === "VALIDATION_ERROR" || error.response?.status === 422
  }
  return false
}

/**
 * 에러 처리 헬퍼
 */
export const handleError = (error: unknown, context?: string, showToast = true): void => {
  // 에러 로깅
  logError(error, context)

  // 토스트 표시 (필요시)
  if (showToast && shouldShowErrorToast(error)) {
    const message = getErrorMessage(error)
    // Toast 연동
    import('@/utils/toast').then(({ showError }) => {
      showError(message)
    })
  }
}

/**
 * 에러를 Toast로 표시하는 헬퍼 (간편 사용)
 */
export const showErrorToast = (error: unknown, context?: string): void => {
  handleError(error, context, true)
}
