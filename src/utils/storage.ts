/**
 * 로컬 스토리지 유틸리티
 * 타입 안전한 스토리지 접근을 제공
 */

/**
 * 스토리지에 값 저장
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`스토리지 저장 실패 [${key}]:`, error)
  }
}

/**
 * 스토리지에서 값 가져오기
 */
export const getStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`스토리지 읽기 실패 [${key}]:`, error)
    return null
  }
}

/**
 * 스토리지에서 값 제거
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`스토리지 삭제 실패 [${key}]:`, error)
  }
}

/**
 * 스토리지 전체 삭제
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error("스토리지 전체 삭제 실패:", error)
  }
}

/**
 * 세션 스토리지에 값 저장
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value)
    sessionStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`세션 스토리지 저장 실패 [${key}]:`, error)
  }
}

/**
 * 세션 스토리지에서 값 가져오기
 */
export const getSessionStorage = <T>(key: string): T | null => {
  try {
    const item = sessionStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`세션 스토리지 읽기 실패 [${key}]:`, error)
    return null
  }
}

/**
 * 세션 스토리지에서 값 제거
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`세션 스토리지 삭제 실패 [${key}]:`, error)
  }
}
