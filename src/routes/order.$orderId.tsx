import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { checkOrderStatus } from "@/server/payment";
import type { OrderRecord } from "@/lib/supabase";

export const Route = createFileRoute("/order/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Invoice ${params.orderId} — Buana Computer` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderStatusPage,
});

function OrderStatusPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPrice = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  const fetchStatus = useCallback(async () => {
    try {
      const res = await checkOrderStatus({ data: { orderId } });
      setOrder(res.order);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pesanan tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchStatus();
    // Poll every 8 seconds if pending
    const t = setInterval(() => {
      if (order?.payment_status === "PENDING") {
        void fetchStatus();
      }
    }, 8000);
    return () => clearInterval(t);
  }, [fetchStatus, order?.payment_status]);

  const waConfirmHref = order
    ? `https://wa.me/6285979220599?text=${encodeURIComponent(
        `Halo Buana Computer, saya mau konfirmasi pesanan Invoice ${order.id} atas nama ${order.customer_name}. Total: ${formatPrice(
          order.total_amount,
        )}. Mohon info statusnya, terima kasih!`,
      )}`
    : "#";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Kembali ke Katalog
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-xs text-muted-foreground">Memuat rincian invoice...</p>
          </div>
        ) : error || !order ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-sm">
            <AlertCircle size={36} className="mx-auto text-destructive" />
            <h2 className="font-heading mt-3 text-lg font-bold text-foreground">
              Invoice Tidak Ditemukan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            <div className="mt-6">
              <Link
                to="/"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
              >
                Kembali ke Katalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            {/* Header Status Banner */}
            <div
              className={`p-6 sm:p-8 text-white ${
                order.payment_status === "PAID"
                  ? "bg-emerald-600"
                  : order.payment_status === "PENDING"
                    ? "bg-slate-900"
                    : "bg-destructive"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {order.payment_status === "PAID" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Clock size={24} className="text-amber-400" />
                    </div>
                  )}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                      STATUS INVOICE
                    </span>
                    <h1 className="font-heading text-xl font-extrabold sm:text-2xl">
                      {order.payment_status === "PAID"
                        ? "PEMBAYARAN LUNAS (PAID)"
                        : "MENUNGGU PEMBAYARAN"}
                    </h1>
                  </div>
                </div>

                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-bold backdrop-blur-sm">
                  {order.id}
                </span>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6 sm:p-8 space-y-6 text-xs text-foreground">
              {/* Data Pelanggan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-border bg-muted/20 p-4">
                <div>
                  <p className="font-semibold text-muted-foreground">Pemesan:</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{order.customer_name}</p>
                  <p className="font-mono text-muted-foreground mt-0.5">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Waktu Pemesanan:</p>
                  <p className="text-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                  {order.customer_address && (
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      Alamat: {order.customer_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Rincian Produk */}
              <div>
                <p className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Package size={16} className="text-primary" />
                  Rincian Barang yang Dipesan:
                </p>
                <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                  {order.items.map((it, idx) => (
                    <div
                      key={`${it.id}-${idx}`}
                      className="flex items-center justify-between p-3.5 bg-card"
                    >
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img
                            src={it.image}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-foreground text-sm">{it.name}</p>
                          {it.variant && (
                            <p className="text-[11px] text-primary font-medium">
                              Varian: {it.variant}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground">
                          {it.qty}x {formatPrice(it.price)}
                        </span>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {formatPrice(it.price * it.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted/40 flex items-center justify-between text-sm font-bold">
                    <span>Total Pembayaran:</span>
                    <span className="font-mono text-primary text-base">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Container jika masih PENDING */}
              {order.payment_status === "PENDING" && order.payment_url && (
                <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
                  <p className="font-heading text-sm font-bold text-slate-900">
                    Scan QRIS untuk Menyelesaikan Pembayaran:
                  </p>
                  <img
                    src={order.payment_url}
                    alt="QRIS Tokopay"
                    className="mx-auto my-3 h-52 w-52 object-contain rounded-lg border border-slate-200"
                  />
                  <p className="font-mono text-xs font-bold text-slate-800">
                    Total: {formatPrice(order.total_amount)}
                  </p>
                  <button
                    type="button"
                    onClick={fetchStatus}
                    className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    ✓ Cek Status Pembayaran
                  </button>
                </div>
              )}

              {/* Jaminan Garansi Toko */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Garansi Toko Resmi Berlaku</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Invoice ini berlaku sebagai bukti sah garansi toko dan klaim retur Buana
                    Computer Store.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={waConfirmHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  <MessageCircle size={16} />
                  Konfirmasi ke WhatsApp Toko
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-muted"
                >
                  <ShoppingBag size={15} />
                  Belanja Lagi
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
