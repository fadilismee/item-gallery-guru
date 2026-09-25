import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { adminGitCommitPush, adminGitStatus } from "@/server/admin";
import { clearAdminToken, errMsg, getAdminToken } from "@/lib/adminClient";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  // NOTE: parent tidak me-render konten halaman — hanya shell + <Outlet/>.
  // Jangan taruh konten /admin di sini (akan menimpa child). Isi dashboard ada di admin.index.tsx.
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/produk", label: "Katalog Produk", icon: "inventory_2", end: false },
  { to: "/admin/order", label: "Transaksi", icon: "receipt_long", end: false },
  { to: "/admin/payment", label: "Pembayaran", icon: "payments", end: false },
  { to: "/admin/blog", label: "Buana Journal", icon: "auto_stories", end: false },
  { to: "/admin/review", label: "Review Toko", icon: "rate_review", end: false },
  { to: "/admin/banner", label: "Banner Promo", icon: "campaign", end: false },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = useAdminMode((s) => s.mode);
  const toggleMode = useAdminMode((s) => s.toggle);
  const easy = isEasyMode(mode);
  const [ready, setReady] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [pubMsg, setPubMsg] = useState("");

  useEffect(() => {
    if (!getAdminToken()) {
      navigate({ to: "/admin-login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  const refreshDirty = useCallback(async () => {
    try {
      const g = await adminGitStatus({ data: { token: getAdminToken() ?? "" } });
      setDirtyCount(
        g.dirty.filter(
          (f) =>
            f.includes("src/data") ||
            f.includes("sitemap") ||
            f.includes("public/banners") ||
            f.includes("banners"),
        ).length,
      );
    } catch {
      // diamkan: git tidak tersedia / belum login penuh
    }
  }, []);

  useEffect(() => {
    if (ready) void refreshDirty();
  }, [ready, pathname, refreshDirty]);

  const publishEasy = async () => {
    setPublishing(true);
    setPubMsg("");
    try {
      const r = await adminGitCommitPush({
        data: { token: getAdminToken() ?? "", message: "Update konten via dashboard (mode mudah)" },
      });
      setPubMsg(
        r.pushed ? "Terbit! Perubahan sudah live (±1 menit)." : "Tidak ada yang perlu diterbitkan.",
      );
      await refreshDirty();
    } catch (e) {
      setPubMsg(`Gagal terbitkan: ${errMsg(e)}`);
    } finally {
      setPublishing(false);
    }
  };

  if (!ready) {
    return (
      <div className="adm-page flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Memeriksa sesi admin…</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <header className="adm-topbar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <div className="mr-1 leading-none">
            <p className="font-heading text-[15px] font-extrabold text-on-surface">Buana Admin</p>
            <p className="font-monotech text-[9px] font-bold uppercase tracking-[0.18em] text-outline">
              Portal Lab & Media
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:order-last">
            <button
              onClick={toggleMode}
              title={easy ? "Pindah ke mode teknis (JSON + git)" : "Pindah ke mode mudah"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 sm:py-1.5 ${
                easy
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-slate-400 bg-slate-800 text-white"
              }`}
            >
              <span className="adm-icon text-[15px]">
                {easy ? "sentiment_satisfied" : "terminal"}
              </span>
              <span className="hidden sm:inline">{easy ? "Mode Mudah" : "Mode Teknis"}</span>
            </button>
            {easy && (
              <button
                onClick={publishEasy}
                disabled={publishing || dirtyCount === 0}
                title="Commit + push semua perubahan konten (deploy Vercel)"
                className="adm-btn-green inline-flex items-center gap-1 px-2.5 py-1 text-xs disabled:opacity-50 sm:px-3 sm:py-1.5"
              >
                <span className="adm-icon text-[15px]">
                  {dirtyCount > 0 ? "rocket_launch" : "check_circle"}
                </span>
                <span className="hidden sm:inline">
                  {publishing
                    ? "Menerbitkan…"
                    : dirtyCount > 0
                      ? `Terbitkan (${dirtyCount})`
                      : "Sudah Terbit"}
                </span>
                <span className="sm:hidden">
                  {publishing ? "…" : dirtyCount > 0 ? `(${dirtyCount})` : ""}
                </span>
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-high hover:text-foreground sm:px-3 sm:py-1.5"
            >
              <span className="adm-icon text-[15px]">storefront</span>
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>
            <button
              onClick={() => {
                clearAdminToken();
                navigate({ to: "/admin-login" });
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-high sm:px-3 sm:py-1.5"
            >
              <span className="adm-icon text-[15px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

          <nav className="order-last flex w-full items-center gap-1 overflow-x-auto pb-1 pt-1 md:order-none md:w-auto md:flex-wrap md:overflow-visible md:py-0 scrollbar-none">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.end }}
                activeProps={{ className: "adm-nav-active" }}
                className="adm-navlink text-xs sm:text-[13px] px-2.5 py-1.5 sm:px-3.5 sm:py-2"
              >
                <span className="adm-icon text-[15px]">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        {easy && pubMsg && (
          <p className="mx-auto max-w-7xl px-4 pb-2 text-xs text-muted-foreground">{pubMsg}</p>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Child route (dashboard / editor) render di sini */}
        <Outlet />
      </main>
    </div>
  );
}
