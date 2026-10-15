import type {
  AuthTokens,
  ChangePasswordRequest,
  EmailSendRequest,
  EmailVerificationRequest,
  LoginRequest,
  OAuthProvider,
  OAuthTokenResponse,
  RefreshTokenRequest,
  SignUpRequest,
} from '../model/types'
import { httpClient, plainHttpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

const AUTH_PATH = '/api/v1/auth'

/** 서버에 저장된 로그인 세션을 종료합니다. */
export const signout = async () => {
  await httpClient.delete<ApiResponse<null>>(`${AUTH_PATH}/signout`)
}

/** 아이디와 비밀번호로 로그인합니다. */
export const login = async (request: LoginRequest) => {
  const { data } = await httpClient.post<ApiResponse<AuthTokens>>(`${AUTH_PATH}/login`, request)

  return data.data
}

/** 리프레시 토큰으로 새 인증 토큰을 발급합니다. */
export const refreshAuthTokens = async (request: RefreshTokenRequest) => {
  const { data } = await plainHttpClient.post<ApiResponse<AuthTokens>>(
    `${AUTH_PATH}/refresh`,
    request,
  )

  return data.data
}

/** 새 계정을 등록합니다. */
export const signup = async (request: SignUpRequest) => {
  await httpClient.post<ApiResponse<null>>(`${AUTH_PATH}/signup`, request)
}

/** 아이디 사용 가능 여부를 조회합니다. true면 사용할 수 있는 아이디입니다. */
export const checkUsername = async (username: string) => {
  const { data } = await httpClient.post<ApiResponse<boolean>>(`${AUTH_PATH}/check/username`, {
    username,
  })

  return data.data
}

/** 이메일 인증코드를 전송합니다. */
export const sendEmailCode = async (request: EmailSendRequest) => {
  await httpClient.post<ApiResponse<null>>(`${AUTH_PATH}/email/send`, request)
}

/** 이메일 인증코드를 확인합니다. */
export const checkEmailCode = async (request: EmailVerificationRequest) => {
  await httpClient.post<ApiResponse<null>>(`${AUTH_PATH}/email/check`, request)
}

/** 이메일로 가입된 아이디를 조회합니다. */
export const findId = async (email: string) => {
  const { data } = await httpClient.post<ApiResponse<string>>(`${AUTH_PATH}/find-id`, { email })

  return data.data
}

/** 기존 비밀번호를 새 비밀번호로 변경합니다. */
export const changePassword = async (request: ChangePasswordRequest) => {
  await httpClient.patch<ApiResponse<null>>(`${AUTH_PATH}/password`, request)
}

/** 소셜 로그인 콜백으로 받은 code를 토큰으로 교환합니다. */
export const exchangeOAuthCode = async (code: string) => {
  const { data } = await httpClient.post<ApiResponse<OAuthTokenResponse>>(
    `${AUTH_PATH}/oauth/token`,
    { code },
  )

  return data.data
}

/** 소셜 로그인 제공자의 인증 시작 URL을 만듭니다. 리다이렉트 주소는 서버 기본값을 사용합니다. */
export const getOAuthLoginUrl = (provider: OAuthProvider) =>
  httpClient.getUri({ url: `${AUTH_PATH}/${provider}` })
