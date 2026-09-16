import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type { ReviewReel } from "@/data/reviews";

export const Route = createFileRoute("/admin/review")({
  component: AdminReview,
});

const blankReview = (): ReviewReel => ({
  id: "",
  name: "",
  rating: 5,
  title: "",
  text: "",
  mediaType: "image",
  mediaUrl: "",
  date: "",
});

const inputCls = "adm-input mt-1";
const labelCls = "adm-label";

function AdminReview() {
  const [list, setList] = useState<ReviewReel[]>([]);
  const [editing, setEditing] = useState<ReviewReel | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "reviews" } })
      .then((r) => setList(r.data as ReviewReel[]))
      .catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(() => {
    if (!editing) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [editing]);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const cleaned: ReviewReel = {
        ...editing,
        productLabel: editing.productLabel?.trim() || undefined,
      };
      const next = isNew
        ? [...list, cleaned]
        : list.map((r) => (r.id === editing.id ? cleaned : r));
      await adminSaveDataset({ data: { token: token(), name: "reviews", data: next } });
      setList(next);
      setEditing(null);
      setNotice(`Tersimpan: ${cleaned.id}. Jangan lupa Terbitkan agar live.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const next = list.filter((r) => r.id !== id);
      await adminSaveDataset({ data: { token: token(), name: "reviews", data: next } });
      setList(next);
      setNotice(`Terhapus: ${id}.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  const editIssues = !editing
    ? []
    : ([
        isNew && !editing.id.trim() && "ID",
        !editing.name.trim() && "Nama",
        !editing.title.trim() && "Judul",
        !editing.text.trim() && "Isi",
        !editing.mediaUrl.trim() && "Media",
        !editing.date.trim() && "Tanggal",
      ].filter(Boolean) as string[]);

  const avg = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : "–";
  const five = list.filter((r) => r.rating >= 4.5).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Portal Kendali Konten Publik</p>
          <h1 className="adm-h1 mt-1">Review & Testimoni</h1>
          <p className="adm-sub mt-1">
            Kelola {list.length} testimoni pembeli yang tampil di web publik.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(blankReview());
            setIsNew(true);
            setError("");
            setNotice("");
          }}
          className="adm-btn-pri"
        >
          + Tambah Review
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Skor Kepuasan</p>
          <p className="adm-stat-num mt-1">
            {avg} <span className="text-base font-bold text-muted-foreground">/ 5.0</span>
          </p>
          <p className="adm-stat-foot mt-1">{list.length} ulasan valid</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Bintang 4.5+</p>
          <p className="adm-stat-num mt-1 text-pri">{five}</p>
          <p className="adm-stat-foot mt-1">Ulasan sangat puas</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Total Ulasan</p>
          <p className="adm-stat-num mt-1">{list.length}</p>
          <p className="adm-stat-foot mt-1">Tampil di homepage</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <article key={r.id} className="adm-card flex flex-col p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pri/10 text-lg font-extrabold text-pri">
                {(r.name.charAt(0) || "?").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.date}
                  {r.productLabel ? ` • ${r.productLabel}` : ""}
                </p>
              </div>
              <span className="adm-chip adm-chip-blue ml-auto">★ {r.rating}</span>
            </div>
            <p className="mt-2 text-sm font-semibold">{r.title}</p>
            <p className="adm-sub mt-1 line-clamp-3 flex-1">“{r.text}”</p>
            {r.mediaType === "image" && r.mediaUrl ? (
              <img
                src={r.mediaUrl}
                alt=""
                loading="lazy"
                className="mt-2 h-20 w-full rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <p className="mt-2">
                <span className="adm-chip adm-chip-slate">{r.mediaType}</span>
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setEditing({ ...r });
                  setIsNew(false);
                  setError("");
                  setNotice("");
                }}
                className="adm-btn-ghost inline-flex flex-1 items-center justify-center gap-1 py-1.5 text-xs"
              >
                <AdminIcon name="edit" className="text-[14px]" />
                Edit
              </button>
              <button
                onClick={() => setConfirming(r.id)}
                disabled={busy}
                className="adm-btn-danger inline-flex items-center gap-1 px-3 py-1.5"
              >
                <AdminIcon name="delete" className="text-[14px]" />
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <div className="adm-card p-8 text-center">
          <span className="adm-icon-chip mx-auto">
            <AdminIcon name="rate_review" />
          </span>
          <p className="font-heading mt-2 font-bold">Belum ada review</p>
          <p className="adm-sub mt-0.5">Tambah testimoni pertama lewat tombol di atas.</p>
        </div>
      )}

      {editing && (
        <>
          <div className="adm-overlay" onClick={() => setEditing(null)} />
          <aside className="adm-drawer">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="adm-eyebrow">Form Testimoni</p>
                <h2 className="font-heading text-lg font-extrabold">
                  {isNew ? "Review Baru" : `Edit: ${editing.id}`}
                </h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-slate-100"
                aria-label="Tutup"
              >
                <AdminIcon name="close" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <label className={labelCls}>
                ID (unik)
                <input
                  value={editing.id}
                  disabled={!isNew}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                Nama + kota
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                Judul
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                Rating (0–5)
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={editing.rating}
                  onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                  className={inputCls}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                Isi
                <textarea
                  rows={2}
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                Tipe media
                <select
                  value={editing.mediaType}
                  onChange={(e) =>
                    setEditing({ ...editing, mediaType: e.target.value as ReviewReel["mediaType"] })
                  }
                  className={inputCls}
                >
                  <option value="image">image</option>
                  <option value="video">video</option>
                </select>
              </label>
              <div className={`${labelCls} sm:col-span-2`}>
                <ImageField
                  label="URL media"
                  value={editing.mediaUrl}
                  onChange={(url) => setEditing({ ...editing, mediaUrl: url })}
                  hint="Untuk gambar: upload langsung. Untuk video: tempel link video."
                />
              </div>
              <label className={labelCls}>
                Label produk (opsional)
                <input
                  value={editing.productLabel ?? ""}
                  onChange={(e) => setEditing({ ...editing, productLabel: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                Tanggal tampil
                <input
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className={inputCls}
                />
              </label>
            </div>
            <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => setEditing(null)} className="adm-btn-ghost flex-1">
                Batalkan
              </button>
              <button
                onClick={save}
                disabled={busy || editIssues.length > 0}
                title={
                  editIssues.length > 0
                    ? `Lengkapi dulu: ${editIssues.join(", ")}`
                    : "Simpan ke reviews.json"
                }
                className="adm-btn-pri inline-flex flex-1 items-center justify-center gap-1.5"
              >
                <AdminIcon name="save" className="text-[18px]" />
                {busy ? "Menyimpan…" : "Simpan Review"}
              </button>
            </div>
            {editIssues.length > 0 && (
              <p className="border-t border-amber-200 bg-amber-50 px-5 py-2.5 text-xs text-amber-800">
                Lengkapi dulu: <strong>{editIssues.join(", ")}</strong>
              </p>
            )}
          </aside>
        </>
      )}

      {confirming !== null && (
        <ConfirmDialog
          title="Hapus Review?"
          message={`Hapus review ${confirming}? Testimoni hilang dari web publik setelah Terbitkan ulang.`}
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={() => remove(confirming)}
        />
      )}

      {!isEasyMode(adminMode) && (
        <JsonEditor
          name="reviews"
          title="Data reviews.json"
          data={list}
          onReloaded={(d) => {
            setList(d as ReviewReel[]);
            setEditing(null);
            setIsNew(false);
          }}
        />
      )}
    </div>
  );
}
