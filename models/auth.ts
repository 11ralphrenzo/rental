export type AuthRequest = {
  username: string;
  password: string;
  type: number;
};

export type AuthResponse = {
  id?: string;
  username?: string;
  type?: number;
  message: string;
};

export type AuthUser = {
  id: string;
  userName?: string;
  name: string;
  type?: string | undefined;
  propertyId?: string;
  accessToken: string;
};
