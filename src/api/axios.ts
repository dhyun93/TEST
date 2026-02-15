/**
 * Axios 인증 인터셉터 및 Base API 클래스
 * - 인증 토큰 자동 주입
 * - 인증 실패 처리 및 강제 로그아웃
 */

import { AxiosError, AxiosRequestConfig } from "axios"
import { axiosInstance } from "@/utils/axiosInterceptor"
import { useAuthStore } from "@/stores/authUserStore"
import type { ApiResponse, PaginatedResponse, ApiRequestConfig, SearchParams } from "@/types/api"

/** ───────────── 공통: 중복 알림/리다이렉트 방지 ───────────── */
let logoutInProgress = false

type LogoutReason = "required" | "expired" | "conflict" | "forbidden" | "network"

const getMessage = (reason: LogoutReason): string => {
  switch (reason) {
    case "expired":
      return "세션이 만료되어 로그아웃되었습니다. 다시 로그인해 주세요."
    case "conflict":
      return "다른 기기에서 로그인되어 로그아웃되었습니다. 다시 로그인해 주세요."
    case "forbidden":
      return "접근 권한이 없습니다. 다시 로그인해 주세요."
    case "network":
      return "네트워크 오류가 발생했습니다. 다시 로그인 후 이용해 주세요."
    default:
      return "로그인이 필요합니다. 다시 로그인해 주세요."
  }
}

const forceLogout = (reason: LogoutReason): void => {
  if (logoutInProgress) return
  logoutInProgress = true

  // 전역 상태 정리
  try {
    const { logout } = useAuthStore.getState()
    logout()
  } catch {
    // ignore
  }

  // 로그인 페이지에 있을 땐 알림만 한 번
  if (!location.pathname.startsWith("/login")) {
    alert(getMessage(reason))
  }

  // 강제 이동
  const url = new URL(window.location.origin + "/login")
  url.searchParams.set("reason", reason)
  window.location.replace(url.toString())
}

/** ───────────── 인증 실패 판단 ───────────── */
const isAuthFailure = (error: AxiosError<any>): boolean => {
  const status = error.response?.status
  const data = error.response?.data as any

  const code = (data?.code ?? data?.error_code ?? data?.detail ?? data?.message ?? "").toString()
  const text = `${code}`.toUpperCase()

  const tokenInvalidText = text.includes("TOKEN") && (text.includes("EXPIRED") || text.includes("INVALID"))

  // 401/419/440/498/499 등 인증 관련 코드
  if ([401, 419, 440, 498, 499].includes(Number(status))) return true

  // 커스텀 에러코드/메시지 패턴
  if (tokenInvalidText || text === "UNAUTHORIZED" || text === "SESSION_CONFLICT" || text === "TOKEN_EXPIRED") {
    return true
  }

  return false
}

/** ───────────── 인증 인터셉터 설정 ───────────── */
export const setupAuthInterceptors = (): void => {
  // 요청 인터셉터: 토큰 주입
  axiosInstance.interceptors.request.use(
    config => {
      const token = useAuthStore.getState().token

      if (!config.headers) config.headers = {} as any

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
      } else {
        delete (config.headers as any)["Authorization"]
      }

      return config
    },
    error => Promise.reject(error)
  )

  // 응답 인터셉터: 인증 실패 처리
  axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError<any>) => {
      // 정적 리소스 실패는 무시
      const isStatic = (error.config?.url || "").match(/\.(png|jpg|jpeg|gif|svg|css|js|map)$/i) !== null

      if (!isStatic) {
        if (isAuthFailure(error)) {
          forceLogout("expired")
          return Promise.reject(error)
        }

        const status = error.response?.status
        if (status === 403) {
          forceLogout("forbidden")
          return Promise.reject(error)
        }
      }

      // 네트워크/타임아웃
      if (!error.response || error.code === "ECONNABORTED") {
        // 네트워크 오류 시 로그아웃은 선택사항 (필요시 주석 해제)
        // forceLogout('network');
      }

      return Promise.reject(error)
    }
  )
}

/**
 * Base API 클래스
 * 페이지별 API 파일에서 이 클래스를 상속받아 사용
 */
export class BaseApi {
  /**
   * GET 요청
   */
  protected async get<T>(url: string, params?: Record<string, any>, config?: ApiRequestConfig): Promise<T> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, {
      params,
      ...this.mergeConfig(config),
    })
    return response.data.data
  }

  /**
   * POST 요청
   */
  protected async post<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, this.mergeConfig(config))
    return response.data.data
  }

  /**
   * PUT 요청
   */
  protected async put<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, this.mergeConfig(config))
    return response.data.data
  }

  /**
   * PATCH 요청
   */
  protected async patch<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, this.mergeConfig(config))
    return response.data.data
  }

  /**
   * DELETE 요청
   */
  protected async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, this.mergeConfig(config))
    return response.data.data
  }

  /**
   * 페이지네이션된 GET 요청
   */
  protected async getPaginated<T>(url: string, params?: SearchParams, config?: ApiRequestConfig): Promise<PaginatedResponse<T>> {
    const response = await axiosInstance.get<PaginatedResponse<T>>(url, {
      params,
      ...this.mergeConfig(config),
    })
    return response.data
  }

  /**
   * 파일 업로드
   */
  protected async uploadFile<T>(url: string, file: File, config?: ApiRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...this.mergeConfig(config),
    })

    return response.data.data
  }

  /**
   * 다중 파일 업로드
   */
  protected async uploadFiles<T>(url: string, files: File[], config?: ApiRequestConfig): Promise<T> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append("files", file)
    })

    const response = await axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...this.mergeConfig(config),
    })

    return response.data.data
  }

  /**
   * 파일 다운로드
   */
  protected async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await axiosInstance.get(url, {
      responseType: "blob",
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = filename || this.extractFilename(response) || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * 응답 헤더에서 파일명 추출
   */
  private extractFilename(response: any): string | null {
    const contentDisposition = response.headers["content-disposition"]
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1].replace(/['"]/g, "")
      }
    }
    return null
  }

  /**
   * 설정 병합
   */
  private mergeConfig(config?: ApiRequestConfig): AxiosRequestConfig & { customConfig?: ApiRequestConfig } {
    return {
      customConfig: config,
    }
  }
}
