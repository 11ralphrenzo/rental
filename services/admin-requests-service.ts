import api from "@/lib/axios";
import { RenterRequest, RequestStatus } from "@/models/request";

export const GetAllRequests = () =>
  api.get<RenterRequest[]>("/admin/requests");

export const UpdateRequest = (data: {
  id: string;
  status?: RequestStatus;
  adminNote?: string;
}) => api.patch<RenterRequest>("/admin/requests", data);
