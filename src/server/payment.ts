import { createServerFn } from "@tanstack/react-start";
import { getSupabaseClient, type OrderRecord } from "@/lib/supabase";
import crypto from "node:crypto";

// Memory storage fallback for local dev / testing
const memoryOrders = new Map<string, OrderRecord>();

function getEnv(key: string): string {
  return (process.env[key] || "").trim();
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

    const merchantCode = getEnv("TRIPAY_MERCHANT_CODE") || "T35186";
    const apiKey = getEnv("TRIPAY_API_KEY") || "DEV-crOyCsZR5BBHhFld4c5QQMCynd07ylKncmyMZi3d";
    const privateKey = getEnv("TRIPAY_PRIVATE_KEY") || "IDjFa-tQj1V-mLm1r-tqiju-WIJI0";

    const isSandbox = apiKey.startsWith("DEV-");
    const baseUrl = isSandbox ? "https://tripay.co.id/api-sandbox" : "https://tripay.co.id/api";

    let qrisUrl = "";
    let qrisString = "";
    let checkoutUrl = "";
    let tripayReference = "";
    let isTestMode = false;

    if (merchantCode && apiKey && privateKey) {
      const signature = crypto
        .createHmac("sha256", privateKey)
        .update(merchantCode + orderId + String(totalAmount))
        .digest("hex");

      const payload = {
        method: "QRIS",
        merchant_ref: orderId,
        amount: totalAmount,
        customer_name: customerName,
        customer_email: "customer@buanacomputer.web.id",
        customer_phone: customerPhone,
        order_items: items.map((it) => ({
          sku: it.id,
          name: (it.variant ? `${it.name} (${it.variant})` : it.name).slice(0, 50),
          price: it.price,
          quantity: it.qty,
          image_url: it.image || undefined,
        })),
        callback_url: "https://buanacomputer.web.id/api/webhook/tripay",
        return_url: `https://buanacomputer.web.id/order/${orderId}`,
        expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        signature,
      };

      try {
        const res = await fetch(`${baseUrl}/transaction/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const json = (await res.json()) as {
          success?: boolean;
          message?: string;
          data?: {
            reference?: string;
            qr_url?: string;
            qr_string?: string;
            checkout_url?: string;
            status?: string;
          };
        };

        if (json.success && json.data) {
          tripayReference = json.data.reference || "";
          qrisUrl = json.data.qr_url || "";
          qrisString = json.data.qr_string || "";
          checkoutUrl = json.data.checkout_url || "";
        } else {
          console.warn("Tripay create order API notice:", json.message);
          isTestMode = true;
        }
      } catch (e) {
        console.error("Tripay API request failed, falling back to local simulator:", e);
        isTestMode = true;
      }
    } else {
      isTestMode = true;
    }

    if (!qrisUrl) {
      const dummyQrPayload = `00020101021126580016ID.CO.TRIPAY.WWW01189360099900000000005204581253033605802ID5914BUANA COMPUTER6006BANTUL61055519662${orderId}540${totalAmount}6304`;
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
      payment_gateway: "tripay",
      payment_channel: "qris",
      payment_status: "PENDING",
      payment_url: qrisUrl,
      qris_string: qrisString,
      checkout_url: checkoutUrl,
      tripay_reference: tripayReference,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase (if connected)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("orders").insert([newOrder]);
        if (error && error.code === "PGRST204") {
          // Fallback if extra columns not in schema cache
          await supabase.from("orders").insert([
            {
              id: newOrder.id,
              customer_name: newOrder.customer_name,
              customer_phone: newOrder.customer_phone,
              customer_address: newOrder.customer_address,
              items: newOrder.items,
              total_amount: newOrder.total_amount,
              payment_gateway: newOrder.payment_gateway,
              payment_channel: newOrder.payment_channel,
              payment_status: newOrder.payment_status,
              payment_url: newOrder.payment_url,
              qris_string: newOrder.qris_string,
              tokopay_trx_id: newOrder.tripay_reference,
              created_at: newOrder.created_at,
            },
          ]);
        }
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

    // If still PENDING, check status from Tripay API
    if (order.payment_status === "PENDING") {
      const apiKey = getEnv("TRIPAY_API_KEY") || "DEV-crOyCsZR5BBHhFld4c5QQMCynd07ylKncmyMZi3d";
      const isSandbox = apiKey.startsWith("DEV-");
      const baseUrl = isSandbox ? "https://tripay.co.id/api-sandbox" : "https://tripay.co.id/api";

      const refParam = order.tripay_reference
        ? `reference=${encodeURIComponent(order.tripay_reference)}`
        : `merchant_ref=${encodeURIComponent(order.id)}`;

      try {
        const res = await fetch(`${baseUrl}/transaction/detail?${refParam}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        const json = (await res.json()) as {
          success?: boolean;
          data?: {
            status?: string;
            paid_at?: number | string;
          };
        };

        const status = String(json?.data?.status || "").toUpperCase();
        if (status === "PAID" || status === "SUCCESS" || status === "SETTLED") {
          const paidAt = json.data?.paid_at
            ? typeof json.data.paid_at === "number"
              ? new Date(json.data.paid_at * 1000).toISOString()
              : String(json.data.paid_at)
            : new Date().toISOString();

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
        console.warn("Tripay detail check error:", e);
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
