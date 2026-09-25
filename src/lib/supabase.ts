import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/**
 * Supabase client instance.
 * If credentials are not yet configured in .env, safe fallback is provided.
 */
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      return clientInstance;
    } catch {
      return null;
    }
  }
  return null;
}

export type OrderRecord = {
  id: string; // e.g. INV-20260924-XXXX
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: Array<{
    id: string;
    name: string;
    variant?: string;
    price: number;
    qty: number;
    image?: string;
  }>;
  total_amount: number;
  shipping_zone?: "JAWA" | "LUAR_JAWA" | "PICKUP" | string;
  shipping_fee?: number;
  payment_gateway: "tripay" | "tokopay" | "manual_wa";
  payment_channel: "qris" | "va_bca" | "va_mandiri" | "va_bri" | "cash_cod";
  payment_status: "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "CANCELLED" | "REFUNDED";
  payment_url?: string;
  qris_string?: string;
  checkout_url?: string;
  tripay_reference?: string;
  tokopay_trx_id?: string;
  pay_code?: string;
  created_at: string;
  paid_at?: string;
  refund_note?: string;
  refunded_at?: string;
};
