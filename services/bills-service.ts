import api from "@/lib/axios";
import { Bill } from "@/models/bill";

export const GetAllBills = () => api.get<Bill[]>("/bills");

export const GetLatestBillByRenter = (renterId: number) =>
  api.get<Bill[]>("/bills", { params: { renterId } }).then((res) => res.data?.[0] ?? null);

export const SaveBill = (data: Bill) => api.post<Bill>("/bills", data);

export const UpdateBill = (data: Bill) => api.put<Bill>("/bills", data);

export const DeleteBill = (id: number) => api.delete<boolean>(`/bills/${id}`);
