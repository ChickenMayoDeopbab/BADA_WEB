import Login from '@pages/auth/Login'
import { TrainingRecordsPage } from '@pages/records'
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
  {
    path: '/records',
    element: <TrainingRecordsPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
