import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Copy, MessageCircle, QrCode, X } from "lucide-react";
import { checkOrderStatus, createOrderQris, simulateOrderPayment } from "@/server/payment";
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
  onSuccess?: (order: OrderRecord) => void;
};

export function QrisCheckoutModal({ open, onClose, items, onSuccess }: Props) {
  const [step, setStep] = useState<"form" | "qris" | "paid">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins countdown
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const formatPrice = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  // Reset when opening
  useEffect(() => {
    if (open) {
      setStep("form");
      setError("");
      setTimeLeft(15 * 60);
    }
  }, [open]);

  // Countdown timer for QRIS
  useEffect(() => {
    if (step !== "qris" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  if (!open) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await createOrderQris({
        data: {
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items,
          paymentChannel: "qris",
        },
      });

      if (res?.order) {
        setOrder(res.order);
        setStep("qris");
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

  const copyTotal = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(String(order.total_amount));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        `Halo Buana Computer, saya sudah menyelesaikan pembayaran via QRIS untuk Order ID: ${order.id} sebesar ${formatPrice(
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

        {/* STEP 1: FORM DATA PEMESAN */}
        {step === "form" && (
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <QrCode size={22} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Bayar Instan via QRIS (Tripay)
                </h2>
                <p className="text-xs text-muted-foreground">
                  BCA, Mandiri, BRI, BNI, GoPay, ShopeePay, OVO, DANA &amp; Semua m-Banking
                </p>
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
                  Alamat Pengiriman (Bila dikirim)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap, kecamatan, kota/kabupaten..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? "Membuat Kode QRIS..." : `Lanjut Bayar (${formatPrice(totalAmount)}) →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: TAMPILAN QRIS SCAN */}
        {step === "qris" && order && (
          <div className="text-center">
            <div className="flex items-center justify-between border-b border-border pb-3 text-left">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {order.id}
                </span>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5">
                  Scan QRIS untuk Membayar
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-600">
                <Clock size={13} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="my-4 mx-auto flex w-fit flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-md">
              <img
                src={order.payment_url}
                alt="QRIS Tripay Buana Computer"
                className="h-56 w-56 sm:h-64 sm:w-64 object-contain rounded-lg"
              />
              <p className="mt-2 text-[11px] font-semibold text-slate-800">
                BUANA COMPUTER • TRIPAY
              </p>
            </div>

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
                onClick={copyTotal}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Copy size={13} />
                <span>{copied ? "Tersalin!" : "Salin Nominal"}</span>
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
