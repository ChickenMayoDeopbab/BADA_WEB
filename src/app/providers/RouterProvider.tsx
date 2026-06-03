import Login from '@pages/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>홈페이지</div>,
  },
  {
    path: '/login',
    element: <Login />
  }
])

export const AppRouter = () => <RouterProvider router={router} />