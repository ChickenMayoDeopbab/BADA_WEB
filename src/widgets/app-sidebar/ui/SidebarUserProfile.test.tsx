import { SidebarUserProfile } from './SidebarUserProfile'
import { useCurrentUser, useCurrentUserProfileImage } from '@entities/user'
import defaultProfileSummary from '@shared/assets/profile/default-profile-summary.svg'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@entities/user', () => ({
  useCurrentUser: vi.fn(),
  useCurrentUserProfileImage: vi.fn(),
}))

const mockedUseCurrentUser = vi.mocked(useCurrentUser)
const mockedUseCurrentUserProfileImage = vi.mocked(useCurrentUserProfileImage)

describe('SidebarUserProfile', () => {
  beforeEach(() => {
    mockedUseCurrentUser.mockReturnValue({
      data: {
        username: 'bada-user',
        email: 'user@example.com',
        name: '바다',
        s3Key: 'profiles/user.png',
      },
      isPending: false,
    } as ReturnType<typeof useCurrentUser>)
    mockedUseCurrentUserProfileImage.mockReturnValue({
      data: 'https://example.com/profile.png',
    } as ReturnType<typeof useCurrentUserProfileImage>)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the current user information and profile image', () => {
    render(<SidebarUserProfile />)

    expect(screen.getByText('바다')).toBeInTheDocument()
    expect(screen.getByText('bada-user')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '바다 프로필' })).toHaveAttribute(
      'src',
      'https://example.com/profile.png',
    )
    expect(mockedUseCurrentUserProfileImage).toHaveBeenCalledWith('profiles/user.png')
  })

  it('shows a stable loading placeholder while current user data loads', () => {
    mockedUseCurrentUser.mockReturnValue({
      data: undefined,
      isPending: true,
    } as ReturnType<typeof useCurrentUser>)

    render(<SidebarUserProfile />)

    expect(screen.getByLabelText('사용자 정보 로딩 중')).toBeInTheDocument()
  })

  it('falls back to the default profile image when the remote image fails', () => {
    render(<SidebarUserProfile />)
    const image = screen.getByRole('img', { name: '바다 프로필' })

    fireEvent.error(image)

    expect(screen.getByRole('img', { name: '바다 프로필' })).toHaveClass('bg-fill-normal')
    expect(screen.getByRole('img', { name: '바다 프로필' }).querySelector('img')).toHaveAttribute(
      'src',
      defaultProfileSummary,
    )
    expect(screen.queryByRole('img', { name: '바다 프로필' })).not.toHaveAttribute(
      'src',
      'https://example.com/profile.png',
    )
  })

  it('tries a new profile image after a previous URL failed', () => {
    const { rerender } = render(<SidebarUserProfile />)
    fireEvent.error(screen.getByRole('img', { name: '바다 프로필' }))
    mockedUseCurrentUserProfileImage.mockReturnValue({
      data: 'https://example.com/new-profile.png',
    } as ReturnType<typeof useCurrentUserProfileImage>)

    rerender(<SidebarUserProfile />)

    expect(screen.getByRole('img', { name: '바다 프로필' })).toHaveAttribute(
      'src',
      'https://example.com/new-profile.png',
    )
  })

  it('shows the default profile image without requesting a profile image when s3Key is absent', () => {
    mockedUseCurrentUser.mockReturnValue({
      data: {
        username: 'bada-user',
        email: 'user@example.com',
        name: '바다',
      },
      isPending: false,
    } as ReturnType<typeof useCurrentUser>)
    mockedUseCurrentUserProfileImage.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useCurrentUserProfileImage>)

    render(<SidebarUserProfile />)

    expect(screen.getByRole('img', { name: '바다 프로필' })).toHaveClass('bg-fill-normal')
    expect(screen.getByRole('img', { name: '바다 프로필' }).querySelector('img')).toHaveAttribute(
      'src',
      defaultProfileSummary,
    )
    expect(mockedUseCurrentUserProfileImage).toHaveBeenCalledWith(undefined)
  })
})
