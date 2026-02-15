/**
 * API 호출을 위한 커스텀 훅
 * 로딩, 에러, 데이터 상태를 자동으로 관리
 */

import { useState, useCallback } from "react"
import { handleError } from "@/utils/errorHandler"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: unknown) => void
  showErrorToast?: boolean
}

/**
 * API 호출 훅
 *
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApi(tbmApi.getList);
 *
 * useEffect(() => {
 *   execute({ page: 1, limit: 10 });
 * }, []);
 * ```
 */
export function useApi<T, P extends any[] = any[]>(apiFunc: (...args: P) => Promise<T>, options: UseApiOptions = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { onSuccess, onError, showErrorToast = true } = options

  const execute = useCallback(
    async (...args: P) => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiFunc(...args)

        setState({
          data: result,
          loading: false,
          error: null,
        })

        onSuccess?.(result)
        return result
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))

        if (showErrorToast) {
          handleError(error, apiFunc.name)
        }

        onError?.(error)
        throw error
      }
    },
    [apiFunc, onSuccess, onError, showErrorToast]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

/**
 * 뮤테이션 API 호출 훅 (생성, 수정, 삭제)
 *
 * @example
 * ```typescript
 * const { loading, execute } = useMutation(tbmApi.create, {
 *   onSuccess: () => {
 *     toast.success('생성되었습니다');
 *     refetch();
 *   }
 * });
 *
 * const handleSubmit = async (data) => {
 *   await execute(data);
 * };
 * ```
 */
export function useMutation<T, P extends any[] = any[]>(apiFunc: (...args: P) => Promise<T>, options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { onSuccess, onError, showErrorToast = true } = options

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiFunc(...args)
        setLoading(false)
        onSuccess?.(result)
        return result
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
        setError(errorMessage)
        setLoading(false)

        if (showErrorToast) {
          handleError(error, apiFunc.name)
        }

        onError?.(error)
        throw error
      }
    },
    [apiFunc, onSuccess, onError, showErrorToast]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    loading,
    error,
    execute,
    reset,
  }
}
