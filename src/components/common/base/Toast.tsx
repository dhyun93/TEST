/**
 * Toast 알림 시스템
 * React Hot Toast 기반
 */

import { Toaster } from 'react-hot-toast'

/**
 * Toast Provider 컴포넌트
 * App.tsx에 추가하여 전역에서 사용
 */
export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // 기본 옵션
        duration: 3000,

        // 기본 스타일
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },

        // 성공 토스트
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4ade80',
            secondary: '#fff',
          },
          style: {
            background: '#059669',
            color: '#fff',
          },
        },

        // 에러 토스트
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#dc2626',
            color: '#fff',
          },
        },

        // 로딩 토스트
        loading: {
          duration: Infinity,
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        },
      }}
    />
  )
}

export default ToastProvider
