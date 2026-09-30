export type RequestType =
  | "early_payment"
  | "maintenance"
  | "inquiry"
  | "concern"
  | "other";

export type RequestStatus = "pending" | "seen" | "resolved" | "dismissed";

export type RenterRequest = {
  id: string;
  renterId: string;
  renterName?: string;
  propertyId?: string;
  type: RequestType;
  subject: string;
  message: string;
  status: RequestStatus;
  createdAt: Date;
  resolvedAt?: Date;
  adminNote?: string;
};
