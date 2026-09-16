import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type {
  AppraisalCategory,
  AppraisalCondition,
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
  const [itemsText, setItemsText] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "sellPrices" } })
      .then((r) => {
        const f = r.data as SellFile;
        setFile(f);
        setItemsText(f.buybackItems.map((i) => JSON.stringify(i, null, 2)));
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const buybackItems = itemsText.map((t, i) => {
        try {
          return JSON.parse(t);
        } catch {
          throw new Error(`Buyback item #${i + 1} bukan JSON valid.`);
        }
      });
      const next: SellFile = { ...file, buybackItems };
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="adm-eyebrow">Katalog /jual</p>
            <h2 className="font-heading mt-1 text-lg font-extrabold">
              Katalog Buyback ({itemsText.length} item)
            </h2>
            <p className="adm-sub">JSON per item — validasi otomatis saat Simpan Semua.</p>
          </div>
          <button
            onClick={() =>
              setItemsText([
                ...itemsText,
                JSON.stringify(
                  {
                    category: "mobo",
                    grade: "",
                    gradeTone: "tertiary",
                    socket: "",
                    title: "",
                    desc: "",
                    specLeft: { label: "", value: "" },
                    specRight: { label: "", value: "" },
                    price: "",
                    priceTone: "tertiary",
                    searchText: "",
                  },
                  null,
                  2,
                ),
              ])
            }
            className="adm-btn-ghost inline-flex items-center gap-1 py-1 text-xs"
          >
            <AdminIcon name="add" className="text-[15px]" />
            Item
          </button>
        </div>
        {itemsText.map((t, i) => (
          <div key={i} className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <span className="adm-chip adm-chip-blue font-mono">#{i + 1}</span>
              <button
                onClick={() => setItemsText(itemsText.filter((_, j) => j !== i))}
                className="adm-btn-danger inline-flex items-center gap-1"
              >
                <AdminIcon name="delete" className="text-[14px]" />
                Hapus
              </button>
            </div>
            <textarea
              rows={8}
              value={t}
              onChange={(e) => {
                const next = [...itemsText];
                next[i] = e.target.value;
                setItemsText(next);
              }}
              spellCheck={false}
              className={`${inputCls} font-mono text-xs`}
            />
          </div>
        ))}
      </section>

      {!isEasyMode(adminMode) && file && (
        <JsonEditor
          name="sellPrices"
          title="Data sellPrices.json"
          data={file}
          onReloaded={(d) => {
            const f = d as SellFile;
            setFile(f);
            setItemsText(f.buybackItems.map((i) => JSON.stringify(i, null, 2)));
          }}
        />
      )}
    </div>
  );
}
