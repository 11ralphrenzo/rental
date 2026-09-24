import api from "@/lib/axios";
import { Property } from "@/models/property";

export const GetAllProperties = () => api.get<Property[]>("/properties");

export const SaveProperty = (data: Property) => api.post<Property>("/properties", data);

export const UpdateProperty = (data: Property) => api.put<Property>("/properties", data);

export const DeleteProperty = (id: string) => api.delete<boolean>(`/properties/${id}`);
