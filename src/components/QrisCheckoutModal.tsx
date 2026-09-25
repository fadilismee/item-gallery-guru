import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  Smartphone,
  Store,
  Truck,
  X,
} from "lucide-react";
import {
  cancelPendingOrder,
  checkOrderStatus,
  createOrderQris,
  getShippingQuote,
  simulateOrderPayment,
  type ShippingQuote,
} from "@/server/payment";
import type { ManualAccount, PublicPayMethod } from "@/hooks/use-payment-config";
import type { OrderRecord } from "@/lib/supabase";

export type CartItemForCheckout = {
  id: string;
  name: string;
  variant?: string;
  price: number;
  qty: number;
  image?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: CartItemForCheckout[];
  payMethods?: PublicPayMethod[];
  gateway?: "tripay" | "tokopay" | "manual";
  manualAccounts?: ManualAccount[];
  onSuccess?: (order: OrderRecord) => void;
};

const FALLBACK_METHODS: PublicPayMethod[] = [
  { id: "qris", label: "QRIS — semua bank & e-wallet", enabled: true },
  { id: "qris_toko", label: "QRIS Toko — scan langsung", enabled: true },
  { id: "cod", label: "COD / Bayar langsung di toko", enabled: true },
];

/** Metode transfer manual (norek + QRIS toko) — isinya ditentukan admin. */
const MANUAL_IDS = ["qris_toko", "dana", "gopay", "seabank", "bca"];

function methodIcon(id: string) {
  if (id === "qris" || id === "qris_toko") return <QrCode size={16} />;
  if (id === "cod") return <Store size={16} />;
  if (id === "dana" || id === "gopay") return <Smartphone size={16} />;
  if (id === "seabank" || id === "bca") return <Landmark size={16} />;
  return <Banknote size={16} />;
}

function shortMethodLabel(id: string, label: string) {
  if (id === "qris") return "QRIS";
  if (id === "qris_toko") return "QRIS Toko";
  if (id === "cod") return "COD";
  return label.replace(" Virtual Account", "");
}

