export type SignupRequest = {
  username: string;
  password: string;
  email: string;
  name: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type LoginMode = "social" | "id";
