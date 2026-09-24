import { createServerFn } from "@tanstack/react-start";
import { getSupabaseClient, type OrderRecord } from "@/lib/supabase";
import crypto from "node:crypto";

const TOKOPAY_API_BASE = "https://api.tokopay.id/v1";

// Memory storage fallback for local dev / testing before Supabase keys are entered
const memoryOrders = new Map<string, OrderRecord>();

function getEnv(key: string): string {
  return (process.env[key] || "").trim();
}

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex");
}

function generateInvoiceId(): string {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yyyymmdd}-${rand}`;
}

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: Array<{
    id: string;
    name: string;
    variant?: string;
    price: number;
    qty: number;
    image?: string;
  }>;
  paymentChannel?: "qris" | "va_bca" | "va_mandiri" | "va_bri";
};

export const createOrderQris = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: CreateOrderInput }) => {
    const customerName = (data?.customerName ?? "").trim();
    const customerPhone = (data?.customerPhone ?? "").trim();
    const customerAddress = (data?.customerAddress ?? "").trim();
    const items = Array.isArray(data?.items) ? data.items : [];

    if (!customerName) throw new Error("Nama pemesan wajib diisi.");
    if (!customerPhone || customerPhone.length < 8) {
      throw new Error("Nomor WhatsApp pemesan wajib valid.");
    }
    if (items.length === 0) throw new Error("Keranjang belanja kosong.");

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (totalAmount <= 0) throw new Error("Total pembayaran tidak valid.");

    const orderId = generateInvoiceId();
    const merchantId = getEnv("TOKOPAY_MERCHANT_ID");
    const secretKey = getEnv("TOKOPAY_SECRET_KEY");

    let qrisString = "";
    let qrisUrl = "";
    let tokopayTrxId = `TEST-TRX-${Date.now()}`;
    let isTestMode = false;

    if (merchantId && secretKey && merchantId !== "test") {
      // Live / Sandbox Tokopay.id Request
      const signature = md5(`${merchantId}:${secretKey}:${orderId}`);
      try {
        const payload = {
          merchant_id: merchantId,
          secret_key: secretKey,
          ref_id: orderId,
          nominal: totalAmount,
          metode: "QRIS",
          customer_name: customerName,
          customer_phone: customerPhone,
          signature,
        };

        const res = await fetch(`${TOKOPAY_API_BASE}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = (await res.json()) as {
          status?: boolean | string | number;
          message?: string;
          error_msg?: string;
          data?: {
            trx_id?: string;
            qr_link?: string;
            qr_string?: string;
            pay_url?: string;
          };
        };

        if (json.data && (json.status === "Success" || json.status === 1 || json.status === true)) {
          tokopayTrxId = json.data.trx_id || tokopayTrxId;
          qrisString = json.data.qr_string || "";
          qrisUrl = json.data.qr_link || json.data.pay_url || "";
        } else if (json.error_msg) {
          console.warn("Tokopay API notice:", json.error_msg);
          isTestMode = true;
        }
      } catch (e) {
        console.error("Tokopay live request error, falling back to test mode:", e);
        isTestMode = true;
      }
    } else {
      isTestMode = true;
    }

    if (isTestMode || !qrisUrl) {
      // Testing QRIS payload with dynamic QR code
      const dummyQrPayload = `00020101021126580016ID.CO.TOKOPAY.WWW01189360099900000000005204581253033605802ID5914BUANA COMPUTER6006BANTUL61055519662${orderId}540${totalAmount}6304`;
      qrisString = dummyQrPayload;
      qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=12&data=${encodeURIComponent(
        dummyQrPayload,
      )}`;
    }

    const newOrder: OrderRecord = {
      id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress || undefined,
      items,
      total_amount: totalAmount,
      payment_gateway: "tokopay",
      payment_channel: "qris",
      payment_status: "PENDING",
      payment_url: qrisUrl,
      qris_string: qrisString,
      tokopay_trx_id: tokopayTrxId,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase (if connected)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("orders").insert([newOrder]);
      } catch (err) {
        console.warn("Supabase insert error (fallback to memory):", err);
      }
    }

    // Always keep in memory for instant local retrieval
    memoryOrders.set(orderId, newOrder);

    return {
      ok: true as const,
      order: newOrder,
      isTestMode,
    };
  },
);

export const checkOrderStatus = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { orderId: string } }) => {
    const orderId = (data?.orderId ?? "").trim();
    if (!orderId) throw new Error("Order ID kosong.");

    // Check memory first
    let order = memoryOrders.get(orderId);

    // If not in memory, check Supabase
    if (!order) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: dbOrder } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();
          if (dbOrder) {
            order = dbOrder as OrderRecord;
            memoryOrders.set(orderId, order);
          }
        } catch {
          // ignore
        }
      }
    }

    if (!order) {
      throw new Error("Order tidak ditemukan.");
    }

    // If still PENDING and Tokopay credentials exist, check status from Tokopay API
    if (order.payment_status === "PENDING") {
      const merchantId = getEnv("TOKOPAY_MERCHANT_ID");
      const secretKey = getEnv("TOKOPAY_SECRET_KEY");

      if (merchantId && secretKey && merchantId !== "test") {
        try {
          const url = `${TOKOPAY_API_BASE}/order/status?merchant_id=${encodeURIComponent(
            merchantId,
          )}&secret_key=${encodeURIComponent(secretKey)}&ref_id=${encodeURIComponent(orderId)}`;

          const res = await fetch(url, { method: "GET" });
          const json = (await res.json()) as {
            status?: boolean | string | number;
            data?: {
              status?: string;
              status_pembayaran?: string;
              paid_at?: string;
            };
          };

          const rawStatus = (
            json?.data?.status ||
            json?.data?.status_pembayaran ||
            ""
          ).toUpperCase();

          if (
            rawStatus === "PAID" ||
            rawStatus === "SUCCESS" ||
            rawStatus === "BERHASIL" ||
            rawStatus === "TERBAYAR"
          ) {
            const paidAt = json.data?.paid_at || new Date().toISOString();
            order.payment_status = "PAID";
            order.paid_at = paidAt;
            memoryOrders.set(orderId, order);

            const supabase = getSupabaseClient();
            if (supabase) {
              try {
                await supabase
                  .from("orders")
                  .update({ payment_status: "PAID", paid_at: paidAt })
                  .eq("id", orderId);
              } catch {
                // ignore
              }
            }
          }
        } catch (e) {
          console.warn("Tokopay live status check error:", e);
        }
      }
    }

    return {
      ok: true as const,
      order,
    };
  },
);

/**
 * Simulasikan pembayaran lunas untuk keperluan demo & pengujian toko
 */
export const simulateOrderPayment = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { orderId: string } }) => {
    const orderId = (data?.orderId ?? "").trim();
    if (!orderId) throw new Error("Order ID kosong.");

    const order = memoryOrders.get(orderId);
    const paidAt = new Date().toISOString();

    if (order) {
      order.payment_status = "PAID";
      order.paid_at = paidAt;
      memoryOrders.set(orderId, order);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("orders")
          .update({ payment_status: "PAID", paid_at: paidAt })
          .eq("id", orderId);
      } catch {
        // ignore
      }
    }

    return { ok: true as const, status: "PAID", paid_at: paidAt };
  },
);

/**
 * Webhook callback handler from Tokopay.id
 */
export const handleTokopayCallback = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      merchant_id?: string;
      ref_id?: string;
      status?: string;
      signature?: string;
      nominal?: number;
      total_bayar?: number;
    };
  }) => {
    const refId = data?.ref_id || "";
    const rawStatus = String(data?.status || "").toUpperCase();

    if (!refId) throw new Error("ref_id kosong");

    const isPaid =
      rawStatus === "SUCCESS" ||
      rawStatus === "PAID" ||
      rawStatus === "DIBAYAR" ||
      rawStatus === "TERBAYAR" ||
      rawStatus === "1";

    if (isPaid) {
      const paidAt = new Date().toISOString();
      const order = memoryOrders.get(refId);
      if (order) {
        order.payment_status = "PAID";
        order.paid_at = paidAt;
        memoryOrders.set(refId, order);
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from("orders")
            .update({ payment_status: "PAID", paid_at: paidAt })
            .eq("id", refId);
        } catch {
          // ignore
        }
      }
    }

    return { status: "OK" };
  },
);
