import { createServerFn } from "@tanstack/react-start";
import { tripayFetch } from "./egress";
import { toDynamicQris } from "./qris";
import { getSupabaseClient, type OrderRecord } from "@/lib/supabase";
import { PaymentSettingsDataSchema } from "@/lib/schemas";
import paymentSettingsData from "@/data/paymentSettings.json";
import crypto from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

/* ---------------- konfigurasi pembayaran toko ---------------- */

export type PaymentMethodSetting = { id: string; label: string; enabled: boolean };

export type ShippingSetting = { javaFee: number; outsideJavaFee: number };

export type PaymentSettings = {
  activeGateway: "tripay" | "tokopay" | "manual";
  mode: "sandbox" | "live";
  methods: PaymentMethodSetting[];
  staticQrisUrl: string;
  shipping: ShippingSetting;
};

export type PaymentSecrets = {
  tripay: { merchantCode: string; apiKey: string; privateKey: string };
  tokopay: { merchantId: string; secretKey: string };
};

const defaultSettings = (): PaymentSettings => ({
  activeGateway: "tripay",
  mode: "sandbox",
  methods: [
    { id: "qris", label: "QRIS — semua bank & e-wallet", enabled: true },
    { id: "cod", label: "COD / Bayar langsung di toko", enabled: true },
    { id: "manual_wa", label: "Transfer manual via WhatsApp", enabled: true },
  ],
  staticQrisUrl: "",
  shipping: { javaFee: 25000, outsideJavaFee: 40000 },
});

function secretsPath(): string {
  return join(process.cwd(), "src", "data", "paymentSecrets.json");
}

export function loadPaymentSettings(): PaymentSettings {
  // Static import = terbundle saat build → aman di production Vercel
  // (baca fs runtime tidak tersedia di serverless). Perubahan pengaturan
  // berlaku setelah Terbitkan (redeploy), sama seperti katalog produk.
  try {
    const parsed = PaymentSettingsDataSchema.parse(paymentSettingsData);
    const base = defaultSettings();
    return {
      activeGateway: parsed.activeGateway,
      mode: parsed.mode,
      methods: parsed.methods,
      staticQrisUrl: parsed.staticQrisUrl,
      shipping: (parsed as { shipping?: ShippingSetting }).shipping ?? base.shipping,
    };
  } catch {
    return defaultSettings();
  }
}

export function loadPaymentSecrets(): PaymentSecrets {
  const fromFile = (): Partial<PaymentSecrets> => {
    try {
      if (!existsSync(secretsPath())) return {};
      return JSON.parse(readFileSync(secretsPath(), "utf-8")) as Partial<PaymentSecrets>;
    } catch {
      return {};
    }
  };
  const f = fromFile();
  return {
    tripay: {
      merchantCode: f.tripay?.merchantCode || getEnv("TRIPAY_MERCHANT_CODE"),
      apiKey: f.tripay?.apiKey || getEnv("TRIPAY_API_KEY"),
      privateKey: f.tripay?.privateKey || getEnv("TRIPAY_PRIVATE_KEY"),
    },
    tokopay: {
      merchantId: f.tokopay?.merchantId || getEnv("TOKOPAY_MERCHANT_ID"),
      secretKey: f.tokopay?.secretKey || getEnv("TOKOPAY_SECRET_KEY"),
    },
  };
}

export function isMethodEnabled(settings: PaymentSettings, id: string): boolean {
  return settings.methods.some((m) => m.id === id && m.enabled);
}

/** String QRIS statis milik toko (stiker), dari env server — tidak ikut ke git. */
function merchantQrisPayload(): string {
  return (process.env.QRIS_STATIC_PAYLOAD || "").trim();
}

/**
 * QRIS Toko: statis milik toko → dinamis per nominal order + render gambar QR.
 * Tanpa gateway: status order PENDING sampai admin verifikasi mutasi manual.
 */
async function createMerchantQris(
  orderId: string,
  totalAmount: number,
): Promise<{ payload: string; dataUrl: string }> {
  const staticPayload = merchantQrisPayload();
  if (!staticPayload) {
    throw new Error("QRIS toko belum diset. Tambahkan QRIS_STATIC_PAYLOAD di env server.");
  }
  const { payload } = toDynamicQris(staticPayload, totalAmount, orderId);
  const { default: QRCode } = await import("qrcode");
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  return { payload, dataUrl };
}

