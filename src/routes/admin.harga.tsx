import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type {
  AppraisalCategory,
  AppraisalCondition,
  BuybackCategory,
  BuybackItem,
  SellPrice,
} from "@/data/sellPrices";

export const Route = createFileRoute("/admin/harga")({
  component: AdminHarga,
});

type SellFile = {
  sellPrices: SellPrice[];
  buybackCategoryMeta: Record<string, { title: string; desc: string; count: string }>;
  buybackItems: BuybackItem[];
  appraisalCategories: { id: AppraisalCategory; label: string }[];
  appraisalConditions: { id: AppraisalCondition; label: string }[];
  appraisalRates: Record<AppraisalCategory, Record<AppraisalCondition, string>>;
};

const inputCls = "adm-input";

function AdminHarga() {
  const [file, setFile] = useState<SellFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmingItemIndex, setConfirmingItemIndex] = useState<number | null>(null);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "sellPrices" } })
      .then((r) => {
        setFile(r.data as SellFile);
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // Hitung jumlah SKU per kategori secara otomatis
      const counts: Record<string, number> = {};
      for (const item of file.buybackItems) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
      const nextMeta = { ...file.buybackCategoryMeta };
      for (const [k, v] of Object.entries(nextMeta)) {
        nextMeta[k] = { ...v, count: `${counts[k] || 0} SKU Terdaftar` };
      }

      const next: SellFile = { ...file, buybackCategoryMeta: nextMeta };
      await adminSaveDataset({ data: { token: token(), name: "sellPrices", data: next } });
      setFile(next);
      setNotice(
        "Tersimpan ke sellPrices.json. Count kategori dihitung otomatis. Jangan lupa Terbitkan agar live.",
      );
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const updateBuybackItem = (i: number, patch: Partial<BuybackItem>) => {
    if (!file) return;
    const next = [...file.buybackItems];
    next[i] = { ...next[i], ...patch };
    setFile({ ...file, buybackItems: next });
  };

  const addBuybackItem = () => {
    if (!file) return;
    const newItem: BuybackItem = {
      category: "mobo",
      grade: "GRADE D • RUSAK",
      gradeTone: "tertiary",
      title: "Komponen Hardware Baru",
      price: "Rp 50.000 - Rp 150.000",
      priceTone: "tertiary",
      searchText: "komponen hardware baru",
    };
    setFile({ ...file, buybackItems: [...file.buybackItems, newItem] });
  };

  const setPrice = (i: number, patch: Partial<SellPrice>) => {
    if (!file) return;
    const sellPrices = [...file.sellPrices];
    const cur = sellPrices[i];
    if (!cur) return;
    sellPrices[i] = { ...cur, ...patch };
    setFile({ ...file, sellPrices });
  };

  const setRate = (cat: AppraisalCategory, cond: AppraisalCondition, value: string) => {
    if (!file) return;
    setFile({
      ...file,
      appraisalRates: {
        ...file.appraisalRates,
        [cat]: { ...file.appraisalRates[cat], [cond]: value },
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Modul Salvage & Appraisal / Live Sync</p>
          <h1 className="adm-h1 mt-1">Harga Beli & Price List</h1>
          <p className="adm-sub mt-1">
            Atur patokan harga terima, matriks taksiran, dan katalog buyback yang tampil di /jual.
          </p>
        </div>
        <button
          onClick={save}
          disabled={busy || !file}
          className="adm-btn-pri inline-flex items-center gap-1.5"
        >
          <AdminIcon name="save" className="text-[18px]" />
          {busy ? "Menyimpan…" : "Simpan Semua"}
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Baris Harga Terima</p>
          <p className="adm-stat-num mt-1">{file?.sellPrices.length ?? "…"}</p>
          <p className="adm-stat-foot mt-1">Tabel harga beli pelanggan</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Item Buyback</p>
          <p className="adm-stat-num mt-1">{itemsText.length}</p>
          <p className="adm-stat-foot mt-1">Katalog /jual</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Sel Taksiran</p>
          <p className="adm-stat-num mt-1">
            {(file?.appraisalCategories.length ?? 0) * (file?.appraisalConditions.length ?? 0)}
          </p>
          <p className="adm-stat-foot mt-1">Kategori × kondisi</p>
        </div>
      </section>

      <section className="adm-card p-4 sm:p-5">
        <p className="adm-eyebrow">Public Price Matrix</p>
        <h2 className="font-heading mt-1 text-lg font-extrabold">
          Daftar Harga Terima ({(file?.sellPrices ?? []).length} baris)
        </h2>
        <div className="mb-1 hidden grid-cols-6 gap-2 sm:grid" aria-hidden="true">
          {["Kategori", "Min (Rp)", "Max (Rp)", "Satuan", "Contoh", "Opsi"].map((h) => (
            <p
              key={h}
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              {h}
            </p>
          ))}
        </div>
        <div className="mt-2 space-y-2">
          {(file?.sellPrices ?? []).map((p, i) => (
            <div key={p.category} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <input
                value={p.category}
                onChange={(e) => setPrice(i, { category: e.target.value })}
                className={inputCls}
                title="Kategori"
              />
              <input
                type="number"
                min={0}
                value={p.range[0]}
                onChange={(e) => setPrice(i, { range: [Number(e.target.value), p.range[1]] })}
                className={inputCls}
                title="Min (Rp)"
              />
              <input
                type="number"
                min={0}
                value={p.range[1]}
                onChange={(e) => setPrice(i, { range: [p.range[0], Number(e.target.value)] })}
                className={inputCls}
                title="Max (Rp)"
              />
              <input
                value={p.unit}
                onChange={(e) => setPrice(i, { unit: e.target.value })}
                className={inputCls}
                title="Satuan"
              />
              <input
                value={p.example}
                onChange={(e) => setPrice(i, { example: e.target.value })}
                className={inputCls}
                title="Contoh"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={p.highlight ?? false}
                  onChange={(e) => setPrice(i, { highlight: e.target.checked })}
                />
                highlight
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="adm-card p-4 sm:p-5">
        <p className="adm-eyebrow">Formula Taksir Lab</p>
        <h2 className="font-heading mt-1 text-lg font-extrabold">
          Matriks Taksiran (kategori × kondisi)
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="adm-table min-w-[640px]">
            <thead>
              <tr>
                <th>Kategori</th>
                {(file?.appraisalConditions ?? []).map((c) => (
                  <th key={c.id}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(file?.appraisalCategories ?? []).map((cat) => (
                <tr key={cat.id}>
                  <td className="text-xs font-semibold">{cat.label}</td>
                  {(file?.appraisalConditions ?? []).map((cond) => (
                    <td key={cond.id} className="px-2 py-1">
                      <input
                        value={file?.appraisalRates[cat.id]?.[cond.id] ?? ""}
                        onChange={(e) => setRate(cat.id, cond.id, e.target.value)}
                        className={`${inputCls} font-mono text-xs`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <p className="adm-eyebrow">Katalog SKU /jual</p>
            <h2 className="font-heading mt-1 text-lg font-extrabold text-on-surface">
              Katalog SKU Buyback ({file?.buybackItems.length ?? 0} Item)
            </h2>
            <p className="adm-sub">
              Daftar kartu estimasi penawaran hardware di halaman /jual. Pengelompokan &amp;
              hitungan SKU otomatis diperbarui.
            </p>
          </div>
          <button
            onClick={addBuybackItem}
            className="adm-btn-ghost inline-flex items-center gap-1 py-1.5 text-xs"
          >
            <AdminIcon name="add" className="text-[15px]" />
            Tambah SKU Buyback
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(file?.buybackItems ?? []).map((it, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="adm-chip adm-chip-blue font-mono text-[11px]">#{i + 1} SKU</span>
                  <span
                    className={`adm-chip font-mono text-[10px] ${it.gradeTone === "pri" ? "adm-chip-green" : "adm-chip-amber"}`}
                  >
                    {it.category.toUpperCase()} • {it.grade || "GRADE"}
                  </span>
                </div>
                <button
                  onClick={() => setConfirmingItemIndex(i)}
                  className="adm-btn-danger inline-flex items-center gap-1 py-1"
                >
                  <AdminIcon name="delete" className="text-[13px]" />
                  Hapus
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="adm-label mb-1">Kategori Hardware</label>
                  <select
                    value={it.category}
                    onChange={(e) =>
                      updateBuybackItem(i, { category: e.target.value as BuybackCategory })
                    }
                    className={inputCls}
                  >
                    <option value="mobo">Motherboard &amp; IC</option>
                    <option value="vga">VGA Card / GPU</option>
                    <option value="laptop">Laptop &amp; Bangkai</option>
                    <option value="proc-ram">Processor &amp; RAM/SSD</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label mb-1">Judul Perangkat</label>
                  <input
                    value={it.title}
                    onChange={(e) => updateBuybackItem(i, { title: e.target.value })}
                    placeholder="Contoh: Motherboard H61 / B450 Normal"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="adm-label mb-1">Label Grade</label>
                  <input
                    value={it.grade}
                    onChange={(e) => updateBuybackItem(i, { grade: e.target.value })}
                    placeholder="Contoh: GRADE D • RUSAK / MATOT"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="adm-label mb-1">Estimasi Rentang Harga</label>
                  <input
                    value={it.price}
                    onChange={(e) => updateBuybackItem(i, { price: e.target.value })}
                    placeholder="Contoh: Rp 50.000 - Rp 150.000"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="adm-label mb-1">Warna Badge Grade &amp; Harga</label>
                  <select
                    value={it.gradeTone}
                    onChange={(e) => {
                      const tone = e.target.value as "pri" | "tertiary";
                      updateBuybackItem(i, { gradeTone: tone, priceTone: tone });
                    }}
                    className={inputCls}
                  >
                    <option value="pri">Biru (Normal / Grade A &amp; B)</option>
                    <option value="tertiary">Merah (Rusak / Matot / Grade C &amp; D)</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label mb-1">Kata Kunci Pencarian</label>
                  <input
                    value={it.searchText}
                    onChange={(e) => updateBuybackItem(i, { searchText: e.target.value })}
                    placeholder="Contoh: rtx 3060 vga artefak rusak"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {!isEasyMode(adminMode) && file && (
        <JsonEditor
          name="sellPrices"
          title="Data sellPrices.json"
          data={file}
          onReloaded={(d) => {
            const f = d as SellFile;
            setFile(f);
          }}
        />
      )}

      {confirmingItemIndex !== null && (
        <ConfirmDialog
          title={`Hapus Item #${confirmingItemIndex + 1}?`}
          message="Item SKU buyback ini akan dihapus dari price list. Perubahan tersimpan permanen saat Simpan Semua Harga."
          onCancel={() => setConfirmingItemIndex(null)}
          onConfirm={() => {
            if (file) {
              setFile({
                ...file,
                buybackItems: file.buybackItems.filter((_, j) => j !== confirmingItemIndex),
              });
            }
            setConfirmingItemIndex(null);
          }}
        />
      )}
    </div>
  );
}
