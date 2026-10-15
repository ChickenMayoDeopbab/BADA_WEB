import { RouteErrorPage } from './RouteErrorPage'
import { ServiceLayout } from '../layouts/ServiceLayout'
import { AuthProvider, RequireAuth } from '@features/auth'
import {
  FindIdPage,
  LoginPage,
  OAuthCallbackPage,
  ResetPasswordPage,
  SignupPage,
} from '@pages/auth'
import { CommunityPage } from '@pages/community'
import { DashboardPage } from '@pages/dashboard'
import { NotFoundPage, PlaceholderPage } from '@pages/placeholders'
import { NotificationsPage } from '@pages/notifications'
import {
  ProfileInquiryPage,
  ProfilePaymentInterestPage,
  ProfileEditPage,
  ProfileLanguagePage,
  ProfileNotificationsPage,
  ProfileOverviewPage,
  ProfilePrivacyPage,
  ProfileBlockedUsersPage,
  ProfileRingtonePage,
} from '@pages/profile'
import { TrainingRecordsPage } from '@pages/records'
import {
  WarmupPage,
  CustomScenarioPage,
  ScenarioCallPage,
  ScenarioResultPage,
  ScenarioSettingsPage,
  ScenarioTrainingPage,
} from '@pages/training'
import { SelfDiagnosisPage } from '@pages/self-diagnosis'
import { routePaths } from '@shared/config'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom'

/** 보호 경로에서 하나의 서버 인증 확인 결과를 공유합니다. */
const ProtectedRoutes = () => {
  return (
    <AuthProvider>
      <RequireAuth />
    </AuthProvider>
  )
}

const applicationRoutes: RouteObject[] = [
  {
    path: routePaths.landing,
    element: <PlaceholderPage title="전화가 편해지는 연습, Bada" />,
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
    element: <ProtectedRoutes />,
    children: [
      {
        element: <ServiceLayout />,
        children: [
          {
            path: routePaths.dashboard,
            element: <DashboardPage />,
          },
          {
            path: routePaths.training,
            element: <ScenarioTrainingPage />,
          },
          { path: routePaths.trainingWarmup, element: <WarmupPage /> },
          { path: routePaths.profileInquiry, element: <ProfileInquiryPage /> },
          { path: routePaths.profilePaymentInterest, element: <ProfilePaymentInterestPage /> },
          {
            path: routePaths.trainingCustomNew,
            element: <CustomScenarioPage />,
          },
          {
            path: routePaths.trainingSettings,
            element: <ScenarioSettingsPage />,
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
            path: routePaths.communityPostEdit,
            element: <CommunityPage />,
          },
          {
            path: routePaths.communityNew,
            element: <CommunityPage />,
          },
          {
            path: routePaths.notifications,
            element: <NotificationsPage />,
          },
          {
            path: routePaths.profile,
            element: <ProfileOverviewPage />,
          },
          {
            path: routePaths.profilePrivacy,
            element: <ProfilePrivacyPage />,
          },
          {
            path: routePaths.profileBlockedUsers,
            element: <ProfileBlockedUsersPage />,
          },
          {
            path: routePaths.profileEdit,
            element: <ProfileEditPage />,
          },
          {
            path: routePaths.profilePhoto,
            element: <Navigate to={routePaths.profileEdit} replace />,
          },
          {
            path: routePaths.profileRingtone,
            element: <ProfileRingtonePage />,
          },
          {
            path: routePaths.profileNotifications,
            element: <ProfileNotificationsPage />,
          },
          {
            path: routePaths.profileLanguage,
            element: <ProfileLanguagePage />,
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
      {
        path: routePaths.welcome,
        element: <SelfDiagnosisPage />,
      },
      {
        path: routePaths.trainingCall,
        element: <ScenarioCallPage />,
      },
      {
        path: routePaths.trainingResult,
        element: <ScenarioResultPage />,
      },
    ],
  },
]

const router = createBrowserRouter([
  { element: <Outlet />, errorElement: <RouteErrorPage />, children: applicationRoutes },
])

export const AppRouter = () => <RouterProvider router={router} />
