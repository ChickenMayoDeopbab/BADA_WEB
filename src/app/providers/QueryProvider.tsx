import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getApiErrorMessage } from '@shared/api'
import { useToast } from '@shared/ui'
import { useState, type PropsWithChildren } from 'react'

// 애플리케이션에서 공유할 QueryClient 기본값을 생성합니다.
const createQueryClient = (notify: ReturnType<typeof useToast>) =>
  new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const message = mutation.meta?.errorMessage
        if (typeof message === 'string')
          notify({ message: getApiErrorMessage(error, message), kind: 'error' })
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        const message = mutation.meta?.successMessage
        if (typeof message === 'string') notify({ message })
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: {
        retry: 0,
      },
    },
  })

// 서버 상태를 관리하는 TanStack Query 컨텍스트를 제공합니다.
export const QueryProvider = ({ children }: PropsWithChildren) => {
  const notify = useToast()
  const [queryClient] = useState(() => createQueryClient(notify))

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
