import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/services/useAuth'
import type { HomeData } from '../types/homeApi.types'
import { homeService } from './homeService'

type HomeDataState = {
  data: HomeData | null
  isLoading: boolean
  error: string | null
}

export function useHomeData() {
  const { user } = useAuth()
  const [state, setState] = useState<HomeDataState>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let alive = true

    async function load() {
      if (!user) {
        setState({ data: null, isLoading: false, error: null })
        return
      }

      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const data = await homeService.loadHome(user)

        if (alive) {
          setState({ data, isLoading: false, error: null })
        }
      } catch (error) {
        if (alive) {
          setState({
            data: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Không thể tải dữ liệu trang chủ',
          })
        }
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [user])

  return state
}
