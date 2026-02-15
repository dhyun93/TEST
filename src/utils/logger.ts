/**
 * 로깅 유틸리티
 * 개발 환경에서만 로그를 출력하고, 프로덕션에서는 에러만 기록
 */

const isDev = import.meta.env.DEV

/**
 * 로거 인터페이스
 */
export interface Logger {
  log: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  debug: (...args: any[]) => void
  table: (data: any) => void
  group: (label: string) => void
  groupEnd: () => void
}

/**
 * 글로벌 로거
 */
export const logger: Logger = {
  /**
   * 일반 로그 (개발 환경에서만)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * 정보성 로그 (개발 환경에서만)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args)
    }
  },

  /**
   * 경고 로그 (개발 환경에서만)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },

  /**
   * 에러 로그 (모든 환경에서 기록)
   * 프로덕션에서는 에러 추적 서비스로 전송 가능
   */
  error: (...args: any[]) => {
    console.error(...args)

    // 프로덕션 환경에서 에러 추적 서비스로 전송
    // if (!isDev) {
    //   Sentry.captureException(args[0]);
    // }
  },

  /**
   * 디버그 로그 (개발 환경에서만)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },

  /**
   * 테이블 형식 로그 (개발 환경에서만)
   */
  table: (data: any) => {
    if (isDev && console.table) {
      console.table(data)
    }
  },

  /**
   * 그룹 시작 (개발 환경에서만)
   */
  group: (label: string) => {
    if (isDev && console.group) {
      console.group(label)
    }
  },

  /**
   * 그룹 종료 (개발 환경에서만)
   */
  groupEnd: () => {
    if (isDev && console.groupEnd) {
      console.groupEnd()
    }
  },
}

/**
 * API 요청/응답 로깅 헬퍼
 */
export const logAPI = {
  request: (method: string, url: string, data?: any) => {
    if (isDev) {
      logger.group(`🔵 API Request: ${method} ${url}`)
      if (data) logger.log('Data:', data)
      logger.groupEnd()
    }
  },

  response: (method: string, url: string, status: number, data?: any) => {
    if (isDev) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌'
      logger.group(`${emoji} API Response: ${method} ${url} (${status})`)
      if (data) logger.log('Data:', data)
      logger.groupEnd()
    }
  },

  error: (method: string, url: string, error: any) => {
    logger.error(`❌ API Error: ${method} ${url}`, error)
  },
}

/**
 * 컴포넌트 라이프사이클 로깅 헬퍼
 */
export const logComponent = {
  mount: (componentName: string) => {
    logger.log(`🟢 [${componentName}] Mounted`)
  },

  unmount: (componentName: string) => {
    logger.log(`🔴 [${componentName}] Unmounted`)
  },

  render: (componentName: string) => {
    logger.log(`🔄 [${componentName}] Rendered`)
  },

  update: (componentName: string, props?: any) => {
    logger.log(`🔄 [${componentName}] Updated`, props)
  },
}

/**
 * 성능 측정 로깅 헬퍼
 */
export const logPerformance = {
  start: (label: string) => {
    if (isDev && performance) {
      performance.mark(`${label}-start`)
    }
  },

  end: (label: string) => {
    if (isDev && performance) {
      performance.mark(`${label}-end`)
      performance.measure(label, `${label}-start`, `${label}-end`)

      const measure = performance.getEntriesByName(label)[0]
      logger.log(`⏱️ [Performance] ${label}: ${measure.duration.toFixed(2)}ms`)

      performance.clearMarks(`${label}-start`)
      performance.clearMarks(`${label}-end`)
      performance.clearMeasures(label)
    }
  },
}

export default logger
