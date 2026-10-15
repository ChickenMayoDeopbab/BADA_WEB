import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post, remove } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), remove: vi.fn() }))
vi.mock('@shared/api', () => ({ httpClient: { get, post, delete: remove } }))
import {
  getLegalConsentStatus,
  acceptLegalConsents,
  withdrawProfileImageConsent,
} from './legalConsentApi'

const status = {
  termsOfServiceAgreed: true,
  privacyPolicyAcknowledged: true,
  sensitiveInformationAgreed: false,
  profileImageAgreed: true,
  legalActionRequired: false,
}

describe('legal consent response compatibility', () => {
  beforeEach(() => vi.clearAllMocks())
  it.each([status, { data: status }])(
    'reads both direct and wrapped consent statuses',
    async (response) => {
      get.mockResolvedValue({ data: response })
      await expect(getLegalConsentStatus()).resolves.toEqual(status)
    },
  )
  it('accepts the explicit choices and unwraps a direct status', async () => {
    const request = {
      termsOfServiceAgreed: true,
      privacyPolicyAcknowledged: true,
      sensitiveInformationAgreed: false,
      profileImageAgreed: true,
    }
    post.mockResolvedValue({ data: status })
    await expect(acceptLegalConsents(request)).resolves.toEqual(status)
    expect(post).toHaveBeenCalledWith('/api/v1/legal-consents/accept', request)
  })
  it('withdraws profile image consent through its dedicated endpoint', async () => {
    remove.mockResolvedValue({ data: { data: { ...status, profileImageAgreed: false } } })
    await expect(withdrawProfileImageConsent()).resolves.toMatchObject({
      profileImageAgreed: false,
    })
    expect(remove).toHaveBeenCalledWith('/api/v1/legal-consents/profile-image')
  })
})
