import { ExperienceProvider } from '@shared/ui'
import { AppRouter } from './providers/RouterProvider'
import { QueryProvider } from './providers/QueryProvider'

// 경험 설정과 서버 상태를 전체 라우트에 제공합니다.
const App = () => {
  return (
    <ExperienceProvider>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ExperienceProvider>
  )
}

export default App