export function QrisCheckoutModal({
  open,
  onClose,
  items,
  payMethods,
  gateway = "tripay",
  manualAccounts = [],
  onSuccess,
}: Props) {
  const methods =
    payMethods && payMethods.length > 0
      ? payMethods.filter((m) => m.id !== "manual_wa")
      : FALLBACK_METHODS;
  // Langkah: form (data + COD/delivery) → choose (pilih bayar) → pay/paid/cod.
  const [step, setStep] = useState<"form" | "choose" | "pay" | "paid" | "cod">("form");
  const [fulfill, setFulfill] = useState<"delivery" | "cod">("delivery");
  const [payMethod, setPayMethod] = useState("qris");
  const [methodLabel, setMethodLabel] = useState("QRIS");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins countdown
  const [copied, setCopied] = useState("");
  const [checking, setChecking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = fulfill === "cod" ? 0 : (quote?.fee ?? 0);
  const totalAmount = itemsTotal + shippingFee;

  const formatPrice = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  // Opsi bayar sesuai gateway pilihan admin: PG → opsi gateway, manual → norek + QRIS toko.
  const isManualGateway = gateway === "manual";
  const pgMethods = methods.filter(
    (m) => m.enabled && m.id !== "cod" && !MANUAL_IDS.includes(m.id),
  );
  const manualMethods = methods.filter((m) => m.enabled && MANUAL_IDS.includes(m.id));
  const chooseOptions = isManualGateway ? manualMethods : pgMethods;

  const accountFor = (id: string) => manualAccounts.find((a) => a.id === id);
  const transferAccount =
    MANUAL_IDS.includes(payMethod) && payMethod !== "qris_toko" ? accountFor(payMethod) : undefined;

  // Reset when opening
  useEffect(() => {
    if (open) {
      setFulfill("delivery");
      setPayMethod("qris");
      setMethodLabel("QRIS");
      setStep("form");
      setError("");
      setOrder(null);
      setTimeLeft(15 * 60);
      setQuote(null);
      setCoords(null);
    }
  }, [open]);

  const fetchQuote = async (addr: string, c: { lat: number; lng: number } | null) => {
    setQuoteBusy(true);
    setError("");
    try {
      const q = await getShippingQuote({
        data: { addressText: addr, lat: c?.lat, lng: c?.lng },
      });
      setQuote(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghitung ongkir.");
    } finally {
      setQuoteBusy(false);
    }
  };

  const handleUseGps = () => {
    if (!("geolocation" in navigator)) {
      setError("Browser ini tidak mendukung GPS. Isi alamat manual lalu hitung ongkir.");
      return;
    }
    setGpsBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setGpsBusy(false);
        void fetchQuote(address, c);
      },
      () => {
        setGpsBusy(false);
        setError("Izin lokasi ditolak. Isi alamat manual lalu hitung ongkir.");
      },
      { enableHighAccuracy: false, timeout: 15000 },
    );
  };

  // Countdown timer
  useEffect(() => {
    if (step !== "pay" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  if (!open) return null;

  const isVa = payMethod.startsWith("va_");
  const isTransfer = transferAccount !== undefined;

  const doCreateOrder = async (method: string, zone: "JAWA" | "LUAR_JAWA" | "PICKUP") => {
    const res = await createOrderQris({
      data: {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items,
        method,
        shippingZone: zone,
      },
    });
    if (!res?.order) throw new Error("Gagal memproses pesanan.");
    return res.order;
  };

  /** Form: data + COD/delivery → COD langsung jadi, delivery lanjut pilih bayar. */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (fulfill === "cod") {
      setBusy(true);
      try {
        const created = await doCreateOrder("cod", "PICKUP");
        setOrder(created);
        setMethodLabel("COD");
        setStep("cod");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memproses pesanan.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!quote) {
      setError("Hitung ongkir dulu (isi alamat / gunakan GPS) sebelum lanjut.");
      return;
    }
    setStep("choose");
  };

  /** Pilih opsi bayar → buat order → tampil detail bayar. */
  const handleChoose = async (methodId: string) => {
    setError("");
    setBusy(true);
    try {
      // Ganti metode: batalkan order PENDING sebelumnya biar tidak jadi sampah.
      if (order && order.payment_status === "PENDING") {
        try {
          await cancelPendingOrder({ data: { orderId: order.id, phone } });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          if (/LUNAS|diproses/i.test(msg)) {
            setError("Pesanan sebelumnya sudah diproses — tidak bisa ganti metode.");
            setBusy(false);
            return;
          }
          // Gagal batal (mis. sudah lewat 30 mnt) — lanjut, admin bisa bersihkan.
        }
      }
      const created = await doCreateOrder(methodId, quote?.zone ?? "JAWA");
      setOrder(created);
      setPayMethod(methodId);
      const label =
        methods.find((m) => m.id === methodId)?.label ?? shortMethodLabel(methodId, methodId);
      setMethodLabel(label);
      setTimeLeft(15 * 60);
      setStep("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pesanan.");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!order) return;
    setChecking(true);
    setError("");
    try {
      const res = await checkOrderStatus({ data: { orderId: order.id } });
      if (res.order.payment_status === "PAID") {
        setOrder(res.order);
        setStep("paid");
        if (onSuccess) onSuccess(res.order);
      } else if (res.order.payment_gateway === "manual") {
        setError(
          "Pesanan tercatat. Setelah bayar, kirim bukti via WhatsApp di bawah — admin akan verifikasi & menandai lunas.",
        );
      } else {
        setError(
          "Pembayaran belum terdeteksi. Silakan selesaikan pembayaran di aplikasi m-banking / e-wallet Anda.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memeriksa status.");
    } finally {
      setChecking(false);
    }
  };

  const handleSimulatePaid = async () => {
    if (!order) return;
    setChecking(true);
    try {
      await simulateOrderPayment({ data: { orderId: order.id } });
      setOrder({ ...order, payment_status: "PAID", paid_at: new Date().toISOString() });
      setStep("paid");
      if (onSuccess) onSuccess({ ...order, payment_status: "PAID" });
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const waConfirmHref = order
    ? `https://wa.me/6285979220599?text=${encodeURIComponent(
        fulfill === "cod" && payMethod === "cod"
          ? `Halo Buana Computer, saya membuat pesanan COD (bayar di toko) dengan Order ID: ${order.id} sebesar ${formatPrice(
              order.total_amount,
            )}. Atas nama ${order.customer_name}. Kapan bisa diambil ke toko? Terima kasih!`
          : `Halo Buana Computer, saya sudah menyelesaikan pembayaran via ${methodLabel} untuk Order ID: ${order.id} sebesar ${formatPrice(
              order.total_amount,
            )}. Atas nama ${order.customer_name}. Mohon diproses, terima kasih!`,
      )}`
    : "#";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* STEP 1: DATA PEMESAN + COD / DELIVERY */}
        {step === "form" && (
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Data Pesanan Toko
                </h2>
                <p className="text-xs text-muted-foreground">
                  Isi data dulu, pilih COD atau kirim, baru bayar
                </p>
              </div>
            </div>

            {/* COD atau Delivery */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-foreground">Mau COD / dikirim?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfill("delivery")}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    fulfill === "delivery"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <Truck size={16} />
                  Delivery (dikirim)
                </button>
                <button
                  type="button"
                  onClick={() => setFulfill("cod")}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    fulfill === "cod"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <Store size={16} />
                  COD (ambil di toko)
                </button>
              </div>
            </div>

            {/* Rincian Produk */}
            <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs">
              <p className="font-bold text-foreground mb-2">Ringkasan Pesanan:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div key={`${it.id}-${idx}`} className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      <p className="font-semibold text-foreground truncate">{it.name}</p>
                      {it.variant && (
                        <p className="text-[10px] text-muted-foreground">Varian: {it.variant}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-foreground">
                      {it.qty}x {formatPrice(it.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-2 flex items-center justify-between text-sm font-bold text-foreground">
                <span>Total Tagihan:</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Nama Lengkap Pemesan <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Nomor WhatsApp Aktif <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Digunakan untuk konfirmasi resi pengiriman dan status garansi toko.
                </p>
              </div>

              {fulfill === "delivery" && (
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Alamat Pengiriman <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat lengkap, kecamatan, kota/kabupaten..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setQuote(null);
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleUseGps}
                      disabled={gpsBusy || quoteBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <Navigation size={13} className="text-pri" />
                      {gpsBusy ? "Membaca GPS…" : coords ? "GPS Terkunci ✓" : "Gunakan Lokasi Saya"}
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchQuote(address, coords)}
                      disabled={quoteBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {quoteBusy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Truck size={13} />
                      )}
                      {quoteBusy ? "Menghitung…" : "Hitung Ongkir"}
                    </button>
                  </div>
                  {quote && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs">
                      <MapPin size={16} className="shrink-0 text-emerald-600" />
                      <p className="text-emerald-900">
                        <strong>{quote.zone === "JAWA" ? "Pulau Jawa" : "Luar Pulau Jawa"}</strong>
                        {quote.city || quote.province
                          ? ` (${[quote.city, quote.province].filter(Boolean).join(", ")})`
                          : ""}{" "}
                        — Ongkir <strong>{formatPrice(quote.fee)}</strong>
                        <span className="font-mono text-[10px] text-emerald-600">
                          {" "}
                          • via {quote.source === "gemini" ? "AI" : "peta"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rincian total */}
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal barang</span>
                  <span className="font-mono">{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ongkir {quote && fulfill === "delivery" ? `(${quote.zone})` : ""}</span>
                  <span className="font-mono">
                    {fulfill === "cod" ? "Bayar di toko" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span className="font-mono text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy
                    ? "Memproses..."
                    : fulfill === "cod"
                      ? `Buat Pesanan COD (${formatPrice(totalAmount)}) →`
                      : `Lanjut ke Pembayaran (${formatPrice(totalAmount)}) →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PILIH CARA BAYAR (ditentukan gateway pilihan admin) */}
        {step === "choose" && (
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                }}
                className="rounded-full bg-muted p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                aria-label="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Pilih Cara Bayar</h2>
                <p className="text-xs text-muted-foreground">
                  {isManualGateway
                    ? "Transfer ke rekening / QRIS toko di bawah"
                    : `Otomatis via ${gateway === "tokopay" ? "Tokopay" : "Tripay"}`}{" "}
                  • Total {formatPrice(totalAmount)}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {chooseOptions.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Belum ada metode bayar aktif. Hubungi toko via WhatsApp untuk pesan manual.
                </p>
              )}
              {chooseOptions.map((m) => {
                const acc =
                  MANUAL_IDS.includes(m.id) && m.id !== "qris_toko" ? accountFor(m.id) : undefined;
                const noNumber = acc && !acc.number.trim();
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={busy || !!noNumber}
                    onClick={() => handleChoose(m.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-sm disabled:opacity-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {methodIcon(m.id)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-foreground">
                        {shortMethodLabel(m.id, m.label)}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                        {m.id === "qris_toko"
                          ? "QR dinamis — nominal terkunci pas"
                          : acc
                            ? noNumber
                              ? "Nomor belum diisi admin"
                              : `${acc.number}${acc.holder ? ` • ${acc.holder}` : ""}`
                            : `Otomatis via ${gateway === "tokopay" ? "Tokopay" : "Tripay"}`}
                      </span>
                    </span>
                    {busy ? (
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">→</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DETAIL PEMBAYARAN */}
        {step === "pay" && order && (
          <div className="text-center">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-left">
              <button
                type="button"
                onClick={() => {
                  setStep("choose");
                  setError("");
                }}
                title="Ganti metode pembayaran"
                className="shrink-0 rounded-full bg-muted p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                aria-label="Ganti metode pembayaran"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {order.id}
                </span>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5">
                  {isVa
                    ? "Transfer ke Virtual Account"
                    : isTransfer
                      ? `Transfer ke ${methodLabel}`
                      : payMethod === "qris_toko"
                        ? "Scan QRIS Toko untuk Membayar"
                        : "Scan QRIS untuk Membayar"}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-600">
                <Clock size={13} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {isTransfer && transferAccount ? (
              <div className="my-4 rounded-2xl border border-border bg-white p-5 shadow-md">
                <p className="text-[11px] font-semibold text-slate-500">
                  {transferAccount.kind === "bank" ? "Transfer Bank" : "Transfer E-Wallet"} •{" "}
                  {transferAccount.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-slate-900">
                  {order.pay_code || transferAccount.number}
                </p>
                {transferAccount.holder && (
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    a.n. {transferAccount.holder}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Transfer tepat sejumlah tagihan, lalu kirim bukti via WhatsApp di bawah.
                </p>
                <button
                  type="button"
                  onClick={() => copyText(order.pay_code || transferAccount.number, "tf")}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
                >
                  <Copy size={13} />
                  <span>{copied === "tf" ? "Tersalin!" : "Salin Nomor"}</span>
                </button>
              </div>
            ) : !isVa ? (
              <div className="my-4 mx-auto flex w-fit flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-md">
                <img
                  src={order.payment_url}
                  alt="QRIS Buana Computer"
                  className="h-56 w-56 sm:h-64 sm:w-64 object-contain rounded-lg"
                />
                <p className="mt-2 text-[11px] font-semibold text-slate-800">
                  BUANA COMPUTER • {methodLabel.toUpperCase().slice(0, 24)}
                </p>
                {payMethod === "qris_toko" && (
                  <p className="mt-1 max-w-60 text-[10px] text-slate-500">
                    QRIS langsung ke toko — nominal sudah pas, setelah bayar kirim bukti via
                    WhatsApp.
                  </p>
                )}
              </div>
            ) : (
              <div className="my-4 rounded-2xl border border-border bg-white p-5 shadow-md">
                <p className="text-[11px] font-semibold text-slate-500">{methodLabel}</p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-slate-900">
                  {order.pay_code || "–"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Transfer tepat sejumlah tagihan dari m-banking / ATM / internet banking.
                </p>
                <button
                  type="button"
                  onClick={() => copyText(order.pay_code || "", "va")}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
                >
                  <Copy size={13} />
                  <span>{copied === "va" ? "Tersalin!" : "Salin No. VA"}</span>
                </button>
              </div>
            )}

            {/* Total Amount & Copy */}
            <div className="rounded-2xl border border-border bg-muted/30 p-3 flex items-center justify-between text-left">
              <div>
                <p className="text-[10px] text-muted-foreground">Total Tagihan:</p>
                <p className="font-mono text-base font-bold text-primary">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyText(String(order.total_amount), "total")}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Copy size={13} />
                <span>{copied === "total" ? "Tersalin!" : "Salin Nominal"}</span>
              </button>
            </div>

            {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {checking ? "Memeriksa Pembayaran..." : "✓ Saya Sudah Bayar / Cek Status"}
              </button>

              {order.checkout_url && (
                <a
                  href={order.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary/20"
                >
                  Buka Halaman Pembayaran Tripay →
                </a>
              )}

              <a
                href={waConfirmHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20"
              >
                <MessageCircle size={15} />
                Kirim Bukti Pembayaran ke WhatsApp Toko
              </a>

              {/* Demo Mode Instant Simulator Button */}
              <button
                type="button"
                onClick={handleSimulatePaid}
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-100 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
              >
                ⚡ Simulasikan Pembayaran Lunas (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {/* STEP COD: PESANAN COD BERHASIL DIBUAT */}
        {step === "cod" && order && (
          <div className="text-center py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
              <Store size={32} />
            </div>
            <h3 className="font-heading mt-4 text-xl font-bold text-foreground">
              Pesanan COD Dibuat!
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tunjukkan invoice ini saat datang ke toko &amp; bayar{" "}
              <strong>{formatPrice(order.total_amount)}</strong> di kasir.
            </p>
            <div className="my-5 rounded-2xl border border-border bg-muted/20 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Invoice:</span>
                <span className="font-mono font-bold text-foreground">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-semibold text-foreground">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 font-bold text-amber-700">
                  COD — BAYAR DI TOKO
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              <a
                href={waConfirmHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                <MessageCircle size={16} />
                Konfirmasi Jadwal Ambil via WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Tutup &amp; Selesai
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: STATUS LUNAS (PAID) */}
        {step === "paid" && order && (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-heading mt-4 text-xl font-bold text-foreground">
              Pembayaran Berhasil!
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Terima kasih, pembayaran sebesar <strong>{formatPrice(order.total_amount)}</strong>{" "}
              telah kami terima.
            </p>

            <div className="my-5 rounded-2xl border border-border bg-muted/20 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Invoice:</span>
                <span className="font-mono font-bold text-foreground">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Pembeli:</span>
                <span className="font-semibold text-foreground">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-600">
                  LUNAS (PAID)
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={waConfirmHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                <MessageCircle size={16} />
                Konfirmasi ke WhatsApp Toko
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Tutup &amp; Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
