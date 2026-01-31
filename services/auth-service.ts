import api from "@/lib/axios";
import { AuthRequest, AuthUser } from "@/models/auth";

export const Login = (data: AuthRequest) =>
  api.post<AuthUser>("/admin/login", data);
