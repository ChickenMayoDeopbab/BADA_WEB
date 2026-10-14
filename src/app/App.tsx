import { AppRouter } from './providers/RouterProvider'
import { QueryProvider } from './providers/QueryProvider'

const App = () => {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  )
}

export default App
