import api from "@/lib/axios";
import { Renter } from "@/models/renter";

export const GetAllRenters = () => api.get<Renter[]>("/renters");

export const SaveRenter = (data: Renter) => api.post<Renter>("/renters", data);

export const UpdateRenter = (data: Renter) => api.put<Renter>("/renters", data);

export const DeleteRenter = (id: number) =>
  api.delete<boolean>(`/renters/${id}`);
