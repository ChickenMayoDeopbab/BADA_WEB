import { ServiceLayout } from '../layouts/ServiceLayout'
import { RequireAuth } from '@features/auth'
import {
  FindIdPage,
  LoginPage,
  OAuthCallbackPage,
  ResetPasswordPage,
  SignupPage,
} from '@pages/auth'
import { PlaceholderPage, ServicePlaceholderPage } from '@pages/placeholders'
import { TrainingRecordsPage } from '@pages/records'
import { CommunityPage } from '@pages/community'
import { routePaths } from '@shared/config'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: routePaths.landing,
    element: <PlaceholderPage title="랜딩 페이지" />,
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
  },
  {
    path: routePaths.signup,
    element: <SignupPage />,
  },
  {
    path: routePaths.welcome,
    element: <PlaceholderPage title="회원가입 완료 화면" />,
  },
  {
    path: routePaths.findId,
    element: <FindIdPage />,
  },
  {
    path: routePaths.resetPassword,
    element: <ResetPasswordPage />,
  },
  {
    path: routePaths.oauthCallback,
    element: <OAuthCallbackPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ServiceLayout />,
        children: [
          {
            path: routePaths.dashboard,
            element: <ServicePlaceholderPage title="대시보드 화면" />,
          },
          {
            path: routePaths.training,
            element: <ServicePlaceholderPage title="시나리오 훈련 목록 화면" />,
          },
          {
            path: routePaths.trainingCustomNew,
            element: <ServicePlaceholderPage title="커스텀 시나리오 생성 화면" />,
          },
          {
            path: routePaths.trainingSettings,
            element: <ServicePlaceholderPage title="훈련 설정 화면" />,
          },
          {
            path: routePaths.records,
            element: <TrainingRecordsPage />,
          },
          {
            path: routePaths.community,
            element: <CommunityPage />,
          },
          {
            path: routePaths.communityPost,
            element: <CommunityPage />,
          },
          {
            path: routePaths.communityNew,
            element: <CommunityPage />,
          },
          {
            path: routePaths.notifications,
            element: <ServicePlaceholderPage title="알림 화면" />,
          },
          {
            path: routePaths.profile,
            element: <ServicePlaceholderPage title="마이페이지 화면" />,
          },
          {
            path: routePaths.profileEdit,
            element: <ServicePlaceholderPage title="프로필 수정 화면" />,
          },
          {
            path: routePaths.profilePhoto,
            element: <ServicePlaceholderPage title="프로필 사진 변경 화면" />,
          },
          {
            path: routePaths.profileRingtone,
            element: <ServicePlaceholderPage title="벨소리 설정 화면" />,
          },
          {
            path: routePaths.profileNotifications,
            element: <ServicePlaceholderPage title="알림 설정 화면" />,
          },
          {
            path: routePaths.profileLanguage,
            element: <ServicePlaceholderPage title="언어 설정 화면" />,
          },
          {
            path: routePaths.profileDeleteAccount,
            element: <ServicePlaceholderPage title="회원 탈퇴 화면" />,
          },
        ],
      },
      {
        path: routePaths.trainingCall,
        element: <PlaceholderPage title="시나리오 통화 화면" />,
      },
      {
        path: routePaths.trainingResult,
        element: <PlaceholderPage title="통화 후 피드백 화면" />,
      },
    ],
  },
  {
    path: '*',
    element: <PlaceholderPage title="페이지를 찾을 수 없습니다." />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
