import api from "@/lib/axios";
import { Admin } from "@/models/admin";
import { AuthRequest } from "@/models/auth";

export const Login = (data: AuthRequest) =>
  api.post<Admin>("/admin/login", data);
