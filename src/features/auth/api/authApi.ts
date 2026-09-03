import type { LoginRequest, SignupRequest, TokenResponse } from "../model/types";

const apiBaseUrl = "https://spring.chickenmayo.kr/api/v1/auth";

type ApiError = {
  message?: string;
};

type ApiResponse<T> = {
  data: T;
  error?: ApiError | null;
  message?: string;
};

// 인증 API에 JSON 요청을 보낸다.
const requestAuth = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const result = responseText
    ? JSON.parse(responseText) as ApiResponse<T>
    : { data: undefined as T };

  if (!response.ok || result.error) {
    throw new Error(result.error?.message || result.message || "요청에 실패했습니다.");
  }

  return result.data;
};

// 회원가입을 요청한다.
export const signup = (signupRequest: SignupRequest) =>
  requestAuth<void>("/signup", signupRequest);

// 아이디와 비밀번호로 로그인한다.
export const login = (loginRequest: LoginRequest) =>
  requestAuth<TokenResponse>("/login", loginRequest);

// 아이디 중복 여부를 확인한다.
export const checkUsername = (username: string) =>
  requestAuth<boolean>("/check/username", { username });

// 이메일 인증 코드를 전송한다.
export const sendEmailVerification = (email: string) =>
  requestAuth<void>("/email/send", { email });

// 이메일 인증 코드를 확인한다.
export const checkEmailVerification = (email: string, authNum: string) =>
  requestAuth<void>("/email/check", { email, authNum });
