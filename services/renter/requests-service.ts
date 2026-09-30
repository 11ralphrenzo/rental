import api from "@/lib/axios";
import { RenterRequest } from "@/models/request";

export const GetMyRequests = () =>
  api.get<RenterRequest[]>("/renter/requests");

export const CreateRequest = (
  data: Pick<RenterRequest, "type" | "subject" | "message">
) => api.post<RenterRequest>("/renter/requests", data);
