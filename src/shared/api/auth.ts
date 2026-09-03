// 만료된 인증 정보를 제거하고 로그인 화면으로 이동한다.
export const handleUnauthorizedResponse = (response: Response) => {
  if (response.status !== 401) return;

  localStorage.removeItem("badaAccessToken");
  localStorage.removeItem("badaRefreshToken");
  sessionStorage.removeItem("badaAccessToken");
  sessionStorage.removeItem("badaRefreshToken");
  window.location.replace("/login");
  throw new Error("로그인이 필요합니다.");
};
