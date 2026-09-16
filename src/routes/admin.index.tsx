import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { adminGitCommitPush, adminGitStatus, adminStatus, adminValidate } from "@/server/admin";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type { ValidationResult } from "@/lib/validateAll";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type GitInfo = { branch: string; dirty: string[]; log: string[] };
type DashData = Awaited<ReturnType<typeof adminStatus>>;

const EASY_COMMIT_MESSAGE = "Update konten via dashboard (mode mudah)";

const fmtRpShort = (v: number) => {
  if (v >= 1_000_000_000)
    return `Rp ${(v / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (v >= 1_000_000)
    return `Rp ${(v / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
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
}) {
  return (
    <div className="adm-card adm-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="adm-stat-label">{eyebrow}</p>
          <h3 className="font-heading mt-0.5 text-[15px] leading-tight font-bold">{title}</h3>
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
        {desc && <p className="adm-sub mt-1 truncate">{desc}</p>}
      </div>
      <div className="adm-foot-row">
        <span className={footLeftClass ?? "text-pri"}>{footLeft}</span>
        {footRight && <span className="truncate text-slate-400">{footRight}</span>}
      </div>
    </div>
  );
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
    (f) => f.includes("src/data") || f.includes("sitemap.xml"),
  );

  const tiles = [
    {
      to: "/admin/produk",
      icon: "inventory_2",
      chip: "",
      label: "Produk & Katalog",
      desc: "Tambah / ubah / hapus barang dagangan",
      count: dash?.counts.products,
    },
    {
      to: "/admin/blog",
      icon: "auto_stories",
      chip: "violet",
      label: "Buana Journal (Blog)",
      desc: "Tulis & sunting artikel",
      count: dash?.counts.articles,
    },
    {
      to: "/admin/harga",
      icon: "currency_exchange",
      chip: "teal",
      label: "Harga Jual",
      desc: "Price list buyback & taksiran",
      count: undefined,
    },
    {
      to: "/admin/review",
      icon: "rate_review",
      chip: "green",
      label: "Review & Testimoni",
      desc: "Testimoni pembeli",
      count: dash?.counts.reviews,
    },
    {
      to: "/admin/banner",
      icon: "campaign",
      chip: "red",
      label: "Banner Promosi",
      desc: "Gambar slide depan",
      count: undefined,
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
    <div className="space-y-4">
      {/* ---------- hero ---------- */}
      <section className="adm-card adm-hero p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="adm-chip adm-chip-blue">Operational Console</span>
              <span className="adm-sub inline-flex items-center gap-1">
                <Icon name="schedule" className="text-[15px]" />
                {today} • Toko Bantul
              </span>
            </div>
            <h1 className="adm-h1 mt-2">Selamat Datang, Admin Buana</h1>
            <p className="adm-sub mt-1">
              Sinkronisasi katalog, price list buyback, dan konten Buana Journal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/produk" className="adm-btn-ghost inline-flex items-center gap-1.5">
              <Icon name="add_shopping_cart" className="text-[18px] text-pri" />
              Tambah Produk
            </Link>
            <Link to="/admin/blog" className="adm-btn-ghost inline-flex items-center gap-1.5">
              <Icon name="edit_note" className="text-[18px] text-pri" />
              Artikel Journal
            </Link>
            <Link to="/admin/harga" className="adm-btn-pri inline-flex items-center gap-1.5">
              <Icon name="currency_exchange" className="text-[18px]" />
              Update Price List
            </Link>
          </div>
        </div>
      </section>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok whitespace-pre-wrap">{notice}</p>}

      {/* ---------- stat cards ---------- */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          eyebrow="Katalog Unit"
          title="Total Produk Aktif"
          icon="inventory_2"
          value={dash ? `${dash.counts.products}` : "…"}
          unit="SKU terverifikasi"
          desc={catsDesc}
          footLeft={
            dash ? (dash.inv.lowCount > 0 ? `${dash.inv.lowCount} Stok Kritis` : "Stok aman") : "…"
          }
          footLeftClass={dash && dash.inv.lowCount > 0 ? "text-red-700" : "text-green-700"}
          footRight={dash ? `${dash.inv.featured} unggulan` : undefined}
        />
        <StatCard
          eyebrow="Modal Toko"
          title="Nilai Inventaris"
          icon="payments"
          chip="teal"
          value={dash ? fmtRpShort(dash.inv.value) : "…"}
          unit="harga × stok"
          desc={dash ? `${dash.inv.ready} unit siap jual` : "Memuat…"}
          footLeft={dash ? `${dash.inv.sold} unit terjual` : "…"}
          footRight="Estimasi aset"
        />
        <StatCard
          eyebrow="Editorial Lab"
          title="Buana Journal"
          icon="auto_stories"
          chip="violet"
          value={dash ? `${dash.counts.articles}` : "…"}
          unit="artikel terbit"
          desc={dash?.blog.latest[0]?.title ?? "Memuat…"}
          footLeft={dash ? `${dash.blog.totalMinutes} mnt baca` : "…"}
          footRight={dash?.blog.latest[0]?.date}
        />
        <StatCard
          eyebrow="Kepuasan Servis"
          title="Rating & Review"
          icon="verified"
          chip="green"
          value={dash ? dash.reviews.avg.toFixed(1) : "…"}
          unit="/ 5.0 ★"
          desc={dash ? `${dash.counts.reviews} ulasan masuk` : "Memuat…"}
          footLeft={
            dash?.reviews.latest[0] ? `Terbaru: ${firstName(dash.reviews.latest[0].name)}` : "…"
          }
          footRight={dash?.reviews.latest[0]?.date}
        />
        <StatCard
          eyebrow="Promosi Digital"
          title="Banner Promosi"
          icon="campaign"
          chip="red"
          value={dash ? `${dash.banners.hero}` : "…"}
          unit="slot live aktif"
          desc={
            dash
              ? dash.banners.hero === 0
                ? "Pakai gambar bawaan"
                : "Tayang di homepage"
              : "Memuat…"
          }
          footLeft={dash ? `${dash.sell.items} item buyback` : "…"}
          footRight={dash ? `${dash.sell.rows} baris harga` : undefined}
        />
      </section>

      {/* ---------- publish ---------- */}
      {contentDirty.length > 0 && (
        <section className="adm-card flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50/60 p-4">
          <p className="flex items-center gap-2 text-sm text-green-900">
            <Icon name="rocket_launch" className="text-[22px] text-green-700" />
            <span>
              Ada <strong>{contentDirty.length} perubahan</strong> belum terbit — pengunjung web
              belum melihatnya.
            </span>
          </p>
          <button
            onClick={() => commitPush(EASY_COMMIT_MESSAGE)}
            disabled={busy === "git"}
            className="adm-btn-green inline-flex items-center gap-1.5 px-6 py-2.5 text-base"
          >
            <Icon name="rocket_launch" className="text-[20px]" />
            {busy === "git" ? "Menerbitkan…" : "Terbitkan Sekarang"}
          </button>
        </section>
      )}

      {/* ---------- main grid ---------- */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        {/* performa konten */}
        <div className="adm-card p-4 sm:p-5 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="adm-icon-chip teal">
                <Icon name="insights" />
              </span>
              <div>
                <h2 className="font-heading text-[16px] font-bold">Performa Konten & Jurnal</h2>
                <p className="adm-sub">Artikel terbaru • metrik pembaca</p>
              </div>
            </div>
            {dash && (
              <span className="adm-chip adm-chip-blue">{dash.blog.totalMinutes} mnt total</span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(dash?.blog.latest ?? []).map((a, i) => (
              <article key={a.slug} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`adm-chip ${tagChip(a.tagTone)}`}>{a.tag}</span>
                  <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold text-slate-500">
                    <Icon name="schedule" className="text-[13px]" />
                    {a.readMinutes} mnt
                  </span>
                </div>
                <h4 className="font-heading mt-2 line-clamp-2 min-h-[2.6em] text-[14px] leading-snug font-bold">
                  {a.title}
                </h4>
                <div className="mt-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">{a.readers}</span>
                    <span className="font-bold text-pri">{a.pct}%</span>
                  </div>
                  <div className="adm-bar-track mt-1">
                    <div className={`adm-bar-fill ${barTone(i)}`} style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
                <p className="mt-2 font-mono text-[10px] text-slate-400">{a.date}</p>
              </article>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="adm-sub">Kelola seluruh artikel & tulis panduan baru.</p>
            <Link
              to="/admin/blog"
              className="adm-btn-pri inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              Kelola Blog
              <Icon name="arrow_forward" className="text-[15px]" />
            </Link>
          </div>
        </div>

        {/* sisi kanan */}
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-4">
          {/* stok */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="adm-icon-chip red">
                <Icon name="warning" />
              </span>
              <div>
                <h3 className="font-heading text-[16px] font-bold">Stok Menipis & Terlaris</h3>
                <p className="adm-sub">Peringatan restock gudang</p>
              </div>
            </div>
            {dash?.top && (
              <div className="adm-mini-row mt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon name="trending_up" className="text-[18px] text-green-700" />
                  <p className="truncate text-[13px] font-bold">{dash.top.name}</p>
                </div>
                <span className="adm-chip adm-chip-green shrink-0">{dash.top.sold} terjual</span>
              </div>
            )}
            <div className="mt-2 space-y-2">
              {(dash?.inv.low ?? []).map((p) => (
                <div key={p.id} className="adm-mini-row">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold">{p.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">{p.category}</p>
                  </div>
                  <span className="adm-chip adm-chip-red shrink-0">Sisa {p.stock}</span>
                </div>
              ))}
              {dash && dash.inv.low.length === 0 && (
                <p className="adm-sub rounded-lg bg-green-50 px-3 py-2 text-green-800">
                  Semua stok aman — tidak ada yang kritis.
                </p>
              )}
            </div>
            <Link
              to="/admin/produk"
              className="adm-btn-ghost mt-3 flex items-center justify-center gap-1"
            >
              Kelola Produk
              <Icon name="arrow_forward" className="text-[15px]" />
            </Link>
          </div>

          {/* review */}
          <div className="adm-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="adm-icon-chip green">
                  <Icon name="rate_review" />
                </span>
                <div>
                  <h3 className="font-heading text-[16px] font-bold">Review Terbaru</h3>
                  <p className="adm-sub">Ulasan publik & rating</p>
                </div>
              </div>
              {dash && <span className="adm-chip adm-chip-slate">{dash.counts.reviews}</span>}
            </div>
            <div className="mt-3 space-y-2">
              {(dash?.reviews.latest ?? []).map((r) => (
                <div key={r.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-bold">{r.name}</p>
                    <span className="font-mono text-[11px] font-bold text-amber-600">
                      ★ {r.rating}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-600">“{r.title}”</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">{r.date}</p>
                </div>
              ))}
            </div>
            <Link
              to="/admin/review"
              className="adm-btn-ghost mt-3 flex items-center justify-center gap-1"
            >
              Kelola Review
              <Icon name="arrow_forward" className="text-[15px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- tiles ---------- */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="adm-card adm-tile p-5">
            <span className={`adm-icon-chip${t.chip ? ` ${t.chip}` : ""}`}>
              <Icon name={t.icon} className="text-[22px]" />
            </span>
            <p className="font-heading mt-2 text-lg font-bold">
              {t.label}
              {t.count !== undefined && (
                <span className="adm-chip adm-chip-slate ml-2">{t.count}</span>
              )}
            </p>
            <p className="adm-sub mt-0.5">{t.desc}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-pri">
              Kelola
              <Icon name="arrow_forward" className="text-[16px]" />
            </p>
          </Link>
        ))}
        <div className="adm-card p-5">
          <span className="adm-icon-chip teal">
            <Icon name="health_and_safety" className="text-[22px]" />
          </span>
          <p className="font-heading mt-2 text-lg font-bold">Kesehatan Data</p>
          {!results ? (
            <p className="adm-sub mt-0.5">Sistem memeriksa semua data otomatis.</p>
          ) : failed ? (
            <p className="mt-0.5 text-sm text-red-700">
              Perlu diperbaiki:{" "}
              {results
                .filter((r) => !r.ok)
                .map((r) => r.file)
                .join(", ")}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-green-700">
              Aman ({results.length} pemeriksaan lolos).
            </p>
          )}
          <button
            onClick={runValidate}
            disabled={busy === "validate"}
            className="adm-btn-ghost mt-3"
          >
            {busy === "validate" ? "Memeriksa…" : easy ? "Periksa Data" : "Jalankan Validasi"}
          </button>
          {!easy && results && (
            <ul className="mt-3 space-y-1 text-sm">
              {results.map((r) => (
                <li key={r.file} className={r.ok ? "text-green-700" : "text-red-700"}>
                  {r.ok ? "✓" : "✗"} {r.file}
                  {r.issues.map((i) => (
                    <span key={i} className="block pl-5 text-xs">
                      - {i}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- git (advanced) ---------- */}
      {!easy && (
        <section className="adm-card p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="adm-icon-chip violet">
              <Icon name="terminal" />
            </span>
            <div>
              <p className="adm-eyebrow">Mode Teknis</p>
              <h2 className="font-heading text-lg font-bold">Git</h2>
            </div>
          </div>
          {git ? (
            <div className="mt-2 text-sm">
              <p>
                Branch: <code>{git.branch}</code> • Env: <code>{env || "…"}</code> •{" "}
                {git.dirty.length === 0
                  ? "working tree bersih"
                  : `${git.dirty.length} file berubah`}
              </p>
              {git.dirty.length > 0 && (
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-slate-50 p-2 font-mono text-xs">
                  {git.dirty.join("\n")}
                </pre>
              )}
              <p className="mt-3 font-medium">10 commit terakhir:</p>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-slate-50 p-2 font-mono text-xs">
                {git.log.join("\n") || "(kosong)"}
              </pre>
            </div>
          ) : (
            <p className="adm-sub mt-2">Memuat status git…</p>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pesan commit, mis: admin: tambah produk X"
              className="adm-input flex-1"
            />
            <button
              onClick={() => commitPush(message)}
              disabled={busy === "git" || message.trim().length < 5}
              className="adm-btn-pri"
            >
              {busy === "git" ? "Memproses…" : "Commit & Push"}
            </button>
          </div>
          <p className="adm-sub mt-1">
            Commit mencakup <code>src/data</code> + <code>public/sitemap.xml</code>, lalu push
            (trigger deploy Vercel).
          </p>
        </section>
      )}
    </div>
  );
}
