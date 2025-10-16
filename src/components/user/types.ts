// src/types.ts
export interface Ticket {
  id: number;
  event_id: number;
  ticket_name: string;
  is_free: boolean;
  price: string | null;
  description: string;
  capacity: number;
  created_at: string;
  updated_at: string;
  convenience_fee: string;
}

export interface EventDetails {
  id: number;
  event_name: string;
  event_type: string;
  banner?: string;
  venue_address?: string;
  start_datetime: string;
  details?: { end_datetime?: string };
  tickets?: Ticket[];
}

export interface Buyer {
  name: string;
  email: string;
  phone: string;
}

export interface Attendee {
  name: string;
  email: string;
  phone_no: string;
  ticket_id: number | null;
  quantity: number;
}

export interface Payment {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  card_holder_name: string;
  cvv: string;
}
