import api from "@/lib/axios";
import { Bill } from "@/models/bill";

export const GetRenterBills = () => api.get<Bill[]>("/renter/bills");
