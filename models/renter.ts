import { House } from "./house";

export type Renter = {
  id: number;
  name: string;
  houseId: number;
  house?: House;
  createdAt: Date;
  pin_hash: string;
  active: boolean;
  start_date: Date;
  end_date?: Date;

  // For Supabase Purpose
  houses?: House;
};