/** Konfigurasi publik untuk UI checkout (tanpa secret!). */
export const getPublicPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  const s = loadPaymentSettings();
  return {
    activeGateway: s.activeGateway,
    mode: s.mode,
    methods: s.methods,
    staticQrisUrl: s.staticQrisUrl,
    shipping: s.shipping,
  };
});

/* ---------------- ongkir: Gemini text classifier zona ---------------- */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function googleApiKey(): string {
  const direct = getEnv("GOOGLE_API_KEY") || getEnv("GEMINI_API_KEY");
  if (direct) return direct;
  // Fallback: file .env-apikey* (pola yang sama dengan src/server/admin.ts)
  try {
    const files = readdirSync(process.cwd()).filter((f: string) => f.startsWith(".env-apikey"));
    for (const f of files) {
      const txt = readFileSync(join(process.cwd(), f), "utf-8").trim();
      const firstLine = txt.split(/\r?\n/)[0]?.trim() || "";
      const m =
        /AIza[0-9A-Za-z_-]{20,}/.exec(txt) ||
        /AQ\.[0-9A-Za-z_-]{20,}/.exec(txt) ||
        /AIza[0-9A-Za-z_-]{20,}/.exec(firstLine);
      if (m) return m[0];
      if (
        firstLine &&
        !firstLine.startsWith("curl") &&
        !firstLine.startsWith("#") &&
        firstLine.length > 20
      ) {
        return firstLine;
      }
    }
  } catch {
    // ignore
  }
  throw new Error("GOOGLE_API_KEY belum diset.");
}

/** Heuristik geografis Pulau Jawa (fallback bila AI tidak menjawab). */
function heuristicZone(lat?: number, lng?: number): "JAWA" | "LUAR_JAWA" | null {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return lat >= -8.8 && lat <= -5.7 && lng >= 105.1 && lng <= 114.6 ? "JAWA" : "LUAR_JAWA";
}

export type ShippingQuote = {
  zone: "JAWA" | "LUAR_JAWA";
  province: string;
  city: string;
  fee: number;
  source: "gemini" | "heuristic";
};

