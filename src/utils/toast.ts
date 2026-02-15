/**
 * Toast 알림 유틸리티
 */

import toast from 'react-hot-toast'

/**
 * 성공 메시지 표시
 */
export const showSuccess = (message: string, duration?: number) => {
  toast.success(message, { duration: duration || 3000 })
}

/**
 * 에러 메시지 표시
 */
export const showError = (message: string, duration?: number) => {
  toast.error(message, { duration: duration || 4000 })
}

/**
 * 정보 메시지 표시
 */
export const showInfo = (message: string, duration?: number) => {
  toast(message, {
    duration: duration || 3000,
    icon: 'ℹ️',
  })
}

/**
 * 경고 메시지 표시
 */
export const showWarning = (message: string, duration?: number) => {
  toast(message, {
    duration: duration || 3000,
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
  })
}

/**
 * 로딩 메시지 표시
 * @returns toast ID (나중에 dismiss할 때 사용)
 */
export const showLoading = (message: string = '처리 중...') => {
  return toast.loading(message)
}

/**
 * Toast 닫기
 */
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId)
  } else {
    toast.dismiss()
  }
}

/**
 * Promise 기반 Toast
 * 비동기 작업의 진행 상태를 자동으로 표시
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  }
) => {
  return toast.promise(promise, messages)
}

/**
 * 커스텀 Toast
 */
export const showCustom = (message: string, options?: any) => {
  return toast(message, options)
}

// 기본 export
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
  custom: showCustom,
}
