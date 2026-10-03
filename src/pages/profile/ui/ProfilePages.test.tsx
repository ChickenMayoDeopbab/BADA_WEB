import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../model/useProfile', () => ({
  useMyPage: () => ({
    data: {
      name: '변성우',
      username: 'b2ong222',
      email: 'bongchock45@gmail.com',
      s3Key: undefined,
      level: 'LEVEL_2',
      levelName: '초급',
      trainCount: 7,
      attendance: 3,
    },
    isError: false,
  }),
  useProfileImage: () => ({ data: undefined }),
  useRecentTrainings: () => ({ data: [], isError: false, isLoading: false }),
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

  it('toggles each notification setting', () => {
    render(
      <MemoryRouter>
        <ProfileNotificationsPage />
      </MemoryRouter>,
    )

    const marketingToggle = screen.getByRole('button', { name: '마케팅 정보 켜기' })
    expect(marketingToggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(marketingToggle)

    expect(screen.getByRole('button', { name: '마케팅 정보 끄기' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
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
