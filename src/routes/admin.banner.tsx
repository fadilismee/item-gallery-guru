import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";

export const Route = createFileRoute("/admin/banner")({
  component: AdminBanner,
});

type BannerFile = { hero: string[]; footer: string };

function AdminBanner() {
  const [file, setFile] = useState<BannerFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<number | null>(null);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "banners" } })
      .then((r) => setFile(r.data as BannerFile))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next: BannerFile = {
        hero: file.hero.map((h) => h.trim()).filter(Boolean),
        footer: file.footer,
      };
      await adminSaveDataset({ data: { token: token(), name: "banners", data: next } });
      setFile(next);
      setNotice("Tersimpan ke banners.json. Jangan lupa Terbitkan agar live.");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Portal Kendali Konten Publik & Kampanye</p>
          <h1 className="adm-h1 mt-1">Banner & Promosi Toko</h1>
          <p className="adm-sub mt-1">
            Unggah banner promosi format <strong>WebP HD</strong> yang otomatis dinamai{" "}
            <code>Buanacomputer-*.webp</code> dan disimpan langsung di repositori untuk di-push ke
            GitHub (tanpa perlu link luar).
          </p>
        </div>
        <button
          onClick={save}
          disabled={busy || !file}
          className="adm-btn-pri inline-flex items-center gap-1.5"
        >
          <AdminIcon name="save" className="text-[18px]" />
          {busy ? "Menyimpan…" : "Simpan Banner"}
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      <section className="adm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-extrabold">Slot Hero Slider Homepage</h2>
            <p className="adm-sub">
              {file?.hero.length ?? 0} banner terpasang • Format WebP HD Git-Direct
            </p>
          </div>
          <button
            onClick={() => file && setFile({ ...file, hero: [...file.hero, ""] })}
            className="adm-btn-ghost inline-flex items-center gap-1 py-1.5 text-xs"
          >
            <AdminIcon name="add" className="text-[15px]" />
            Tambah Banner Baru
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {(file?.hero ?? []).map((h, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="adm-chip adm-chip-blue font-mono">
                  Slot #{i + 1} • {h ? "Aktif Tayang" : "Menunggu Gambar"}
                </span>
                <button
                  onClick={() => setConfirming(i)}
                  className="adm-btn-danger inline-flex items-center gap-1"
                >
                  <AdminIcon name="delete" className="text-[14px]" />
                  Hapus
                </button>
              </div>
              {(h.trim().startsWith("/") || /^https?:\/\//i.test(h.trim())) && (
                <div className="relative mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
                  <img src={h.trim()} alt="" loading="lazy" className="h-32 w-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-2 py-0.5 font-mono text-[10px] text-white">
                    {h.trim()}
                  </span>
                </div>
              )}
              <div className="mt-2">
                <ImageField
                  label={`Gambar slide ${i + 1}`}
                  value={h}
                  bannerMode={true}
                  onChange={(url) => {
                    if (!file) return;
                    const hero = [...file.hero];
                    hero[i] = url;
                    setFile({ ...file, hero });
                  }}
                  hint="Otomatis dikonversi ke WebP HD & tersimpan di public/banners/Buanacomputer-*.webp."
                />
              </div>
            </div>
          ))}
        </div>
        {(file?.hero.length ?? 0) === 0 && (
          <p className="adm-sub mt-2">
            Kosong — homepage saat ini memakai 3 poster bawaan toko (Buanacomputer-poster1/2/3.jpg).
            Klik tombol &quot;Tambah Banner Baru&quot; di atas untuk memasang banner promo kustom.
          </p>
        )}
      </section>

      <section className="adm-card p-4 sm:p-5">
        <h2 className="font-heading text-lg font-extrabold">Footer / Banner Tambahan</h2>
        <div className="mt-2">
          <ImageField
            label="Gambar banner footer"
            value={file?.footer ?? ""}
            bannerMode={true}
            onChange={(url) => file && setFile({ ...file, footer: url })}
            hint="Format WebP HD tersimpan langsung di repositori."
          />
        </div>
      </section>

      {!isEasyMode(adminMode) && file && (
        <JsonEditor
          name="banners"
          title="Data banners.json"
          data={file}
          onReloaded={(d) => setFile(d as BannerFile)}
        />
      )}
      {confirming !== null && (
        <ConfirmDialog
          title={`Hapus Slot #${confirming + 1}?`}
          message="Slot banner dihapus dari daftar. Perubahan tersimpan permanen saat Simpan Banner."
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            if (file) setFile({ ...file, hero: file.hero.filter((_, j) => j !== confirming) });
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
}
