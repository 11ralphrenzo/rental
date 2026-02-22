import { BillStatus } from "@/lib/enum";
import { Renter } from "./renter";

export type Bill = {
  id: number;
  renterId: number;
  renter?: Renter;
  month: Date;
  rent: number;
  rate_electricity: number;
  prev_electricity: number;
  curr_electricity: number;
  total_electricity: number;
  rate_water: number;
  prev_water: number;
  curr_water: number;
  total_water: number;
  others: number;
  total: number;
  status: BillStatus;
  createdAt: Date;

  //   For Supabase Purpose
  renters?: Renter;
};
