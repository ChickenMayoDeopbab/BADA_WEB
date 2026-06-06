import Welcome from '@pages/diagnosis/Welcome'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>홈페이지</div>,
  },
  {
    path: '/welcome',
    element: <Welcome />
  }
])

export const AppRouter = () => <RouterProvider router={router} />