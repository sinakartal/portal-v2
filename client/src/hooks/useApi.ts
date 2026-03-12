import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse } from '../types'

export function useApi<T>(fetcher: () => Promise<ApiResponse<T>>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Unknown error')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, error, refetch }
}
