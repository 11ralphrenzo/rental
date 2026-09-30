export type PaymentChannel = {
  id: string;            // uuid generated client-side
  channel: string;       // e.g. "GCash", "Maya", "BPI"
  account_number: string;
  account_name?: string; // optional
  qr_data?: string;      // optional string content of the QR code
  instructions?: string; // optional note for the renter
};

export type Admin = {
  id: string;
  username: string;
  type: number;
  messenger?: string;
  viber?: string;
  payment_channels?: PaymentChannel[];
};
