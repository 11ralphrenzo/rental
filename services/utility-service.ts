import api from "@/lib/axios";
import { Utility } from "@/models/utility";

export const GetAllUtilities = () => api.get<Utility[]>("/utilities");

export const SaveUtility = (data: Utility) => api.post<Utility>("/utilities", data);

export const UpdateUtility = (data: Utility) => api.put<Utility>("/utilities", data);

export const DeleteUtility = (id: string) => api.delete<boolean>(`/utilities/${id}`);
