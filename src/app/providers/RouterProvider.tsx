import { ProtectedRoute } from '@features/auth'
import Login from '@pages/auth/Login'
import { HomePage } from '@pages/home'
import { PlaceholderPage } from '@pages/placeholder'
import Signup from '@pages/auth/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
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
    element: <ProtectedRoute><PlaceholderPage title="훈련" /></ProtectedRoute>,
    path: '/training',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="추천 훈련" /></ProtectedRoute>,
    path: '/training/scenario',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="워밍업" /></ProtectedRoute>,
    path: '/training/warmup',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="훈련 기록" /></ProtectedRoute>,
    path: '/records',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="커뮤니티" /></ProtectedRoute>,
    path: '/community',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="프로필" /></ProtectedRoute>,
    path: '/profile',
  },
  {
    element: <ProtectedRoute><PlaceholderPage title="알림" /></ProtectedRoute>,
    path: '/notifications',
  },
])

export const AppRouter = () => <RouterProvider router={router} />
