import { useEffect, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  Store,
  Truck,
  X,
} from "lucide-react";
import {
  checkOrderStatus,
  createOrderQris,
  getShippingQuote,
  simulateOrderPayment,
  type ShippingQuote,
} from "@/server/payment";
import type { PublicPayMethod } from "@/hooks/use-payment-config";
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
  onSuccess?: (order: OrderRecord) => void;
};

const FALLBACK_METHODS: PublicPayMethod[] = [
  { id: "qris", label: "QRIS — semua bank & e-wallet", enabled: true },
  { id: "cod", label: "COD / Bayar langsung di toko", enabled: true },
];

function methodIcon(id: string) {
  if (id === "qris") return <QrCode size={16} />;
  if (id === "cod") return <Store size={16} />;
  return <Banknote size={16} />;
}

export function QrisCheckoutModal({ open, onClose, items, payMethods, onSuccess }: Props) {
  const methods =
    payMethods && payMethods.length > 0
      ? payMethods.filter((m) => m.id !== "manual_wa")
      : FALLBACK_METHODS;
  const [step, setStep] = useState<"form" | "pay" | "paid" | "cod">("form");
  const [payMethod, setPayMethod] = useState(methods[0]?.id ?? "qris");
  const [methodLabel, setMethodLabel] = useState(methods[0]?.label ?? "QRIS");
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
  const shippingFee = payMethod === "cod" ? 0 : (quote?.fee ?? 0);
  const totalAmount = itemsTotal + shippingFee;

  const formatPrice = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  // Reset when opening
  useEffect(() => {
    if (open) {
      const first = methods[0]?.id ?? "qris";
      setPayMethod(first);
      setMethodLabel(methods[0]?.label ?? "QRIS");
      setStep("form");
      setError("");
      setTimeLeft(15 * 60);
      setQuote(null);
      setCoords(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (payMethod !== "cod" && !quote) {
      setError("Hitung ongkir dulu (isi alamat / gunakan GPS) sebelum buat pesanan.");
      return;
    }
    setBusy(true);

    try {
      const res = await createOrderQris({
        data: {
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items,
          method: payMethod,
          shippingZone: payMethod === "cod" ? "PICKUP" : quote?.zone,
        },
      });

      if (res?.order) {
        setOrder(res.order);
        setMethodLabel(methods.find((m) => m.id === payMethod)?.label ?? payMethod);
        setStep(payMethod === "cod" ? "cod" : "pay");
      }
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
        payMethod === "cod"
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

        {/* STEP 1: FORM DATA PEMESAN + PILIH METODE */}
        {step === "form" && (
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {methodIcon(payMethod)}
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Bayar Pesanan Toko
                </h2>
                <p className="text-xs text-muted-foreground">
                  QRIS, Virtual Account bank, atau COD di toko
                </p>
              </div>
            </div>

            {/* Pillih Metode Pembayaran */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-foreground">Metode Pembayaran:</p>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPayMethod(m.id);
                      setMethodLabel(m.label);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                      payMethod === m.id
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {methodIcon(m.id)}
                    {m.id === "qris"
                      ? "QRIS"
                      : m.id === "cod"
                        ? "COD"
                        : m.label.replace(" Virtual Account", "")}
                  </button>
                ))}
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

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-3 text-xs">
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

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Alamat Pengiriman{" "}
                  {payMethod !== "cod" && <span className="text-destructive">*</span>}
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
                {payMethod !== "cod" && (
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
                )}
                {quote && payMethod !== "cod" && (
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

              {/* Rincian total */}
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal barang</span>
                  <span className="font-mono">{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ongkir {quote && payMethod !== "cod" ? `(${quote.zone})` : ""}</span>
                  <span className="font-mono">
                    {payMethod === "cod" ? "Bayar di toko" : formatPrice(shippingFee)}
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
                    ? "Memproses Pesanan..."
                    : payMethod === "cod"
                      ? `Buat Pesanan COD (${formatPrice(totalAmount)}) →`
                      : `Lanjut Bayar (${formatPrice(totalAmount)}) →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PEMBAYARAN QRIS / VIRTUAL ACCOUNT */}
        {step === "pay" && order && (
          <div className="text-center">
            <div className="flex items-center justify-between border-b border-border pb-3 text-left">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {order.id}
                </span>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5">
                  {isVa ? "Transfer ke Virtual Account" : "Scan QRIS untuk Membayar"}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-600">
                <Clock size={13} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {!isVa ? (
              <div className="my-4 mx-auto flex w-fit flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-md">
                <img
                  src={order.payment_url}
                  alt="QRIS Buana Computer"
                  className="h-56 w-56 sm:h-64 sm:w-64 object-contain rounded-lg"
                />
                <p className="mt-2 text-[11px] font-semibold text-slate-800">
                  BUANA COMPUTER • {methodLabel.toUpperCase().slice(0, 24)}
                </p>
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

        {/* STEP 3: STATUS LUNAS (PAID) */}
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
