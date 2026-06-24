import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "customer" | "shop_owner" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  address: string;
  phone: string;
  is_open: boolean;
  delivery_fee: number;
  min_order: number;
}