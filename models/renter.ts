import { Property } from "./property";

export type Renter = {
  id: string;
  name: string;
  propertyId: string;
  property?: Property;
  createdAt: Date;
  pin_hash: string;
  active: boolean;
  start_date: Date;
  end_date?: Date;
  billing_day?: number;

  // For Supabase Purpose
  properties?: Property;
};
