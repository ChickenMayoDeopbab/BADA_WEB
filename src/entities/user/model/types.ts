export type UserProfile = {
  username: string;
  email: string;
  name: string;
  s3Key: string | null;
  level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5";
  levelName: string;
  diagnosisDate: string | null;
  score: number;
  trainCount: number;
  attendance: number;
};

export type UserProfileWithImage = UserProfile & {
  profileImageUrl: string | null;
};
