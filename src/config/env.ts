/**
 * 환경 변수 설정
 * 타입 안전성을 보장하는 환경 변수 접근
 */

interface EnvironmentConfig {
  // API 설정
  apiBaseUrl: string
  apiTimeout: number

  // 인증 설정
  authTokenKey: string
  refreshTokenKey: string

  // Kakao API
  kakaoAppKey: string

  // WebSocket
  wsUrl: string

  // 앱 환경
  appEnv: "development" | "production" | "test"

  // 에셋 베이스 URL
  assetBaseUrl: string
  // 미디어 베이스 URL
  mediaBaseUrl: string

  // 파일 업로드
  maxFileSize: number
  allowedFileTypes: string
}

/**
 * 환경 변수 가져오기 (타입 안전)
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (value === undefined && defaultValue === undefined) {
    console.warn(`환경 변수 ${key}가 설정되지 않았습니다.`)
    return ""
  }
  return value || defaultValue || ""
}

/**
 * 환경 설정 객체
 */
export const env: EnvironmentConfig = {
  // API 설정
  // apiBaseUrl: getEnvVar("VITE_API_BASE_URL", "http://localhost:3000/api"),
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL", ""),
  apiTimeout: parseInt(getEnvVar("VITE_API_TIMEOUT", "10000"), 10),

  // 인증 설정
  authTokenKey: getEnvVar("VITE_AUTH_TOKEN_KEY", "pulse_safety_auth_token"),
  refreshTokenKey: getEnvVar("VITE_REFRESH_TOKEN_KEY", "pulse_safety_refresh_token"),

  // Kakao API
  kakaoAppKey: getEnvVar("VITE_KAKAO_APP_KEY", ""),

  // WebSocket
  // wsUrl: getEnvVar("VITE_WS_URL", "ws://localhost:3000"),
  wsUrl: getEnvVar("VITE_WS_URL", ""),

  // 앱 환경
  appEnv: getEnvVar("VITE_APP_ENV", "development") as EnvironmentConfig["appEnv"],

  // 에셋 베이스 URL
  assetBaseUrl: getEnvVar("VITE_ASSET_BASE_URL", ""),
  // 미디어 베이스 URL
  mediaBaseUrl: getEnvVar("VITE_MEDIA_BASE_URL", ""),

  // 파일 업로드
  maxFileSize: parseInt(getEnvVar("VITE_MAX_FILE_SIZE", "10485760"), 10), // 10MB
  allowedFileTypes: getEnvVar("VITE_ALLOWED_FILE_TYPES", ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"),
}

/**
 * 개발 환경 여부
 */
export const isDevelopment = env.appEnv === "development"

/**
 * 프로덕션 환경 여부
 */
export const isProduction = env.appEnv === "production"

/**
 * 환경 설정 검증
 */
export const validateEnv = (): void => {
  const requiredVars = ["apiBaseUrl"]

  const missing = requiredVars.filter(key => {
    const value = env[key as keyof EnvironmentConfig]
    return !value || value === ""
  })

  if (missing.length > 0) {
    console.error("필수 환경 변수가 누락되었습니다:", missing)
  }
}