import api from "@/lib/axios";
import { AuthUser } from "@/models/auth";
import { Renter } from "@/models/renter";

export const Login = (renter: Renter) =>
  api.post<AuthUser>("/renter/auth", renter);
