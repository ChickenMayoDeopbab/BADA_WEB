import { useEffect, useState } from "react";
import { getUserProfile } from "../api/userApi";
import type { UserProfileWithImage } from "./types";

// 현재 로그인한 사용자의 프로필을 관리한다.
export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfileWithImage | null>(null);

  useEffect(() => {
    // 프로필 정보를 불러온다.
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error(error);
      }
    };

    void loadUserProfile();
  }, []);

  return userProfile;
};
