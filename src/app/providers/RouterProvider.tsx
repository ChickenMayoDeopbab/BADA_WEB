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
import { PlaceholderPage, ServicePlaceholderPage } from '@pages/placeholders'
import {
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
  useLocation,
  type RouteObject,
} from 'react-router-dom'

const applicationRoutes: RouteObject[] = [
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
            element: <DashboardPage />,
          },
          {
            path: routePaths.training,
            element: <ScenarioTrainingPage />,
          },
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
            element: <ServicePlaceholderPage title="알림 화면" />,
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
  {
    path: '*',
    element: <Navigate to={routePaths.landing} replace />,
  },
]

/** 경로 전환마다 저장소를 다시 읽으며 앱 전체의 서버 인증 상태를 제공합니다. */
const AuthRoot = () => {
  useLocation()
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

const router = createBrowserRouter([{ element: <AuthRoot />, children: applicationRoutes }])

export const AppRouter = () => <RouterProvider router={router} />
