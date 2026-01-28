import api from "@/lib/axios";
import { House } from "@/models/house";

export const GetHousesResource = () =>
  api.get<House[]>("/renter/auth/resource");
