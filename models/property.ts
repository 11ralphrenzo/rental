export type Property = {
  id: string;
  name: string;
  monthly: number;
  address?: string;
  type?: "Apartment" | "House" | "Commercial" | "Room";
  status?: "Available" | "Occupied" | "Maintenance";
  bedrooms?: number;
  bathrooms?: number;
  createdAt: Date;
};
