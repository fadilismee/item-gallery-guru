import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { adminDeleteOrder, adminListOrders, adminVerifyOrder } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { OrderRecord } from "@/lib/supabase";

export const Route = createFileRoute("/admin/order")({
  component: AdminOrder,
});

type StatusFilter = "ALL" | "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "CANCELLED";

type Stats = { total: number; pending: number; paid: number; problem: number; revenue: number };

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Lunas" },
  { id: "EXPIRED", label: "Expired" },
  { id: "FAILED", label: "Gagal" },
  { id: "CANCELLED", label: "Batal" },
];

const fmtRp = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const fmtTime = (iso?: string) => {
  if (!iso) return "–";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

function StatusBadge({ status }: { status: OrderRecord["payment_status"] }) {
  const cls =
    status === "PAID"
      ? "adm-chip-green"
      : status === "PENDING"
        ? "adm-chip-amber"
        : status === "FAILED"
          ? "adm-chip-red"
          : "adm-chip-slate";
  const label =
    status === "PAID"
      ? "LUNAS"
      : status === "PENDING"
        ? "PENDING"
        : status === "EXPIRED"
          ? "EXPIRED"
          : status === "FAILED"
            ? "GAGAL"
            : "BATAL";
  return <span className={`adm-chip ${cls} font-mono text-[10px] font-bold`}>{label}</span>;
}

function AdminOrder() {
  const [list, setList] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    paid: 0,
    problem: 0,
    revenue: 0,
  });
  const [offline, setOffline] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<OrderRecord | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const token = () => getAdminToken() ?? "";

  const reload = useCallback(
    async (s: StatusFilter = status, q: string = query) => {
      setBusy("load");
      setError("");
      try {
        const r = await adminListOrders({ data: { token: token(), status: s, query: q } });
        setList(r.orders);
        setStats(r.stats);
        setOffline(r.offline);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setBusy(null);
      }
    },
    [status, query],
  );

  useEffect(() => {
    void reload("ALL", "");
  }, [reload]);

  // Auto-refresh tiap 15 detik agar order baru langsung muncul tanpa klik manual.
  // Dijeda otomatis saat tab browser tidak aktif (hemat kuota Supabase).
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        void reload();
      }
    }, 15000);
    return () => clearInterval(t);
  }, [reload]);

  const applyFilter = (s: StatusFilter) => {
    setStatus(s);
    void reload(s, query);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    void reload(status, query);
  };

  const verify = async (orderId: string) => {
    setBusy(`verify-${orderId}`);
    setError("");
    setNotice("");
    try {
      const r = await adminVerifyOrder({ data: { token: token(), orderId } });
      setList((prev) => prev.map((o) => (o.id === orderId ? r.order : o)));
      if (detail?.id === orderId) setDetail(r.order);
      setNotice(
        r.order.payment_status === "PAID"
          ? `✓ ${orderId} LUNAS menurut Tripay (tersinkron).`
          : `Status ${orderId} di Tripay: ${r.tripayStatus} (tersinkron).`,
      );
      void reload(status, query);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (orderId: string) => {
    setBusy(`del-${orderId}`);
    setError("");
    try {
      await adminDeleteOrder({ data: { token: token(), orderId } });
      setList((prev) => prev.filter((o) => o.id !== orderId));
      if (detail?.id === orderId) setDetail(null);
      setNotice(`Terhapus dari log: ${orderId}.`);
      void reload(status, query);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Log Transaksi Toko • Supabase</p>
          <h1 className="adm-h1 mt-1">Transaksi &amp; Order</h1>
          <p className="adm-sub mt-1">
            Seluruh invoice tercatat di sini — pending, lunas, expired, maupun gagal — lengkap
            dengan tombol verifikasi silang ke Tripay.
          </p>
        </div>
        <button
          onClick={() => reload(status, query)}
          disabled={busy === "load"}
          className="adm-btn-ghost inline-flex items-center gap-1.5"
        >
          <AdminIcon name="refresh" className="text-[18px]" />
          {busy === "load" ? "Memuat…" : "Muat Ulang"}
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}
      {offline && (
        <p className="adm-alert-err">
          Supabase belum terhubung di server (cek SUPABASE_URL &amp; SUPABASE_ANON_KEY). Log kosong
          untuk sementara.
        </p>
      )}

      {/* ---------- ringkasan ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <div className="adm-card p-4">
          <p className="adm-stat-label">Omzet Lunas</p>
          <p className="adm-stat-num mt-1">{fmtRp(stats.revenue)}</p>
          <p className="adm-sub mt-1 text-xs">{stats.paid} transaksi lunas</p>
        </div>
        <div className="adm-card p-4">
          <p className="adm-stat-label">Menunggu Bayar</p>
          <p className="adm-stat-num mt-1">{stats.pending}</p>
          <p className="adm-sub mt-1 text-xs">Perlu dipantau / dihubungi</p>
        </div>
        <div className="adm-card p-4">
          <p className="adm-stat-label">Bermasalah</p>
          <p className="adm-stat-num mt-1">{stats.problem}</p>
          <p className="adm-sub mt-1 text-xs">Expired / gagal / batal</p>
        </div>
        <div className="adm-card p-4">
          <p className="adm-stat-label">Total Invoice</p>
          <p className="adm-stat-num mt-1">{stats.total}</p>
          <p className="adm-sub mt-1 text-xs">Semua status tercatat</p>
        </div>
        <div className="adm-card p-4">
          <p className="adm-stat-label">Rasio Berhasil</p>
          <p className="adm-stat-num mt-1">
            {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
          </p>
          <p className="adm-sub mt-1 text-xs">Lunas dari total invoice</p>
        </div>
      </section>

      {/* ---------- filter ---------- */}
      <section className="adm-card flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => applyFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                status === f.id
                  ? "bg-pri text-on-pri"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={applySearch}
          className="ml-auto flex min-w-[200px] flex-1 gap-2 sm:max-w-xs"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari invoice / nama / WA…"
            className="adm-input flex-1 text-xs"
          />
          <button type="submit" className="adm-btn-ghost px-3 py-1.5 text-xs">
            Cari
          </button>
        </form>
      </section>

      {/* ---------- tabel log ---------- */}
      <section className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="adm-table min-w-[760px]">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Pembeli</th>
                <th>Isi &amp; Total</th>
                <th>Status</th>
                <th>Waktu</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="font-mono text-xs font-bold text-on-surface">{o.id}</span>
                    <p className="font-mono text-[10px] text-slate-400">
                      {(o.payment_gateway || "tripay").toUpperCase()} •{" "}
                      {(o.payment_channel || "qris").toUpperCase()}
                    </p>
                  </td>
                  <td>
                    <p className="max-w-[160px] truncate text-xs font-bold text-on-surface">
                      {o.customer_name}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">{o.customer_phone}</p>
                  </td>
                  <td>
                    <p className="text-xs text-slate-600">
                      {o.items.length} item • {o.items.reduce((s, it) => s + it.qty, 0)} pcs
                    </p>
                    <p className="font-mono text-xs font-bold text-on-surface">
                      {fmtRp(o.total_amount)}
                    </p>
                  </td>
                  <td>
                    <StatusBadge status={o.payment_status} />
                  </td>
                  <td className="font-mono text-[11px] text-slate-500">{fmtTime(o.created_at)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetail(o)}
                        title="Lihat rincian"
                        className="rounded-md border border-border p-1.5 text-slate-600 hover:bg-surface-high"
                      >
                        <AdminIcon name="visibility" className="text-[16px]" />
                      </button>
                      <button
                        onClick={() => verify(o.id)}
                        disabled={busy === `verify-${o.id}`}
                        title="Verifikasi silang ke Tripay"
                        className="rounded-md border border-border p-1.5 text-pri hover:bg-pri/10 disabled:opacity-50"
                      >
                        <AdminIcon name="verified" className="text-[16px]" />
                      </button>
                      <button
                        onClick={() => setConfirming(o.id)}
                        title="Hapus dari log"
                        className="rounded-md border border-border p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <AdminIcon name="delete" className="text-[16px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                    {busy === "load"
                      ? "Memuat log transaksi…"
                      : "Belum ada invoice pada filter ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- drawer rincian ---------- */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="adm-card max-h-[85vh] w-full max-w-lg overflow-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="adm-eyebrow">Rincian Invoice</p>
                <h3 className="font-heading font-bold">{detail.id}</h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={detail.payment_status} />
                <button
                  onClick={() => setDetail(null)}
                  className="rounded-md border border-border p-1.5 text-slate-500 hover:bg-surface-high"
                >
                  <AdminIcon name="close" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-on-surface">{detail.customer_name}</p>
                <p className="font-mono text-slate-500">{detail.customer_phone}</p>
                {detail.customer_address && (
                  <p className="mt-1 text-slate-600">{detail.customer_address}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200">
                {detail.items.map((it, i) => (
                  <div
                    key={`${it.id}-${i}`}
                    className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-on-surface">{it.name}</p>
                      {it.variant && <p className="text-[11px] text-pri">Varian: {it.variant}</p>}
                    </div>
                    <span className="shrink-0 font-mono text-on-surface">
                      {it.qty}× {fmtRp(it.price)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2.5 font-bold">
                  <span>Total</span>
                  <span className="font-mono text-pri">{fmtRp(detail.total_amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-slate-400">Dibuat</p>
                  <p className="font-bold text-on-surface">{fmtTime(detail.created_at)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-slate-400">Lunas</p>
                  <p className="font-bold text-on-surface">{fmtTime(detail.paid_at)}</p>
                </div>
                {detail.tripay_reference && (
                  <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
                    <p className="text-slate-400">Referensi Tripay</p>
                    <p className="font-bold text-on-surface">{detail.tripay_reference}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => verify(detail.id)}
                  disabled={busy === `verify-${detail.id}`}
                  className="adm-btn-pri inline-flex items-center gap-1 px-4 py-2 text-xs disabled:opacity-50"
                >
                  <AdminIcon name="verified" className="text-[15px]" />
                  {busy === `verify-${detail.id}` ? "Memeriksa…" : "Cek ke Tripay"}
                </button>
                {detail.checkout_url && (
                  <a
                    href={detail.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-xs"
                  >
                    <AdminIcon name="open_in_new" className="text-[15px]" />
                    Buka Checkout Tripay
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title={`Hapus ${confirming}?`}
          message="Invoice dihapus permanen dari log Supabase. Gunakan untuk membersihkan order testing / sampah."
          onCancel={() => setConfirming(null)}
          onConfirm={() => remove(confirming)}
        />
      )}
    </div>
  );
}
