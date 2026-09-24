import api from "@/lib/axios";
import { Property } from "@/models/property";

export const GetPropertiesResource = () =>
  api.get<Property[]>("/renter/auth/resource");