async function classifyZoneWithGemini(
  addressText: string,
  lat?: number,
  lng?: number,
): Promise<{ zone: "JAWA" | "LUAR_JAWA"; province: string; city: string } | null> {
  const key = googleApiKey();
  const prompt =
    `Kamu adalah penentu zona ongkir toko online. Toko berada di Banguntapan, Bantul, DI Yogyakarta, Indonesia. ` +
    `Tentukan apakah alamat pembeli berikut berada di Pulau Jawa atau di luar Pulau Jawa. ` +
    `Jawab HANYA dengan JSON valid tanpa teks lain: {"zone":"JAWA"|"LUAR_JAWA","province":"...","city":"..."}. ` +
    `Alamat: ${addressText}` +
    (typeof lat === "number" && typeof lng === "number" ? ` Koordinat GPS: ${lat}, ${lng}.` : "");
  // Model teks yang terverifikasi live (Sep 2026) untuk key ini
  const models = ["gemini-3.6-flash", "gemini-flash-lite-latest", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const res = await fetch(
        `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
          }),
        },
      );
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";
      const m = /\{[^{}]*"zone"[^{}]*\}/.exec(text);
      if (!m) continue;
      const parsed = JSON.parse(m[0]) as { zone?: string; province?: string; city?: string };
      if (parsed.zone === "JAWA" || parsed.zone === "LUAR_JAWA") {
        return {
          zone: parsed.zone,
          province: String(parsed.province || ""),
          city: String(parsed.city || ""),
        };
      }
    } catch {
      // coba model berikutnya
    }
  }
  return null;
}

/**
 * Hitung ongkir flat berdasarkan alamat/GPS pembeli.
 * Publik (tanpa auth) karena dipakai alur checkout — input dibatasi teks pendek.
 */
export const getShippingQuote = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: { addressText?: string; lat?: number; lng?: number };
  }): Promise<ShippingQuote> => {
    const addressText = String(data?.addressText ?? "")
      .trim()
      .slice(0, 300);
    const lat = typeof data?.lat === "number" ? data.lat : undefined;
    const lng = typeof data?.lng === "number" ? data.lng : undefined;
    if (!addressText && (lat === undefined || lng === undefined)) {
      throw new Error("Isi alamat tujuan atau gunakan tombol lokasi GPS.");
    }

    const settings = loadPaymentSettings();
    let zone: "JAWA" | "LUAR_JAWA" | null = null;
    let province = "";
    let city = "";
    let source: ShippingQuote["source"] = "heuristic";

    try {
      const ai = await classifyZoneWithGemini(addressText || `${lat},${lng}`, lat, lng);
      if (ai) {
        zone = ai.zone;
        province = ai.province;
        city = ai.city;
        source = "gemini";
      }
    } catch {
      // fallback ke heuristik di bawah
    }
    if (!zone) {
      const h = heuristicZone(lat, lng);
      // Tanpa koordinat & AI gagal → asumsikan Jawa (mayoritas pembeli) agar checkout tidak buntu
      zone = h ?? "JAWA";
    }

    return {
      zone,
      province,
      city,
      fee: zone === "JAWA" ? settings.shipping.javaFee : settings.shipping.outsideJavaFee,
      source,
    };
  },
);

/* ---------------- pembuatan order ---------------- */

const TRIPAY_CHANNEL: Record<string, string> = {
  qris: "QRIS",
  va_bca: "BCAVA",
  va_bri: "BRIVA",
  va_mandiri: "MANDIRIVA",
  va_bni: "BNIVA",
  retail_alfamart: "ALFAMART",
  retail_indomaret: "INDOMARET",
};

/**
 * Batas nominal & kedaluwarsa per channel sesuai tabel resmi Tripay
 * (https://tripay.co.id/developer — Daftar Channel & Biaya).
 */
const TRIPAY_LIMITS: Record<string, { min: number; max: number; expiredSecs: number }> = {
  qris: { min: 1000, max: 5000000, expiredSecs: 60 * 60 },
  va_bca: { min: 10000, max: 10000000, expiredSecs: 24 * 60 * 60 },
  va_bri: { min: 10000, max: 10000000, expiredSecs: 24 * 60 * 60 },
  va_mandiri: { min: 10000, max: 10000000, expiredSecs: 24 * 60 * 60 },
  va_bni: { min: 10000, max: 10000000, expiredSecs: 24 * 60 * 60 },
  retail_alfamart: { min: 10000, max: 2500000, expiredSecs: 24 * 60 * 60 },
  retail_indomaret: { min: 10000, max: 2500000, expiredSecs: 24 * 60 * 60 },
};

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
  method?: string; // qris | va_* | retail_* | cod
  shippingZone?: "JAWA" | "LUAR_JAWA" | "PICKUP";
};

type TripayCreateResponse = {
  success?: boolean;
  message?: string;
  data?: {
    reference?: string;
    qr_url?: string;
    qr_string?: string;
    checkout_url?: string;
    pay_code?: string;
    nomor_va?: string;
    status?: string;
  };
};

async function createTripayOrder(
  method: string,
  orderId: string,
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  items: CreateOrderInput["items"],
): Promise<{
  payUrl: string;
  payString: string;
  checkoutUrl: string;
  reference: string;
  payCode: string;
}> {
  const secrets = loadPaymentSecrets();
  const settings = loadPaymentSettings();
  const { merchantCode, apiKey, privateKey } = secrets.tripay;
  if (!merchantCode || !apiKey || !privateKey) {
    throw new Error("Kredensial Tripay belum diisi. Atur di dashboard /admin/payment.");
  }

  const useSandbox = settings.mode === "sandbox" || apiKey.startsWith("DEV-");
  const baseUrl = useSandbox ? "https://tripay.co.id/api-sandbox" : "https://tripay.co.id/api";
  const channel = TRIPAY_CHANNEL[method] || "QRIS";

  const limits = TRIPAY_LIMITS[method] ?? TRIPAY_LIMITS.qris;
  if (totalAmount < limits.min || totalAmount > limits.max) {
    const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;
    throw new Error(
      `Nominal ${fmt(totalAmount)} di luar batas channel ini (${fmt(limits.min)}–${fmt(limits.max)}). Bagi transaksi atau checkout via WhatsApp / marketplace.`,
    );
  }

  const signature = crypto
    .createHmac("sha256", privateKey)
    .update(merchantCode + orderId + String(totalAmount))
    .digest("hex");

  const payload = {
    method: channel,
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
    expired_time: Math.floor(Date.now() / 1000) + limits.expiredSecs,
    signature,
  };

  const res = await tripayFetch(`${baseUrl}/transaction/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as TripayCreateResponse;
  if (!json.success || !json.data) {
    throw new Error(`Tripay: ${json.message || `HTTP ${res.status}`}`);
  }
  return {
    payUrl: json.data.qr_url || "",
    payString: json.data.qr_string || "",
    checkoutUrl: json.data.checkout_url || "",
    reference: json.data.reference || "",
    payCode: json.data.pay_code || json.data.nomor_va || "",
  };
}

async function createTokopayQris(
  orderId: string,
  totalAmount: number,
  customerName: string,
  customerPhone: string,
): Promise<{ payUrl: string; payString: string; reference: string }> {
  const secrets = loadPaymentSecrets();
  const { merchantId, secretKey } = secrets.tokopay;
  if (!merchantId || !secretKey) {
    throw new Error("Kredensial Tokopay belum diisi. Atur di dashboard /admin/payment.");
  }
  const url =
    `https://api.tokopay.id/v1/order?merchant=${encodeURIComponent(merchantId)}` +
    `&secret=${encodeURIComponent(secretKey)}&ref_id=${encodeURIComponent(orderId)}` +
    `&nominal=${totalAmount}&metode=QRIS` +
    `&customer_name=${encodeURIComponent(customerName)}` +
    `&customer_phone=${encodeURIComponent(customerPhone)}`;
  const res = await fetch(url);
  const json = (await res.json()) as {
    status?: boolean | string | number;
    message?: string;
    error_msg?: string;
    data?: { trx_id?: string; qr_link?: string; qr_string?: string; pay_url?: string };
  };
  if (!json.data || !(json.status === "Success" || json.status === 1 || json.status === true)) {
    throw new Error(`Tokopay: ${json.error_msg || json.message || `HTTP ${res.status}`}`);
  }
  return {
    payUrl: json.data.qr_link || json.data.pay_url || "",
    payString: json.data.qr_string || "",
    reference: json.data.trx_id || "",
  };
}

export const createOrderQris = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: CreateOrderInput }) => {
    const customerName = (data?.customerName ?? "").trim();
    const customerPhone = (data?.customerPhone ?? "").trim();
    const customerAddress = (data?.customerAddress ?? "").trim();
    const items = Array.isArray(data?.items) ? data.items : [];
    const method = (data?.method ?? "qris").trim() || "qris";

    if (!customerName) throw new Error("Nama pemesan wajib diisi.");
    if (!customerPhone || customerPhone.length < 8) {
      throw new Error("Nomor WhatsApp pemesan wajib valid.");
    }
    if (items.length === 0) throw new Error("Keranjang belanja kosong.");

    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (itemsTotal <= 0) throw new Error("Total pembayaran tidak valid.");

    const settings = loadPaymentSettings();
    if (!isMethodEnabled(settings, method)) {
      throw new Error("Metode pembayaran ini sedang nonaktif di toko.");
    }

    // Ongkir dihitung server dari zona (anti-utak-atik dari client)
    const zone = data?.shippingZone;
    let shippingFee = 0;
    let shippingZone: "JAWA" | "LUAR_JAWA" | "PICKUP" = "PICKUP";
    if (method === "cod") {
      shippingFee = 0;
      shippingZone = "PICKUP";
    } else {
      if (zone !== "JAWA" && zone !== "LUAR_JAWA") {
        throw new Error("Hitung ongkir dulu (isi alamat / gunakan GPS) sebelum bayar.");
      }
      shippingZone = zone;
      shippingFee = zone === "JAWA" ? settings.shipping.javaFee : settings.shipping.outsideJavaFee;
    }
    const totalAmount = itemsTotal + shippingFee;

    const orderId = generateInvoiceId();
    const channel =
      method === "qris"
        ? "qris"
        : method === "cod"
          ? "cash_cod"
          : (method as OrderRecord["payment_channel"]);

    let payUrl = "";
    let payString = "";
    let checkoutUrl = "";
    let gatewayRef = "";
    let payCode = "";
    let gateway: OrderRecord["payment_gateway"] = "tripay";
    let isTestMode = false;

    if (method === "qris_toko") {
      // QRIS statis milik toko → dinamis per nominal. Tanpa gateway,
      // tanpa cek activeGateway — selalu tersedia bila di-enable & env diset.
      gateway = "manual";
      const qr = await createMerchantQris(orderId, totalAmount);
      payUrl = qr.dataUrl;
      payString = qr.payload;
      gatewayRef = orderId;
    } else if (method === "cod") {
      // Bayar di toko — tanpa memanggil gateway sama sekali
      gateway = settings.activeGateway === "manual" ? "manual_wa" : settings.activeGateway;
    } else if (settings.activeGateway === "manual") {
      throw new Error("Pembayaran otomatis nonaktif. Silakan checkout via WhatsApp.");
    } else if (settings.activeGateway === "tokopay") {
      if (method !== "qris") throw new Error("Via Tokopay hanya tersedia QRIS.");
      gateway = "tokopay";
      try {
        const r = await createTokopayQris(orderId, totalAmount, customerName, customerPhone);
        payUrl = r.payUrl;
        payString = r.payString;
        gatewayRef = r.reference;
      } catch (e) {
        console.warn("Tokopay order gagal:", e);
        isTestMode = true;
      }
    } else {
      // Tripay (QRIS & Virtual Account)
      try {
        const r = await createTripayOrder(
          method,
          orderId,
          totalAmount,
          customerName,
          customerPhone,
          items,
        );
        payUrl = r.payUrl;
        payString = r.payString;
        checkoutUrl = r.checkoutUrl;
        gatewayRef = r.reference;
        payCode = r.payCode;
      } catch (e) {
        console.warn("Tripay order gagal, fallback simulator:", e);
        isTestMode = true;
      }
    }

    if (!isTestMode && method !== "cod" && !payUrl && !payCode) {
      isTestMode = true;
    }
    if (isTestMode && method === "qris") {
      const dummyQrPayload = `00020101021126580016ID.CO.BUANA.WWW01189360099900000000005204581253033605802ID5914BUANA COMPUTER6006BANTUL61055519662${orderId}540${totalAmount}6304`;
      payString = dummyQrPayload;
      payUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=12&data=${encodeURIComponent(
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
      shipping_zone: shippingZone,
      shipping_fee: shippingFee,
      payment_gateway: gateway,
      payment_channel: channel,
      payment_status: "PENDING",
      payment_url: payUrl,
      qris_string: payString,
      checkout_url: checkoutUrl,
      tripay_reference: gatewayRef,
      pay_code: payCode,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase (if connected)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("orders").insert([newOrder]);
        if (error && error.code === "PGRST204") {
          // Skema lama (tanpa kolom baru) — simpan versi minimal
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
      method,
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
    if (order.payment_status === "PENDING" && order.payment_gateway === "tripay") {
      const secrets = loadPaymentSecrets();
      const apiKey = secrets.tripay.apiKey;
      if (apiKey) {
        const settings = loadPaymentSettings();
        const useSandbox = settings.mode === "sandbox" || apiKey.startsWith("DEV-");
        const baseUrl = useSandbox
          ? "https://tripay.co.id/api-sandbox"
          : "https://tripay.co.id/api";
        const refParam = order.tripay_reference
          ? `reference=${encodeURIComponent(order.tripay_reference)}`
          : `merchant_ref=${encodeURIComponent(order.id)}`;

        try {
          const res = await tripayFetch(`${baseUrl}/transaction/detail?${refParam}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          const json = (await res.json()) as {
            success?: boolean;
            data?: { status?: string; paid_at?: number | string };
          };

          const status = String(json?.data?.status || "").toUpperCase();
          if (status === "REFUND") {
            // Dana dikembalikan Tripay ke pembeli → catat refund
            order.payment_status = "REFUNDED";
            order.refunded_at = new Date().toISOString();
            memoryOrders.set(orderId, order);
            const supabase2 = getSupabaseClient();
            if (supabase2) {
              try {
                await supabase2
                  .from("orders")
                  .update({ payment_status: "REFUNDED", refunded_at: order.refunded_at })
                  .eq("id", orderId);
              } catch {
                // ignore
              }
            }
          } else if (status === "PAID" || status === "SUCCESS" || status === "SETTLED") {
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
