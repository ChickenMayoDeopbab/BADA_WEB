import type { UserProfile, UserProfileWithImage } from "../model/types";
import { handleUnauthorizedResponse } from "@shared/api";

const apiBaseUrl = "https://spring.chickenmayo.kr/api/v1";

type ApiError = {
  message?: string;
};

type ApiResponse<T> = {
  data: T;
  error?: ApiError | null;
  message?: string;
};

type ProfileImageResponse = {
  url: string;
};

// 저장된 액세스 토큰을 가져온다.
const getAccessToken = () =>
  localStorage.getItem("badaAccessToken") || sessionStorage.getItem("badaAccessToken");

// 인증이 필요한 사용자 API 요청을 보낸다.
const requestUser = async <T>(path: string, method = "GET"): Promise<T> => {
  const accessToken = getAccessToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  handleUnauthorizedResponse(response);
  const responseText = await response.text();
  const result = responseText
    ? JSON.parse(responseText) as ApiResponse<T>
    : { data: undefined as T };

  if (!response.ok || result.error) {
    throw new Error(result.error?.message || result.message || "프로필을 불러오지 못했습니다.");
  }

  return result.data;
};

// 현재 로그인한 사용자의 프로필과 프로필 이미지 URL을 가져온다.
export const getUserProfile = async (): Promise<UserProfileWithImage> => {
  const profile = await requestUser<UserProfile>("/user/mypage");
  const profileImage = profile.s3Key
    ? await requestUser<ProfileImageResponse>(`/file?s3Key=${encodeURIComponent(profile.s3Key)}`, "POST")
    : null;

  return { ...profile, profileImageUrl: profileImage?.url ?? null };
};
