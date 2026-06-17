import Login from '@pages/auth/Login'
import Signup from '@pages/auth/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>홈페이지</div>,
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

export const AppRouter = () => <RouterProvider router={router} />