import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
};

// 로그인 토큰이 있는 사용자에게만 보호된 화면을 표시한다.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("badaAccessToken") || sessionStorage.getItem("badaAccessToken");

  if (!accessToken) return <Navigate to="/login" replace />;

  return children;
}
