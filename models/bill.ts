import { BillStatus } from "@/lib/enum";
import { Renter } from "./renter";

export type BillUtility = {
  utilityId: string;
  name: string;
  rate: number;
  prev: number;
  curr: number;
  total: number;
  unit?: string;
};

export type CustomCharge = {
  name: string;
  amount: number;
};

export type Bill = {
  id: string;
  renterId: string;
  renter?: Renter;
  month: Date;
  rent: number;
  utilities: BillUtility[];
  customCharges: CustomCharge[];
  total: number;
  status: BillStatus;
  createdAt: Date;
};
