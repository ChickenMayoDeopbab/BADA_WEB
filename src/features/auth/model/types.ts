export type LoginMode = 'social' | 'id'

export type OAuthProvider = 'google' | 'naver' | 'apple'

export type EmailVerificationType = 'SIGNUP' | 'FIND_ID' | 'RESET_PASSWORD'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type RefreshTokenRequest = {
  refreshToken: string
  userId: number
}

export type OAuthTokenResponse = AuthTokens & {
  isNewUser: boolean
}

export type LoginRequest = {
  username: string
  password: string
}

export type SignUpRequest = {
  username: string
  password: string
  email: string
  name: string
}

export type EmailSendRequest = {
  email: string
  type: EmailVerificationType
}

export type EmailVerificationRequest = {
  email: string
  authNum: string
  type: EmailVerificationType
}

export type ChangePasswordRequest = {
  email: string
  oldPassword: string
  newPassword: string
}
