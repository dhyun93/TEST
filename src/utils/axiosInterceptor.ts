import axios from "axios"
import { useLoadingStore } from "@/stores/loadingStore"
import { useAuthStore } from "@/stores/authUserStore"
import { env } from "@/config/env"

/**
 * Axios 인스턴스 생성
 * 로딩 상태 관리만 담당
 */
export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})

/**
 * 활성 요청 카운터
 */
let activeRequests = 0
let lastServerAlertAt = 0
const SERVER_ALERT_COOLDOWN_MS = 3000

/**
 * Axios 로딩 인터셉터 설정
 * 요청/응답 시 글로벌 로딩 상태만 관리
 */
export const setupLoadingInterceptors = (): void => {
  const { setLoading } = useLoadingStore.getState()

  // 요청 인터셉터: 로딩 시작 및 토큰 추가
  axiosInstance.interceptors.request.use(
    config => {
      activeRequests++
      if (activeRequests === 1) {
        setLoading(true)
      }

      // 토큰을 Authorization 헤더에 추가
      const authState = useAuthStore.getState()

      if (authState.token) {
        // 백엔드 스펙에 맞춰 'Token' 또는 'Bearer' 선택
        config.headers["Authorization"] = `Token ${authState.token}`
      } else {
        console.log("[axios] 토큰이 없음!")
      }

      return config
    },
    error => {
      activeRequests--
      if (activeRequests === 0) {
        setLoading(false)
      }
      return Promise.reject(error)
    }
  )

  // 응답 인터셉터: 로딩 종료 및 인증 에러 처리
  axiosInstance.interceptors.response.use(
    response => {
      activeRequests--
      if (activeRequests === 0) {
        setLoading(false)
      }
      return response
    },
    error => {
      activeRequests--
      if (activeRequests === 0) {
        setLoading(false)
      }

      const status = error.response?.status
      const isServerError = typeof status === "number" && status >= 500
      const isNetworkError = !status

      // if (!import.meta.env.DEV && (isServerError || isNetworkError) && Date.now() - lastServerAlertAt > SERVER_ALERT_COOLDOWN_MS) {
      //   lastServerAlertAt = Date.now()
      //   alert("서비스 문제가 발생했습니다. 관리자에게 문의해주세요.")
      // }
      if ((isServerError || isNetworkError) && Date.now() - lastServerAlertAt > SERVER_ALERT_COOLDOWN_MS) {
        lastServerAlertAt = Date.now()
        console.warn("[axios] 서비스 문제가 발생했습니다:", isServerError ? `HTTP ${status}` : "네트워크 에러")
      }

      // 401 Unauthorized: 로그인 필요
      // if (!import.meta.env.DEV && error.response?.status === 401) {
      //   const { logout } = useAuthStore.getState()
      //   logout()
      //   alert("로그인이 필요합니다.")
      //   window.location.href = "/login"
      // }
      if (!import.meta.env.DEV && error.response?.status === 401) {
        const { logout } = useAuthStore.getState()
        logout()
        console.warn("[axios] 로그인이 필요합니다.")
        window.location.href = "/login"
      }

      return Promise.reject(error)
    }
  )
}
