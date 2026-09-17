import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminGetDataset, adminPolishText, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import { categories, type Product } from "@/data/products";

export const Route = createFileRoute("/admin/produk")({
  component: AdminProduk,
});

const blankProduct = (): Product => ({
  id: "",
  name: "",
  brand: "",
  category: "Laptop",
  price: 0,
  rating: 4.5,
  sold: 0,
  stock: 1,
  condition: "Baru",
  location: "Bantul, Yogyakarta",
  shortDescription: "",
  description: "",
  specs: [{ label: "", value: "" }],
  images: 1,
  image: "",
  gallery: [""],
});

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

function StockChip({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="adm-chip adm-chip-red">Habis</span>;
  if (stock <= 2) return <span className="adm-chip adm-chip-red">Kritis</span>;
  return <span className="adm-chip adm-chip-green">Ready</span>;
}

function AdminProduk() {
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const adminMode = useAdminMode((s) => s.mode);

  const token = () => getAdminToken() ?? "";

  const reload = useCallback(async () => {
    const r = await adminGetDataset({ data: { token: getAdminToken() ?? "", name: "products" } });
    setList(r.data as Product[]);
  }, []);

  useEffect(() => {
    reload().catch((e) => setError(errMsg(e)));
  }, [reload]);

  useEffect(() => {
    if (!editing) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [editing]);

  const stats = useMemo(() => {
    const value = list.reduce((s, p) => s + p.price * p.stock, 0);
    return {
      value,
      ready: list.filter((p) => p.stock > 0).length,
      critical: list.filter((p) => p.stock <= 2).length,
      sold: list.reduce((s, p) => s + p.sold, 0),
    };
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (p) =>
        (cat === "Semua" || p.category === cat) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)),
    );
  }, [list, query, cat]);

  const openNew = () => {
    setEditing(blankProduct());
    setIsNew(true);
    setError("");
    setNotice("");
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p, specs: [...p.specs], gallery: [...p.gallery] });
    setIsNew(false);
    setError("");
    setNotice("");
  };

  const polishDescription = async () => {
    if (!editing) return;
    const baseText =
      editing.description.trim() ||
      `${editing.name} merk ${editing.brand}, kondisi ${editing.condition}. ${editing.shortDescription}`;
    if (!baseText) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await adminPolishText({
        data: {
          token: token(),
          text: baseText,
          context: `Produk: ${editing.name}, Brand: ${editing.brand}, Kategori: ${editing.category}, Harga: Rp ${editing.price}`,
        },
      });
      setEditing({ ...editing, description: r.polished });
      setNotice("✨ Deskripsi berhasil dirapikan AI! Periksa dan simpan.");
    } catch (e) {
      setError(`AI Poles Gagal: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const polishShortDesc = async () => {
    if (!editing) return;
    const baseText =
      editing.shortDescription.trim() ||
      `${editing.name} merk ${editing.brand} kategori ${editing.category}`;
    if (!baseText) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await adminPolishText({
        data: {
          token: token(),
          text: `Buatkan 1 kalimat ringkasan spesifikasi singkat padat untuk katalog: ${baseText}`,
          context: `Produk: ${editing.name}, Kategori: ${editing.category}`,
        },
      });
      setEditing({ ...editing, shortDescription: r.polished });
      setNotice("✨ Deskripsi singkat berhasil dirapikan AI!");
    } catch (e) {
      setError(`AI Poles Gagal: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const cleaned: Product = {
        ...editing,
        specs: editing.specs.filter((s) => s.label.trim() || s.value.trim()),
        gallery: editing.gallery.map((g) => g.trim()).filter(Boolean),
        images: Math.max(1, editing.gallery.filter((g) => g.trim()).length),
        tokopediaUrl: editing.tokopediaUrl?.trim() || undefined,
        shopeeUrl: editing.shopeeUrl?.trim() || undefined,
        oldPrice: editing.oldPrice && editing.oldPrice > 0 ? editing.oldPrice : undefined,
        variants:
          editing.variants && editing.variants.length > 0
            ? editing.variants
                .map((v) => ({
                  name: v.name.trim(),
                  price: Number(v.price) || 0,
                  oldPrice: v.oldPrice && v.oldPrice > 0 ? Number(v.oldPrice) : undefined,
                  stock: typeof v.stock === "number" && v.stock >= 0 ? Number(v.stock) : undefined,
                }))
                .filter((v) => Boolean(v.name))
            : undefined,
      };
      const next = isNew
        ? [...list, cleaned]
        : list.map((p) => (p.id === editing.id ? cleaned : p));
      await adminSaveDataset({ data: { token: token(), name: "products", data: next } });
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
      const next = list.filter((p) => p.id !== id);
      await adminSaveDataset({ data: { token: token(), name: "products", data: next } });
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
        !editing.name.trim() && "Nama produk",
        isNew && !editing.id.trim() && "ID / SKU",
        !editing.brand.trim() && "Brand",
        !editing.image.trim() && "Gambar utama",
        !editing.shortDescription.trim() && "Deskripsi singkat",
        !editing.description.trim() && "Deskripsi",
        editing.specs.filter((s) => s.label.trim() || s.value.trim()).length === 0 &&
          "Spesifikasi (min 1 baris)",
        editing.gallery.map((g) => g.trim()).filter(Boolean).length === 0 &&
          "Galeri (min 1 gambar)",
      ].filter(Boolean) as string[]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Katalog & Inventaris / Buana Hub Database</p>
          <h1 className="adm-h1 mt-1">Manajemen Produk & Katalog</h1>
          <p className="adm-sub mt-1">
            Kelola {list.length} unit barang siap jual, stok gudang, dan harga toko.
          </p>
        </div>
        <button onClick={openNew} className="adm-btn-pri">
          + Tambah Produk Baru
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Total Nilai Inventaris</p>
          <p className="adm-stat-num mt-1">{rupiah(stats.value)}</p>
          <p className="adm-stat-foot mt-1">Harga jual × stok gudang</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Produk Siap Jual</p>
          <p className="adm-stat-num mt-1">
            {stats.ready} <span className="text-base font-bold text-muted-foreground">SKU</span>
          </p>
          <p className="adm-stat-foot mt-1">Stok di atas nol</p>
        </div>
        <div className="adm-card border-red-200 p-4 sm:p-5">
          <p className="adm-stat-label">Butuh Restock Segera</p>
          <p className="adm-stat-num mt-1 text-red-700">
            {stats.critical} <span className="text-base font-bold">SKU</span>
          </p>
          <p className="adm-stat-foot mt-1">Stok kritis di bawah 3 unit</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Terjual Total</p>
          <p className="adm-stat-num mt-1">
            {stats.sold} <span className="text-base font-bold text-muted-foreground">Unit</span>
          </p>
          <p className="adm-stat-foot mt-1">Akumulasi semua produk</p>
        </div>
      </section>

      <section className="adm-card space-y-3 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama produk, SKU, atau brand…"
          className="adm-input md:max-w-md"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Semua", ...categories].map((c) => {
            const n = c === "Semua" ? list.length : list.filter((p) => p.category === c).length;
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`adm-pill shrink-0 ${active ? "adm-pill-active" : ""}`}
              >
                {c} ({n})
              </button>
            );
          })}
        </div>
      </section>

      <section className="adm-card overflow-x-auto">
        <table className="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>Informasi Produk & SKU</th>
              <th>Kategori</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th>Terjual</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <span className="adm-icon-chip sm shrink-0">
                        <AdminIcon name="inventory_2" />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="font-monotech text-[11px] text-muted-foreground">
                        SKU: {p.id} • {p.brand} • {p.condition}
                        {p.isFeatured ? " • ★ Pilihan" : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="adm-chip adm-chip-blue">{p.category}</span>
                </td>
                <td className="whitespace-nowrap">
                  <p className="font-bold">{rupiah(p.price)}</p>
                  {p.oldPrice ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {rupiah(p.oldPrice)}
                    </p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap">
                  <p className="font-semibold">
                    {p.stock} unit <StockChip stock={p.stock} />
                  </p>
                </td>
                <td className="whitespace-nowrap">{p.sold}</td>
                <td className="whitespace-nowrap">
                  <button
                    onClick={() => openEdit(p)}
                    className="adm-btn-ghost mr-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs"
                  >
                    <AdminIcon name="edit" className="text-[14px]" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirming(p.id)}
                    disabled={busy}
                    className="adm-btn-danger inline-flex items-center gap-1"
                  >
                    <AdminIcon name="delete" className="text-[14px]" />
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-sub px-4 py-8 text-center">
                  Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="adm-sub border-t border-slate-100 px-4 py-2.5">
          Menampilkan {filtered.length} dari {list.length} unit produk
        </p>
      </section>

      {!isEasyMode(adminMode) && (
        <JsonEditor
          name="products"
          title="Data products.json"
          data={list}
          onReloaded={(d) => {
            setList(d as Product[]);
            setEditing(null);
            setIsNew(false);
          }}
        />
      )}

      {editing && (
        <>
          <div className="adm-overlay" onClick={() => setEditing(null)} />
          <aside className="adm-drawer">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="adm-eyebrow">Form Inventaris Buana</p>
                <h2 className="font-heading text-lg font-extrabold">
                  {isNew ? "Tambah Produk Baru" : "Edit Cepat Produk"}
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
              <label className="adm-label">
                Nama produk lengkap *
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="cth: ASUS TUF Gaming F15 RTX 4060"
                  className="adm-input mt-1"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="adm-label">
                  ID / SKU (unik) *
                  <input
                    value={editing.id}
                    disabled={!isNew}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                    placeholder="laptop-gaming-rtx-4060"
                    className="adm-input mt-1 font-mono text-[13px]"
                  />
                </label>
                <label className="adm-label">
                  Brand *
                  <input
                    value={editing.brand}
                    onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Kategori *
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="adm-input mt-1"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-label">
                  Kondisi
                  <select
                    value={editing.condition}
                    onChange={(e) =>
                      setEditing({ ...editing, condition: e.target.value as Product["condition"] })
                    }
                    className="adm-input mt-1"
                  >
                    <option value="Baru">Baru</option>
                    <option value="Bekas">Bekas</option>
                  </select>
                </label>
                <label className="adm-label">
                  Harga jual (Rp) *
                  <input
                    type="number"
                    min={0}
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Harga coret (opsional)
                  <input
                    type="number"
                    min={0}
                    value={editing.oldPrice ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        oldPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Stok *
                  <input
                    type="number"
                    min={0}
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Rating (0–5)
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                    className="adm-input mt-1"
                  />
                </label>
              </div>

              {/* Pilihan Varian Produk (Opsional) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="adm-label">Pilihan Varian Produk (Opsional)</p>
                    <p className="adm-sub text-xs">
                      Contoh: kapasitas 500GB / 1TB, opsi RAM, warna, dll.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const variants = editing.variants ? [...editing.variants] : [];
                      variants.push({
                        name: "",
                        price: editing.price,
                        oldPrice: editing.oldPrice,
                        stock: editing.stock,
                      });
                      setEditing({ ...editing, variants });
                    }}
                    className="adm-btn-ghost inline-flex items-center gap-1 py-1 text-xs"
                  >
                    <AdminIcon name="add" className="text-[14px]" />
                    Tambah Varian
                  </button>
                </div>

                {(editing.variants ?? []).map((v, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="adm-chip adm-chip-blue font-mono text-[10px]">
                        Varian #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVariants = (editing.variants ?? []).filter((_, j) => j !== idx);
                          setEditing({
                            ...editing,
                            variants: nextVariants.length > 0 ? nextVariants : undefined,
                          });
                        }}
                        className="adm-btn-danger inline-flex items-center gap-0.5 py-0.5 px-2 text-[11px]"
                      >
                        <AdminIcon name="delete" className="text-[12px]" />
                        Hapus
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">
                          Nama Varian *
                        </label>
                        <input
                          value={v.name}
                          placeholder="Contoh: 500 GB / 1 TB"
                          onChange={(e) => {
                            const nextVariants = [...(editing.variants ?? [])];
                            nextVariants[idx] = { ...nextVariants[idx], name: e.target.value };
                            setEditing({ ...editing, variants: nextVariants });
                          }}
                          className="adm-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">
                          Harga Varian (Rp) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={v.price}
                          onChange={(e) => {
                            const nextVariants = [...(editing.variants ?? [])];
                            nextVariants[idx] = {
                              ...nextVariants[idx],
                              price: Number(e.target.value),
                            };
                            setEditing({ ...editing, variants: nextVariants });
                          }}
                          className="adm-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">
                          Harga Coret (Opsional)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={v.oldPrice ?? ""}
                          placeholder="Opsional"
                          onChange={(e) => {
                            const nextVariants = [...(editing.variants ?? [])];
                            nextVariants[idx] = {
                              ...nextVariants[idx],
                              oldPrice: e.target.value ? Number(e.target.value) : undefined,
                            };
                            setEditing({ ...editing, variants: nextVariants });
                          }}
                          className="adm-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">
                          Stok Khusus (Opsional)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={v.stock ?? ""}
                          placeholder={String(editing.stock)}
                          onChange={(e) => {
                            const nextVariants = [...(editing.variants ?? [])];
                            nextVariants[idx] = {
                              ...nextVariants[idx],
                              stock: e.target.value ? Number(e.target.value) : undefined,
                            };
                            setEditing({ ...editing, variants: nextVariants });
                          }}
                          className="adm-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!editing.variants || editing.variants.length === 0) && (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada varian khusus. Produk akan menggunakan harga dan stok tunggal di atas.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <ImageField
                  label="Gambar utama"
                  value={editing.image}
                  onChange={(url) => setEditing({ ...editing, image: url })}
                  hint="Upload dari HP/PC, atau tempel link."
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="adm-label">Deskripsi singkat *</label>
                  <button
                    type="button"
                    onClick={polishShortDesc}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                  >
                    <AdminIcon name="auto_awesome" className="text-[13px]" />
                    Poles Singkat AI
                  </button>
                </div>
                <input
                  value={editing.shortDescription}
                  onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                  className="adm-input mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="adm-label">Deskripsi Lengkap *</label>
                  <button
                    type="button"
                    onClick={polishDescription}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                  >
                    <AdminIcon name="auto_awesome" className="text-[13px]" />
                    Poles Deskripsi AI
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="adm-input mt-1"
                />
              </div>

              <div>
                <p className="adm-label">Spesifikasi</p>
                {editing.specs.map((s, i) => (
                  <div key={i} className="mt-1.5 flex gap-2">
                    <input
                      value={s.label}
                      placeholder="Label"
                      onChange={(e) => {
                        const specs = [...editing.specs];
                        specs[i] = { ...specs[i], label: e.target.value };
                        setEditing({ ...editing, specs });
                      }}
                      className="adm-input"
                    />
                    <input
                      value={s.value}
                      placeholder="Value"
                      onChange={(e) => {
                        const specs = [...editing.specs];
                        specs[i] = { ...specs[i], value: e.target.value };
                        setEditing({ ...editing, specs });
                      }}
                      className="adm-input"
                    />
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          specs: editing.specs.filter((_, j) => j !== i),
                        })
                      }
                      className="adm-btn-danger inline-flex shrink-0 items-center justify-center p-2"
                      aria-label="Hapus baris spec"
                    >
                      <AdminIcon name="close" className="text-[15px]" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setEditing({ ...editing, specs: [...editing.specs, { label: "", value: "" }] })
                  }
                  className="adm-btn-ghost mt-2 inline-flex items-center gap-1 text-xs"
                >
                  <AdminIcon name="add" className="text-[15px]" />
                  Baris spec
                </button>
              </div>

              <div>
                <p className="adm-label">Galeri</p>
                {editing.gallery.map((g, i) => (
                  <div key={i} className="mt-1.5 flex items-start gap-2">
                    <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-2">
                      <ImageField
                        label={`Gambar ${i + 1}`}
                        value={g}
                        onChange={(url) => {
                          const gallery = [...editing.gallery];
                          gallery[i] = url;
                          setEditing({ ...editing, gallery });
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          gallery: editing.gallery.filter((_, j) => j !== i),
                        })
                      }
                      className="adm-btn-danger mt-4 inline-flex shrink-0 items-center justify-center p-2"
                      aria-label="Hapus gambar galeri"
                    >
                      <AdminIcon name="close" className="text-[15px]" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditing({ ...editing, gallery: [...editing.gallery, ""] })}
                  className="adm-btn-ghost mt-2 inline-flex items-center gap-1 text-xs"
                >
                  <AdminIcon name="add" className="text-[15px]" />
                  Gambar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="adm-label">
                  Tokopedia URL
                  <input
                    value={editing.tokopediaUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, tokopediaUrl: e.target.value })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Shopee URL
                  <input
                    value={editing.shopeeUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, shopeeUrl: e.target.value })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Lokasi
                  <input
                    value={editing.location}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    className="adm-input mt-1"
                  />
                </label>
                <label className="adm-label">
                  Terjual
                  <input
                    type="number"
                    min={0}
                    value={editing.sold}
                    onChange={(e) => setEditing({ ...editing, sold: Number(e.target.value) })}
                    className="adm-input mt-1"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing.isFeatured ?? false}
                  onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-[#0050cb]"
                />
                Produk Pilihan (tampil di homepage)
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
                    : "Simpan ke products.json"
                }
                className="adm-btn-pri inline-flex flex-1 items-center justify-center gap-1.5"
              >
                <AdminIcon name="save" className="text-[18px]" />
                {busy ? "Menyimpan…" : isNew ? "Simpan Produk" : "Simpan & Sinkronkan"}
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
          title="Hapus Produk?"
          message={`Hapus produk ${confirming}? File products.json ikut berubah dan perlu Terbitkan ulang.`}
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={() => remove(confirming)}
        />
      )}
    </div>
  );
}
