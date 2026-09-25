import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  adminGitCommitPush,
  adminGitStatus,
  adminListOrders,
  adminStatus,
  adminValidate,
} from "@/server/admin";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { errMsg, getAdminToken, isReviewer } from "@/lib/adminClient";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type { ValidationResult } from "@/lib/validateAll";
import poster1 from "@/img/Buanacomputer-poster1.jpg";
import poster2 from "@/img/Buanacomputer-poster2.jpg";
import poster3 from "@/img/Buanacomputer-poster3.jpg";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type GitInfo = { branch: string; dirty: string[]; log: string[] };
type DashData = Awaited<ReturnType<typeof adminStatus>>;

const EASY_COMMIT_MESSAGE = "Update konten via dashboard (mode mudah)";

const defaultStorePosters = [
  { img: poster1, label: "Promo Laptop & PC Gaming", desc: "Poster #1 Default Toko" },
  { img: poster2, label: "PC Rakitan & Komponen", desc: "Poster #2 Default Toko" },
  { img: poster3, label: "Komponen & Aksesoris Teruji", desc: "Poster #3 Default Toko" },
];

const fmtRp = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const fmtRpShort = (v: number) => {
  if (v >= 1_000_000_000)
    return `Rp ${(v / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (v >= 1_000_000)
    return `Rp ${(v / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  return fmtRp(v);
};

const tagChip = (tone: string) =>
  tone === "pri" ? "adm-chip-blue" : tone === "tertiary" ? "adm-chip-red" : "adm-chip-slate";

const barTone = (i: number) => (i === 1 ? "teal" : i === 2 ? "red" : "");

function StatCard({
  eyebrow,
  title,
  icon,
  chip,
  value,
  unit,
  desc,
  footLeft,
  footLeftClass,
  footRight,
  to,
}: {
  eyebrow: string;
  title: string;
  icon: string;
  chip?: string;
  value: string;
  unit?: string;
  desc?: string;
  footLeft: string;
  footLeftClass?: string;
  footRight?: string;
  to?: string;
}) {
  const content = (
    <div className="adm-card adm-stat-card h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="adm-stat-label">{eyebrow}</p>
          <h3 className="font-heading mt-0.5 text-[15px] leading-tight font-bold text-on-surface">
            {title}
          </h3>
        </div>
        <span className={`adm-icon-chip${chip ? ` ${chip}` : ""}`}>
          <Icon name={icon} />
        </span>
      </div>
      <div>
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="adm-stat-num">{value}</span>
          {unit && (
            <span className="font-mono text-[11px] font-semibold text-slate-500">{unit}</span>
          )}
        </p>
        {desc && <p className="adm-sub mt-1 truncate text-xs">{desc}</p>}
      </div>
      <div className="adm-foot-row">
        <span className={footLeftClass ?? "text-pri"}>{footLeft}</span>
        {footRight && <span className="truncate text-slate-400">{footRight}</span>}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block transition-transform hover:-translate-y-0.5">
        {content}
      </Link>
    );
  }

  return content;
}

function AdminDashboard() {
  const adminMode = useAdminMode((s) => s.mode);
  const easy = isEasyMode(adminMode);
  const [dash, setDash] = useState<DashData | null>(null);
  const [env, setEnv] = useState("");
  const [git, setGit] = useState<GitInfo | null>(null);
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [orderStats, setOrderStats] = useState<{
    total: number;
    pending: number;
    paid: number;
    revenue: number;
  } | null>(null);

  const token = () => getAdminToken() ?? "";

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const refreshGit = useCallback(async () => {
    try {
      setGit(await adminGitStatus({ data: { token: token() } }));
    } catch (e) {
      setError(errMsg(e));
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await adminStatus({ data: { token: token() } });
        setDash(s);
        setEnv(s.env);
        await refreshGit();
      } catch (e) {
        setError(errMsg(e));
      }
      try {
        const o = await adminListOrders({ data: { token: token(), status: "ALL", limit: 200 } });
        setOrderStats({
          total: o.stats.total,
          pending: o.stats.pending,
          paid: o.stats.paid,
          revenue: o.stats.revenue,
        });
      } catch {
        // Supabase belum terhubung — tile transaksi tampil tanpa angka
      }
    })();
  }, [refreshGit]);

  const runValidate = async () => {
    setBusy("validate");
    setError("");
    try {
      const r = await adminValidate({ data: { token: token() } });
      setResults(r.results);
      setFailed(r.failed);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const commitPush = async (commitMessage: string) => {
    setBusy("git");
    setError("");
    setNotice("");
    try {
      const r = await adminGitCommitPush({ data: { token: token(), message: commitMessage } });
      setNotice(r.pushed ? `Terbit! Perubahan sudah live (±1 menit).\n${r.output}` : r.output);
      setMessage("");
      await refreshGit();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const contentDirty = (git?.dirty ?? []).filter(
    (f) =>
      f.includes("src/data") ||
      f.includes("sitemap") ||
      f.includes("public/banners") ||
      f.includes("banners"),
  );

  const modules = [
    {
      to: "/admin/produk",
      icon: "inventory_2",
      chip: "",
      label: "Katalog Produk & Toko",
      desc: "Kelola laptop, PC rakitan, storage, dan varian harga/stok toko",
      count: dash?.counts.products,
      unit: "Produk",
    },
    {
      to: "/admin/order",
      icon: "receipt_long",
      chip: "amber",
      label: "Transaksi & Order",
      desc: "Log invoice Supabase: pending, lunas, gagal + verifikasi ke Tripay",
      count: orderStats?.pending,
      unit: "Pending",
    },
    {
      to: "/admin/payment",
      icon: "payments",
      chip: "teal",
      label: "Pembayaran & Gateway",
      desc: "Atur gateway aktif, metode checkout, dan API key Tripay/Tokopay",
      count: undefined,
      unit: "Gateway",
    },
    {
      to: "/admin/blog",
      icon: "auto_stories",
      chip: "violet",
      label: "Buana Journal (Blog)",
      desc: "Tulis dan sunting artikel panduan teknikal & benchmark hardware",
      count: dash?.counts.articles,
      unit: "Artikel",
    },
    {
      to: "/admin/review",
      icon: "rate_review",
      chip: "green",
      label: "Review & Testimoni",
      desc: "Kelola ulasan pembeli, rating bintang, dan foto testimoni",
      count: dash?.counts.reviews,
      unit: "Ulasan",
    },
    {
      to: "/admin/banner",
      icon: "campaign",
      chip: "red",
      label: "Banner & Promosi",
      desc: "Atur slot hero slider promosi homepage dan poster toko",
      count: dash?.banners.hero,
      unit: "Banner",
    },
  ] as const;

  const catsDesc = dash
    ? dash.cats
        .slice(0, 3)
        .map((c) => `${c.name} (${c.count})`)
        .join(" • ")
    : "Memuat…";
  const firstName = (n: string) => n.split("•")[0]?.trim() || n;

  return (
    <div className="space-y-5">
      {/* ---------- hero ---------- */}
      <section className="adm-card adm-hero p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="adm-chip adm-chip-blue">Store Operational Console</span>
              <span className="adm-sub inline-flex items-center gap-1">
                <Icon name="schedule" className="text-[15px]" />
                {today} • Gerai Bantul
              </span>
            </div>
            <h1 className="adm-h1 mt-2">Selamat Datang, Admin Buana</h1>
            <p className="adm-sub mt-1">
              Pusat kendali katalog toko, stok barang, Buana Journal, dan publikasi live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isReviewer() ? (
              <Link to="/admin/order" className="adm-btn-pri inline-flex items-center gap-1.5">
                <Icon name="receipt_long" className="text-[18px]" />
                Lihat Log Transaksi
                {orderStats && orderStats.pending > 0 && (
                  <span className="adm-chip adm-chip-amber ml-1">{orderStats.pending}</span>
                )}
              </Link>
            ) : (
              <>
                <Link to="/admin/produk" className="adm-btn-pri inline-flex items-center gap-1.5">
                  <Icon name="add_shopping_cart" className="text-[18px]" />
                  Tambah Produk
                </Link>
                <Link to="/admin/blog" className="adm-btn-ghost inline-flex items-center gap-1.5">
                  <Icon name="edit_note" className="text-[18px] text-pri" />
                  Tulis Artikel
                </Link>
                <Link to="/admin/banner" className="adm-btn-ghost inline-flex items-center gap-1.5">
                  <Icon name="campaign" className="text-[18px] text-pri" />
                  Atur Banner
                </Link>
                <Link to="/admin/order" className="adm-btn-ghost inline-flex items-center gap-1.5">
                  <Icon name="receipt_long" className="text-[18px] text-pri" />
                  Log Transaksi
                  {orderStats && orderStats.pending > 0 && (
                    <span className="adm-chip adm-chip-amber ml-1">{orderStats.pending}</span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok whitespace-pre-wrap">{notice}</p>}
      {dash && !dash.local && (
        <p className="adm-alert-err">
          Mode lihat-jarak-jauh: server ini tidak memegang file katalog, jadi statistik produk/blog
          tampil 0 dan tombol tulis nonaktif. Untuk edit &amp; Terbitkan, buka dashboard dari PC dev
          / LAN kantor. Log transaksi Supabase di bawah tetap live.
        </p>
      )}

      {/* ---------- 6 STAT CARDS (STORE FOCUS) ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          eyebrow="Katalog Toko"
          title="Total Produk"
          icon="inventory_2"
          to="/admin/produk"
          value={dash ? `${dash.counts.products}` : "…"}
          unit="SKU"
          desc={catsDesc}
          footLeft={
            dash ? (dash.inv.lowCount > 0 ? `${dash.inv.lowCount} Stok Kritis` : "Stok aman") : "…"
          }
          footLeftClass={dash && dash.inv.lowCount > 0 ? "text-red-700" : "text-green-700"}
          footRight={dash ? `${dash.inv.featured} Unggulan` : undefined}
        />
        <StatCard
          eyebrow="Kasir Toko"
          title="Transaksi"
          icon="receipt_long"
          chip="amber"
          to="/admin/order"
          value={orderStats ? `${orderStats.pending}` : "…"}
          unit="Pending"
          desc={orderStats ? `Omzet lunas ${fmtRpShort(orderStats.revenue)}` : "Memuat log order…"}
          footLeft={orderStats ? `${orderStats.total} invoice` : "…"}
          footRight={orderStats ? `${orderStats.paid} lunas` : undefined}
        />
        <StatCard
          eyebrow="Aset Toko"
          title="Nilai Inventaris"
          icon="payments"
          chip="teal"
          to="/admin/produk"
          value={dash ? fmtRpShort(dash.inv.value) : "…"}
          unit="modal"
          desc={dash ? `${dash.inv.ready} unit siap jual` : "Memuat…"}
          footLeft={dash ? `${dash.inv.sold} unit terjual` : "…"}
          footRight="Estimasi"
        />
        <StatCard
          eyebrow="Editorial Lab"
          title="Buana Journal"
          icon="auto_stories"
          chip="violet"
          to="/admin/blog"
          value={dash ? `${dash.counts.articles}` : "…"}
          unit="Artikel"
          desc={dash?.blog.latest[0]?.title ?? "Memuat…"}
          footLeft={dash ? `${dash.blog.totalMinutes} mnt baca` : "…"}
          footRight={dash?.blog.latest[0]?.date}
        />
        <StatCard
          eyebrow="Kepuasan Klien"
          title="Rating & Review"
          icon="verified"
          chip="green"
          to="/admin/review"
          value={dash ? dash.reviews.avg.toFixed(1) : "…"}
          unit="/ 5.0 ★"
          desc={dash ? `${dash.counts.reviews} testimoni` : "Memuat…"}
          footLeft={
            dash?.reviews.latest[0] ? `Terbaru: ${firstName(dash.reviews.latest[0].name)}` : "…"
          }
          footRight={dash?.reviews.latest[0]?.date}
        />
        <StatCard
          eyebrow="Promosi & Media"
          title="Banner & Upload"
          icon="campaign"
          chip="red"
          to="/admin/banner"
          value={dash ? `${dash.banners.hero}` : "…"}
          unit="Banner Live"
          desc={dash ? `${dash.uploadsCount} riwayat upload` : "Memuat…"}
          footLeft={dash?.banners.hero === 0 ? "Bawaan aktif" : "Custom aktif"}
          footRight="Homepage"
        />
      </section>

      {/* ---------- publish banner (admin penuh saja) ---------- */}
      {!isReviewer() && contentDirty.length > 0 && (
        <section className="adm-card flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50/60 p-4">
          <p className="flex items-center gap-2 text-sm text-green-900">
            <Icon name="rocket_launch" className="text-[22px] text-green-700" />
            <span>
              Ada <strong>{contentDirty.length} file data</strong> belum diterbitkan ke Vercel —
              pengunjung web belum melihat perubahan terbaru.
            </span>
          </p>
          <button
            onClick={() => commitPush(EASY_COMMIT_MESSAGE)}
            disabled={busy === "git"}
            className="adm-btn-green inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold shadow-sm"
          >
            <Icon name="rocket_launch" className="text-[18px]" />
            {busy === "git" ? "Menerbitkan…" : "Terbitkan Sekarang"}
          </button>
        </section>
      )}

      {/* ---------- main grid (balanced 2 columns) ---------- */}
      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Kolom Kiri: Monitoring Katalog & Performa Jurnal */}
        <div className="space-y-5 lg:col-span-7 xl:col-span-8">
          {/* Tabel Ringkas Produk Toko */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="adm-icon-chip">
                  <Icon name="storefront" />
                </span>
                <div>
                  <h2 className="font-heading text-[16px] font-bold text-on-surface">
                    Monitoring Produk &amp; Stok Toko
                  </h2>
                  <p className="adm-sub text-xs">Produk terdaftar di katalog marketplace</p>
                </div>
              </div>
              <Link
                to="/admin/produk"
                className="adm-btn-ghost inline-flex items-center gap-1 text-xs py-1"
              >
                Lihat Semua ({dash?.counts.products ?? 0})
                <Icon name="arrow_forward" className="text-[14px]" />
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Status Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {(dash?.recentProducts ?? []).map((p) => (
                    <tr key={p.id}>
                      <td className="max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-md border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                              <Icon name="image" className="text-[16px]" />
                            </div>
                          )}
                          <span className="truncate text-xs font-bold text-on-surface">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-xs text-slate-600">{p.category}</td>
                      <td className="font-mono text-xs font-semibold text-on-surface">
                        {fmtRp(p.price)}
                      </td>
                      <td>
                        {p.stock <= 0 ? (
                          <span className="adm-chip adm-chip-red text-[10px]">Habis (0)</span>
                        ) : p.stock <= 2 ? (
                          <span className="adm-chip adm-chip-amber text-[10px]">
                            Kritis ({p.stock})
                          </span>
                        ) : (
                          <span className="adm-chip adm-chip-green text-[10px]">
                            Ready ({p.stock})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {dash && dash.recentProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-xs text-slate-400">
                        Belum ada produk terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performa Konten Buana Journal */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="adm-icon-chip violet">
                  <Icon name="insights" />
                </span>
                <div>
                  <h2 className="font-heading text-[16px] font-bold text-on-surface">
                    Performa Buana Journal &amp; Edukasi
                  </h2>
                  <p className="adm-sub text-xs">Artikel terbaru &amp; estimasi minat pembaca</p>
                </div>
              </div>
              {dash && (
                <span className="adm-chip adm-chip-blue font-mono text-[11px]">
                  {dash.blog.totalMinutes} mnt total baca
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(dash?.blog.latest ?? []).map((a, i) => (
                <article
                  key={a.slug}
                  className="rounded-xl bg-slate-50 p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`adm-chip ${tagChip(a.tagTone)} text-[10px]`}>{a.tag}</span>
                      <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-slate-500">
                        <Icon name="schedule" className="text-[12px]" />
                        {a.readMinutes} mnt
                      </span>
                    </div>
                    <h4 className="font-heading mt-2 line-clamp-2 text-xs leading-snug font-bold text-on-surface">
                      {a.title}
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-500">{a.readers}</span>
                      <span className="font-bold text-pri">{a.pct}%</span>
                    </div>
                    <div className="adm-bar-track mt-1">
                      <div
                        className={`adm-bar-fill ${barTone(i)}`}
                        style={{ width: `${a.pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[9px] text-slate-400">{a.date}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
              <p className="adm-sub text-xs">Tulis panduan teardown &amp; benchmark baru.</p>
              <Link
                to="/admin/blog"
                className="adm-btn-pri inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
              >
                Kelola Blog
                <Icon name="arrow_forward" className="text-[14px]" />
              </Link>
            </div>
          </div>

          {/* Live Hero Banner & Promosi Homepage */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="adm-icon-chip red">
                  <Icon name="campaign" />
                </span>
                <div>
                  <h2 className="font-heading text-[16px] font-bold text-on-surface">
                    Live Hero Banner &amp; Promosi Toko
                  </h2>
                  <p className="adm-sub text-xs">
                    Pratinjau visual banner carousel yang sedang tayang di homepage
                  </p>
                </div>
              </div>
              {dash && (
                <span
                  className={`adm-chip ${
                    (dash.banners.heroList?.length ?? 0) > 0 ? "adm-chip-green" : "adm-chip-blue"
                  } font-mono text-[11px]`}
                >
                  {(dash.banners.heroList?.length ?? 0) > 0
                    ? `${dash.banners.heroList.length} Banner Custom Aktif`
                    : "3 Poster Bawaan Toko"}
                </span>
              )}
            </div>

            {/* Thumbnail banner preview */}
            <div className="mt-3">
              {(dash?.banners.heroList?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {dash?.banners.heroList.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
                    >
                      <div className="aspect-[21/9] sm:aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={url}
                          alt={`Banner Slot ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-emerald-500/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            SLOT #{idx + 1}
                          </span>
                          <span className="font-mono text-[10px] text-slate-200">
                            Custom Banner
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {defaultStorePosters.map((p, idx) => (
                    <div
                      key={p.label}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
                    >
                      <div className="aspect-[21/9] sm:aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={p.img}
                          alt={p.label}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-pri/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            DEFAULT #{idx + 1}
                          </span>
                          <span className="truncate pl-1 font-mono text-[10px] text-slate-200">
                            {p.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder & Action Bottom Bar */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
              <div className="flex items-center gap-2">
                <Icon name="tips_and_updates" className="text-[20px] text-amber-600 shrink-0" />
                <p className="text-xs text-amber-950">
                  <strong>Pengingat Admin:</strong> Perbarui banner saat ada promo gajian, flash
                  sale, atau kampanye rakit PC baru agar homepage selalu relevan.
                </p>
              </div>
              <Link
                to="/admin/banner"
                className="adm-btn-pri inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold shrink-0"
              >
                <Icon name="tune" className="text-[14px]" />
                Atur Banner &amp; Promosi
              </Link>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peringatan Stok, Ulasan Pelanggan, & Status Kesehatan Data */}
        <div className="space-y-5 lg:col-span-5 xl:col-span-4">
          {/* Stok Menipis & Best Seller */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="adm-icon-chip red">
                <Icon name="warning" />
              </span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-on-surface">
                  Peringatan Stok Gudang
                </h3>
                <p className="adm-sub text-xs">Barang yang perlu di-restock</p>
              </div>
            </div>

            {dash?.top && (
              <div className="adm-mini-row mt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon name="trending_up" className="text-[18px] text-green-700 shrink-0" />
                  <p className="truncate text-xs font-bold text-on-surface">Top: {dash.top.name}</p>
                </div>
                <span className="adm-chip adm-chip-green shrink-0 text-[10px]">
                  {dash.top.sold} terjual
                </span>
              </div>
            )}

            <div className="mt-2 space-y-2">
              {(dash?.inv.low ?? []).map((p) => (
                <div key={p.id} className="adm-mini-row">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-on-surface">{p.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">{p.category}</p>
                  </div>
                  <span className="adm-chip adm-chip-red shrink-0 text-[10px]">Sisa {p.stock}</span>
                </div>
              ))}
              {dash && dash.inv.low.length === 0 && (
                <p className="adm-sub rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                  ✓ Seluruh stok barang aman.
                </p>
              )}
            </div>

            <Link
              to="/admin/produk"
              className="adm-btn-ghost mt-3 flex items-center justify-center gap-1 text-xs py-1.5 w-full"
            >
              Update Stok di Katalog
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>

          {/* Review Terbaru */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="adm-icon-chip green">
                  <Icon name="rate_review" />
                </span>
                <div>
                  <h3 className="font-heading text-[15px] font-bold text-on-surface">
                    Ulasan Pelanggan Terbaru
                  </h3>
                  <p className="adm-sub text-xs">Testimoni publik &amp; rating</p>
                </div>
              </div>
              {dash && (
                <span className="adm-chip adm-chip-slate text-[11px] font-mono">
                  {dash.counts.reviews} Total
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2.5">
              {(dash?.reviews.latest ?? []).map((r) => (
                <div key={r.id} className="rounded-xl bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-on-surface">{r.name}</p>
                    <span className="font-mono text-[10px] font-bold text-amber-600">
                      ★ {r.rating}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">“{r.title}”</p>
                  <p className="mt-1 font-mono text-[9px] text-slate-400">{r.date}</p>
                </div>
              ))}
            </div>

            <Link
              to="/admin/review"
              className="adm-btn-ghost mt-3 flex items-center justify-center gap-1 text-xs py-1.5 w-full"
            >
              Kelola Review
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>

          {/* Pemeriksaan Kesehatan Data (admin penuh saja) */}
          {!isReviewer() && (
            <div className="adm-card p-4 sm:p-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="adm-icon-chip teal">
                  <Icon name="health_and_safety" />
                </span>
                <div>
                  <h3 className="font-heading text-[15px] font-bold text-on-surface">
                    Kesehatan Sistem &amp; Data
                  </h3>
                  <p className="adm-sub text-xs">Validasi 5 dataset Zod &amp; sitemap</p>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {!results ? (
                  <p className="adm-sub text-xs">
                    Klik tombol di bawah untuk memeriksa integritas 5 file JSON data dan keunikan ID
                    katalog.
                  </p>
                ) : failed ? (
                  <div className="rounded-lg bg-red-50 p-2.5 text-red-800">
                    <p className="font-bold">Ada dataset yang tidak valid:</p>
                    <ul className="mt-1 list-disc pl-4 text-[11px]">
                      {results
                        .filter((r) => !r.ok)
                        .map((r) => (
                          <li key={r.file}>{r.file}</li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-lg bg-green-50 p-2.5 text-green-800">
                    <p className="font-bold">✓ Seluruh 5 dataset lolos validasi Zod.</p>
                    <p className="text-[11px] text-green-700">Sitemap dan link aman dari error.</p>
                  </div>
                )}
              </div>

              <button
                onClick={runValidate}
                disabled={busy === "validate"}
                className="adm-btn-ghost mt-3 w-full text-xs py-1.5 inline-flex items-center justify-center gap-1.5"
              >
                <Icon name="check_circle" className="text-[15px] text-pri" />
                {busy === "validate" ? "Memeriksa…" : "Jalankan Pemeriksaan Data"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- MODUL NAVIGASI (reviewer: hanya Transaksi) ---------- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-[16px] font-bold text-on-surface">
              {isReviewer() ? "Modul Verifikasi" : "Semua Modul Pengelolaan Toko"}
            </h2>
            <p className="adm-sub text-xs">
              {isReviewer()
                ? "Akses lihat-saja untuk tim verifikasi eksternal"
                : "Pilih modul untuk mengedit data secara visual"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {(isReviewer() ? modules.filter((m) => m.to === "/admin/order") : modules).map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="adm-card adm-tile p-4 sm:p-5 flex flex-col justify-between group hover:border-pri/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`adm-icon-chip${m.chip ? ` ${m.chip}` : ""}`}>
                    <Icon name={m.icon} className="text-[22px]" />
                  </span>
                  {m.count !== undefined && (
                    <span className="adm-chip adm-chip-slate font-mono text-[11px]">
                      {m.count} {m.unit}
                    </span>
                  )}
                </div>
                <p className="font-heading mt-3 text-base font-bold text-on-surface group-hover:text-pri transition-colors">
                  {m.label}
                </p>
                <p className="adm-sub mt-1 text-xs leading-relaxed">{m.desc}</p>
              </div>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-pri border-t border-slate-100 pt-2.5">
                Buka Pengelola
                <Icon
                  name="arrow_forward"
                  className="text-[14px] transition-transform group-hover:translate-x-1"
                />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- git panel (mode teknis, admin penuh saja) ---------- */}
      {!easy && !isReviewer() && (
        <section className="adm-card p-4 sm:p-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="adm-icon-chip violet">
              <Icon name="terminal" />
            </span>
            <div>
              <p className="adm-eyebrow">Mode Teknis</p>
              <h2 className="font-heading text-lg font-bold text-on-surface">
                Git &amp; Deployment
              </h2>
            </div>
          </div>
          {git ? (
            <div className="mt-3 text-xs space-y-2">
              <p className="text-slate-600">
                Branch: <code className="font-bold text-pri">{git.branch}</code> • Environment:{" "}
                <code>{env || "development"}</code> •{" "}
                {git.dirty.length === 0 ? (
                  <span className="text-green-700 font-semibold">✓ Working tree bersih</span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    {git.dirty.length} file data berubah
                  </span>
                )}
              </p>
              {git.dirty.length > 0 && (
                <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] border border-slate-200">
                  {git.dirty.join("\n")}
                </pre>
              )}
              <p className="pt-2 font-bold text-on-surface">10 Commit Terakhir di Repositori:</p>
              <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] border border-slate-200">
                {git.log.join("\n") || "(kosong)"}
              </pre>
            </div>
          ) : (
            <p className="adm-sub mt-2 text-xs">Memuat status git…</p>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pesan commit rilis, misal: update harga hardisk & laptop"
              className="adm-input flex-1 text-xs"
            />
            <button
              onClick={() => commitPush(message)}
              disabled={busy === "git" || message.trim().length < 5}
              className="adm-btn-pri text-xs font-semibold px-5"
            >
              {busy === "git" ? "Memproses…" : "Commit & Push"}
            </button>
          </div>
          <p className="adm-sub mt-1.5 text-[11px]">
            Tindakan ini akan me-<code>git add src/data public/sitemap*.xml</code>, melakukan
            commit, dan me-push ke GitHub untuk memicu auto-deploy Vercel.
          </p>
        </section>
      )}
    </div>
  );
}
