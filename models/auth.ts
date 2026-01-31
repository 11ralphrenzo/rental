export type AuthRequest = {
  username: string;
  password: string;
  type: number;
};

export type AuthResponse = {
  id?: number;
  username?: string;
  type?: number;
  message: string;
};

export type AuthUser = {
  id: number;
  userName?: string;
  name: string;
  type?: string | undefined;
  accessToken: string;
};
