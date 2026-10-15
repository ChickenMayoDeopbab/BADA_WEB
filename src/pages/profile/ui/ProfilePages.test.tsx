import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { profileImageQueryMock, profileQueryMock, withdrawAccountMock, updateProfileMock } =
  vi.hoisted(() => ({
    updateProfileMock: vi.fn().mockResolvedValue(undefined),
    withdrawAccountMock: vi.fn(),
    profileImageQueryMock: { data: undefined as string | undefined },
    profileQueryMock: {
      data: {
        name: '변성우',
        username: 'b2ong222',
        email: 'bongchock45@gmail.com',
        s3Key: undefined as string | undefined,
        level: 'LEVEL_2',
        levelName: '초급',
        trainCount: 7,
        attendance: 3,
      } as
        | {
            name: string
            username: string
            email: string
            s3Key?: string
            level: string
            levelName: string
            trainCount: number
            attendance: number
          }
        | undefined,
      isError: false,
    },
  }))

vi.mock('../model/useProfile', () => ({
  useMyPage: () => profileQueryMock,
  useProfileImage: () => profileImageQueryMock,
  useRecentTrainings: () => ({
    data: [
      {
        recordId: 37,
        trainedAt: '2026-09-03T12:00:00',
        scenarioName: '피자 배달',
        sessionType: 'CUSTOM',
      },
    ],
    isError: false,
    isLoading: false,
  }),
  useNotificationSettings: () => ({
    data: { trainingEnabled: true, communityEnabled: true, allEnabled: true },
    isError: false,
  }),
  useUpdateMyPage: () => ({ mutateAsync: updateProfileMock, isPending: false }),
  useCheckUsername: () => ({ mutateAsync: vi.fn().mockResolvedValue(true), isPending: false }),
  useUploadProfileImage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateNotificationSettings: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useWithdrawAccount: () => ({ mutateAsync: withdrawAccountMock, isPending: false }),
}))

vi.mock('@features/auth', () => ({
  clearAuthSession: vi.fn(),
  LogoutButton: () => <button>로그아웃</button>,
}))
vi.mock('../model/useProfileImageConsent', () => ({
  useProfileImageConsent: () => ({
    ensureConsent: vi.fn().mockResolvedValue(true),
    isChecking: false,
    isDialogOpen: false,
  }),
}))

afterEach(() => {
  cleanup()
  profileImageQueryMock.data = undefined
  updateProfileMock.mockClear()
})

import { ProfileEditPage, ProfileNotificationsPage, ProfileOverviewPage } from './ProfilePages'

describe('Profile pages', () => {
  it('이메일은 변경하거나 포커스할 수 없는 비활성 입력이다', () => {
    render(<ProfileEditPage />, { wrapper: MemoryRouter })
    expect(screen.getByRole('textbox', { name: '이메일' })).toBeDisabled()
  })
  it('프로필 수정에서 기본 사진을 선택하고 기본 정보와 함께 저장한다', async () => {
    render(<ProfileEditPage />, { wrapper: MemoryRouter })
    expect(screen.queryByRole('link', { name: '프로필 사진 변경' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '기본 이미지로 변경' }))
    fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))
    await waitFor(() =>
      expect(updateProfileMock).toHaveBeenCalledWith({
        name: '변성우',
        username: 'b2ong222',
        s3Key: '',
      }),
    )
  })

  it('uses the same horizontal header layout as training records', () => {
    render(<ProfileOverviewPage />, { wrapper: MemoryRouter })

    const heading = screen.getByRole('heading', { name: '프로필', level: 1 })
    const header = heading.closest('header')
    const main = heading.closest('main')

    expect(header).toHaveClass('flex', 'items-center', 'gap-3')
    expect(header).toHaveTextContent('계정 정보와 서비스 설정을 관리하세요.')
    expect(main).not.toHaveClass('bg-background-alternative')
  })

  it('fills the profile circle with an uploaded image', () => {
    profileImageQueryMock.data = 'https://example.com/profile.png'

    render(<ProfileOverviewPage />, { wrapper: MemoryRouter })

    expect(screen.getByRole('img', { name: '변성우 프로필' })).toHaveClass(
      'size-full',
      'object-cover',
    )
  })

  it('moves from the overview to profile edit', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileOverviewPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: '프로필 수정' }))

    expect(screen.getByRole('heading', { name: '프로필 수정', level: 1 })).toBeInTheDocument()
  })

  it('opens the delete account dialog on the profile page', () => {
    render(<ProfileOverviewPage />, { wrapper: MemoryRouter })

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }))

    const dialog = screen.getByRole('dialog', { name: '정말 회원 탈퇴할까요?' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '프로필', level: 1 })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.touchAction).not.toBe('none')

    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.touchAction).toBe('')
  })

  it('confirms account withdrawal and moves to login', async () => {
    withdrawAccountMock.mockResolvedValue(undefined)
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileOverviewPage />} />
          <Route path="/login" element={<h1>로그인</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }))
    const dialog = screen.getByRole('dialog', { name: '정말 회원 탈퇴할까요?' })
    fireEvent.click(within(dialog).getByRole('button', { name: '회원 탈퇴' }))

    await waitFor(() => expect(withdrawAccountMock).toHaveBeenCalledOnce())
    expect(await screen.findByRole('heading', { name: '로그인' })).toBeInTheDocument()
  })

  it('moves from a recent training to its record URL', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileOverviewPage />} />
          <Route path="/records" element={<h1>훈련 기록</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    const recordLink = screen.getByRole('link', { name: '피자 배달 기록 보기' })
    expect(recordLink).toHaveAttribute(
      'href',
      '/records?recordId=37&trainedAt=2026-09-03T12%3A00%3A00',
    )

    fireEvent.click(recordLink)
    expect(screen.getByRole('heading', { name: '훈련 기록' })).toBeInTheDocument()
  })

  it('알림 설정은 전체·커뮤니티·훈련 세 항목만 표시한다', () => {
    render(
      <MemoryRouter>
        <ProfileNotificationsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '전체 알림 끄기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '커뮤니티 알림 끄기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '훈련 알림 끄기' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /마케팅 정보/ })).not.toBeInTheDocument()
  })

  it('shows dashes instead of dummy profile data when the profile is unavailable', () => {
    const previousProfile = profileQueryMock.data
    profileQueryMock.data = undefined

    const { container } = render(
      <MemoryRouter>
        <ProfileOverviewPage />
      </MemoryRouter>,
    )

    expect(within(container).queryByText('변성우')).not.toBeInTheDocument()
    expect(within(container).queryByText('@b2ong222')).not.toBeInTheDocument()
    expect(within(container).getAllByText('-').length).toBeGreaterThan(0)

    profileQueryMock.data = previousProfile
  })
})
