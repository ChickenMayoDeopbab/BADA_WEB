import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const { profileQueryMock } = vi.hoisted(() => ({
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
  useProfileImage: () => ({ data: undefined }),
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
  useUpdateMyPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCheckUsername: () => ({ mutateAsync: vi.fn().mockResolvedValue(true), isPending: false }),
  useUploadProfileImage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateNotificationSettings: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

import {
  ProfileEditPage,
  ProfileLanguagePage,
  ProfileNotificationsPage,
  ProfileOverviewPage,
  ProfileRingtonePage,
} from './ProfilePages'

describe('Profile pages', () => {
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
    expect(recordLink).toHaveAttribute('href', '/records?recordId=37')

    fireEvent.click(recordLink)
    expect(screen.getByRole('heading', { name: '훈련 기록' })).toBeInTheDocument()
  })

  it('shows a dash for a notification setting that is not provided by the API', () => {
    render(
      <MemoryRouter>
        <ProfileNotificationsPage />
      </MemoryRouter>,
    )

    const marketingRow = screen.getByText('마케팅 정보').closest('div')?.parentElement
    expect(marketingRow).toHaveTextContent('-')
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

  it('selects a ringtone and previews the default ringtone', () => {
    render(
      <MemoryRouter>
        <ProfileRingtonePage />
      </MemoryRouter>,
    )

    const calmWave = screen.getByRole('button', { name: /잔잔한 파도/ })
    fireEvent.click(calmWave)
    expect(calmWave).toHaveClass('bg-primary-alternative')

    fireEvent.click(screen.getAllByText('미리듣기')[0])
    expect(screen.getByText('정지')).toBeInTheDocument()
  })

  it('changes the selected display language', () => {
    render(
      <MemoryRouter>
        <ProfileLanguagePage />
      </MemoryRouter>,
    )

    const english = screen.getByRole('button', { name: /English/ })
    fireEvent.click(english)

    expect(within(english).getByText('사용 중')).toBeInTheDocument()
  })
})
