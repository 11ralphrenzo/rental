import api from "@/lib/axios";
import { House } from "@/models/house";

export const GetAllHouses = () => api.get<House[]>("/houses");

export const SaveHouse = (data: House) => api.post<House>("/houses", data);

export const UpdateHouse = (data: House) => api.put<House>("/houses", data);

export const DeleteHouse = (id: number) => api.delete<boolean>(`/houses/${id}`);
