import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";

export const Route = createFileRoute("/admin/jual")({
  component: AdminJual,
});

type JualGalleryItem = {
  img: string;
  title: string;
  chip: string;
  note: string;
};

type JualAssetsData = {
  hero: string;
  heroStack: string[];
  heroCaption: string;
  gallery: JualGalleryItem[];
};

const inputCls = "adm-input";

export function AdminJual() {
  const [file, setFile] = useState<JualAssetsData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmingGalleryIndex, setConfirmingGalleryIndex] = useState<number | null>(null);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "jualAssets" } })
      .then((r) => setFile(r.data as JualAssetsData))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // Pastikan heroStack minimal 3 item sesuai skema
      const stack = file.heroStack.map((h) => h.trim()).filter(Boolean);
      while (stack.length < 3) {
        stack.push(file.hero || "https://picsum.photos/seed/buana-hero/900/1100");
      }

      const next: JualAssetsData = {
        hero: file.hero.trim() || stack[0] || "",
        heroStack: stack.slice(0, 3),
        heroCaption: file.heroCaption.trim(),
        gallery: file.gallery.map((g) => ({
          img: g.img.trim(),
          title: g.title.trim(),
          chip: g.chip.trim(),
          note: g.note.trim(),
        })),
      };

      await adminSaveDataset({ data: { token: token(), name: "jualAssets", data: next } });
      setFile(next);
      setNotice("Tersimpan ke jualAssets.json! Jangan lupa klik 'Terbitkan' di atas agar live.");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const setHeroStackSlot = (idx: number, url: string) => {
    if (!file) return;
    const nextStack = [...file.heroStack];
    nextStack[idx] = url;
    setFile({ ...file, heroStack: nextStack });
  };

  const updateGalleryItem = (idx: number, patch: Partial<JualGalleryItem>) => {
    if (!file) return;
    const nextGallery = [...file.gallery];
    nextGallery[idx] = { ...nextGallery[idx], ...patch };
    setFile({ ...file, gallery: nextGallery });
  };

  const addGalleryItem = () => {
    if (!file) return;
    const newItem: JualGalleryItem = {
      img: "https://picsum.photos/seed/buana-gal-new/640/480",
      title: "Komponen Baru Masuk Lab",
      chip: "GRADE D • MATOT",
      note: "Keterangan taksiran dan bagian yang diselamatkan di lab.",
    };
    setFile({ ...file, gallery: [...file.gallery, newItem] });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Portal Aset Halaman /jual</p>
          <h1 className="adm-h1 mt-1">Aset &amp; Galeri Buyback</h1>
          <p className="adm-sub mt-1">
            Kelola 3 foto hero efek kipas, teks caption, dan kartu galeri barang terima masuk lab.
          </p>
        </div>
        <button
          onClick={save}
          disabled={busy || !file}
          className="adm-btn-pri inline-flex items-center gap-1.5"
        >
          <AdminIcon name="save" className="text-[18px]" />
          {busy ? "Menyimpan…" : "Simpan Aset Jual"}
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      {/* Hero 3-Photo Stack Section */}
      <section className="adm-card p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-on-surface">
              Hero Stack (3 Foto Fan-Out Hover)
            </h2>
            <p className="adm-sub">
              Tiga foto portrait bertumpuk di sebelah teks hero /jual. Saat cursor mendekat, foto
              belakang miring ke kiri &amp; kanan seperti kipas.
            </p>
          </div>
          <span className="adm-chip adm-chip-blue font-mono">3 Slot Portrait</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((idx) => {
            const labels = [
              "Foto 1 (Tengah / Depan)",
              "Foto 2 (Miring Kiri)",
              "Foto 3 (Miring Kanan)",
            ];
            const currentUrl = file?.heroStack[idx] ?? "";
            return (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="adm-chip adm-chip-blue font-mono text-[11px]">
                    {labels[idx]}
                  </span>
                </div>
                {/^https?:\/\//i.test(currentUrl.trim()) && (
                  <div className="relative mx-auto mb-3 aspect-[3/4] w-32 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                    <img
                      src={currentUrl.trim()}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <ImageField
                  label={`URL ${labels[idx]}`}
                  value={currentUrl}
                  onChange={(url) => setHeroStackSlot(idx, url)}
                  hint="Rasio portrait disarankan 3:4 atau 900x1100."
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="adm-label mb-1">Teks Caption Hero</label>
            <input
              value={file?.heroCaption ?? ""}
              onChange={(e) => file && setFile({ ...file, heroCaption: e.target.value })}
              placeholder="Contoh: Lab &amp; Workshop Buana Computer — Bantul"
              className={inputCls}
            />
          </div>
          <div>
            <ImageField
              label="Foto Hero Fallback (Cadangan)"
              value={file?.hero ?? ""}
              onChange={(url) => file && setFile({ ...file, hero: url })}
              hint="Ditampilkan jika browser tidak mendukung stack."
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="adm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-on-surface">
              Galeri Barang Masuk Lab ({file?.gallery.length ?? 0} Kartu)
            </h2>
            <p className="adm-sub">
              Kartu carousel barang yang pernah dijual ke Buana Computer beserta grade dan nilai
              taksirannya.
            </p>
          </div>
          <button
            onClick={addGalleryItem}
            className="adm-btn-ghost inline-flex items-center gap-1 py-1.5 text-xs"
          >
            <AdminIcon name="add" className="text-[15px]" />
            Tambah Kartu Galeri
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(file?.gallery ?? []).map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="adm-chip adm-chip-slate font-mono text-[11px]">#{idx + 1}</span>
                  <button
                    onClick={() => setConfirmingGalleryIndex(idx)}
                    className="adm-btn-danger inline-flex items-center gap-1 py-1"
                  >
                    <AdminIcon name="delete" className="text-[13px]" />
                    Hapus
                  </button>
                </div>

                {/^https?:\/\//i.test(item.img.trim()) && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={item.img.trim()}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <ImageField
                  label="Foto Barang"
                  value={item.img}
                  onChange={(url) => updateGalleryItem(idx, { img: url })}
                  hint="Rasio 4:3 disarankan."
                />

                <div>
                  <label className="adm-label mb-1">Judul Barang</label>
                  <input
                    value={item.title}
                    onChange={(e) => updateGalleryItem(idx, { title: e.target.value })}
                    placeholder="Contoh: Bangkai Laptop Core i5 Matot"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="adm-label mb-1">Chip Grade</label>
                  <input
                    value={item.chip}
                    onChange={(e) => updateGalleryItem(idx, { chip: e.target.value })}
                    placeholder="Contoh: GRADE D • MATOT"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="adm-label mb-1">Catatan / Nilai Terima</label>
                  <textarea
                    rows={2}
                    value={item.note}
                    onChange={(e) => updateGalleryItem(idx, { note: e.target.value })}
                    placeholder="Contoh: Keyboard &amp; heatsink di-save, dibayar Rp 200-600rb."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Mode: Raw JSON */}
      {!isEasyMode(adminMode) && file && (
        <JsonEditor
          name="jualAssets"
          title="Data jualAssets.json"
          data={file}
          onReloaded={(d) => setFile(d as JualAssetsData)}
        />
      )}

      {confirmingGalleryIndex !== null && (
        <ConfirmDialog
          title={`Hapus Kartu Galeri #${confirmingGalleryIndex + 1}?`}
          message="Kartu galeri ini akan dihapus dari carousel. Perubahan permanen saat Simpan Aset Jual."
          onCancel={() => setConfirmingGalleryIndex(null)}
          onConfirm={() => {
            if (file) {
              setFile({
                ...file,
                gallery: file.gallery.filter((_, j) => j !== confirmingGalleryIndex),
              });
            }
            setConfirmingGalleryIndex(null);
          }}
        />
      )}
    </div>
  );
}
