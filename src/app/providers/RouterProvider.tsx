import Signup from '@pages/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>홈페이지</div>,
  },
  {
    path: '/signup',
    element: <Signup />
  }
])

export const AppRouter = () => <RouterProvider router={router} />