import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";
import type { BlogArticle } from "@/data/blog";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

type BlogFile = { categories: string[]; articles: BlogArticle[] };

const blankArticle = (): BlogArticle => ({
  slug: "",
  category: "",
  tag: "",
  tagTone: "pri",
  serial: "",
  title: "",
  excerpt: "",
  author: "",
  role: "",
  date: "",
  readMinutes: 5,
  readers: "",
  image: "",
  labLabel: "",
  labValue: "",
  cta: "Baca Artikel Lengkap",
  sections: [],
  tags: [],
});

const SECTION_TEMPLATES: Record<string, string> = {
  lead: JSON.stringify({ kind: "lead", text: "" }, null, 2),
  spec: JSON.stringify(
    { kind: "spec", title: "", badge: "", items: [{ label: "", value: "", sub: "" }] },
    null,
    2,
  ),
  part: JSON.stringify(
    { kind: "part", index: "01", eyebrow: "", title: "", paragraphs: [""] },
    null,
    2,
  ),
  advice: JSON.stringify({ kind: "advice", title: "", text: "" }, null, 2),
  chart: JSON.stringify(
    {
      kind: "chart",
      title: "",
      hint: "",
      caption: "",
      bars: [{ label: "", value: "", width: 50 }],
    },
    null,
    2,
  ),
  quote: JSON.stringify({ kind: "quote", text: "", cite: "" }, null, 2),
  takeaway: JSON.stringify({ kind: "takeaway", items: [{ title: "", text: "" }] }, null, 2),
};

const inputCls = "adm-input mt-1";
const labelCls = "adm-label";

function AdminBlog() {
  const [file, setFile] = useState<BlogFile | null>(null);
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [sectionsText, setSectionsText] = useState<string[]>([]);
  const [heroSpecsText, setHeroSpecsText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [newKind, setNewKind] = useState("lead");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "blog" } })
      .then((r) => setFile(r.data as BlogFile))
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

  const openEdit = (a: BlogArticle, fresh: boolean) => {
    setEditing({
      ...a,
      sections: [...a.sections],
      heroSpecs: a.heroSpecs ? [...a.heroSpecs] : undefined,
      tags: [...a.tags],
    });
    setIsNew(fresh);
    setSectionsText(a.sections.map((s) => JSON.stringify(s, null, 2)));
    setHeroSpecsText(JSON.stringify(a.heroSpecs ?? [], null, 2));
    setTagsText(a.tags.join(", "));
    setError("");
    setNotice("");
  };

  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sectionsText.length) return;
    const next = [...sectionsText];
    const tmp = next[i];
    if (tmp === undefined) return;
    next[i] = next[j] as string;
    next[j] = tmp;
    setSectionsText(next);
  };

  const save = async () => {
    if (!editing || !file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const sections = sectionsText.map((t, i) => {
        try {
          return JSON.parse(t);
        } catch {
          throw new Error(`Section #${i + 1} bukan JSON valid.`);
        }
      });
      let heroSpecs: { label: string; value: string }[] | undefined;
      try {
        const parsed: unknown = JSON.parse(heroSpecsText || "[]");
        if (Array.isArray(parsed) && parsed.length > 0)
          heroSpecs = parsed as { label: string; value: string }[];
      } catch {
        throw new Error("heroSpecs bukan JSON valid.");
      }
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const cleaned: BlogArticle = { ...editing, sections, heroSpecs, tags };
      const articles = isNew
        ? [...file.articles, cleaned]
        : file.articles.map((a) => (a.slug === editing.slug ? cleaned : a));
      const next: BlogFile = { ...file, articles };
      await adminSaveDataset({ data: { token: token(), name: "blog", data: next } });
      setFile(next);
      setEditing(null);
      setNotice(`Tersimpan: ${cleaned.slug}. Jangan lupa Terbitkan agar live.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (slug: string) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const next: BlogFile = { ...file, articles: file.articles.filter((a) => a.slug !== slug) };
      await adminSaveDataset({ data: { token: token(), name: "blog", data: next } });
      setFile(next);
      setNotice(`Terhapus: ${slug}.`);
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
        isNew && !editing.slug.trim() && "Slug",
        !editing.category.trim() && "Kategori",
        !editing.tag.trim() && "Tag badge",
        !editing.serial.trim() && "Serial",
        !editing.title.trim() && "Judul",
        !editing.excerpt.trim() && "Excerpt",
        !editing.author.trim() && "Penulis",
        !editing.role.trim() && "Peran penulis",
        !editing.date.trim() && "Tanggal",
        !editing.readers.trim() && "Label pembaca",
        !editing.image.trim() && "Gambar artikel",
        !editing.labLabel.trim() && "Lab label",
        !editing.labValue.trim() && "Lab value",
        !editing.cta.trim() && "Teks CTA",
        sectionsText.length === 0 && "Sections (min 1)",
        tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean).length === 0 && "Tags (min 1)",
      ].filter(Boolean) as string[]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Editorial Ops / Buana Journal CMS</p>
          <h1 className="adm-h1 mt-1">Editorial Buana Journal</h1>
          <p className="adm-sub mt-1">
            Kelola {file?.articles.length ?? "…"} artikel edukasi, panduan rakit, dan teardown lab.
          </p>
        </div>
        <button onClick={() => openEdit(blankArticle(), true)} className="adm-btn-pri">
          + Tulis Artikel Baru
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Total Artikel</p>
          <p className="adm-stat-num mt-1">{file?.articles.length ?? "…"}</p>
          <p className="adm-stat-foot mt-1">Terbit di Buana Journal</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Kategori</p>
          <p className="adm-stat-num mt-1">{file?.categories.length ?? "…"}</p>
          <p className="adm-stat-foot mt-1">{(file?.categories ?? []).join(" • ") || "—"}</p>
        </div>
        <div className="adm-card p-4 sm:p-5">
          <p className="adm-stat-label">Rata-rata Durasi Baca</p>
          <p className="adm-stat-num mt-1">
            {file
              ? `${Math.round(file.articles.reduce((s, a) => s + a.readMinutes, 0) / Math.max(1, file.articles.length))} mnt`
              : "…"}
          </p>
          <p className="adm-stat-foot mt-1">Per artikel</p>
        </div>
      </section>

      <div className="adm-card overflow-x-auto">
        <table className="adm-table min-w-[720px]">
          <thead>
            <tr>
              <th>Artikel & Visual</th>
              <th>Kategori</th>
              <th>Penulis</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(file?.articles ?? []).map((a) => (
              <tr key={a.slug}>
                <td>
                  <div className="flex items-center gap-3">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt=""
                        loading="lazy"
                        className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <span className="adm-icon-chip sm shrink-0">
                        <AdminIcon name="menu_book" />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      <p className="font-monotech text-[11px] text-muted-foreground">
                        /{a.slug} • {a.readMinutes} mnt baca
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="adm-chip adm-chip-blue">{a.category}</span>
                </td>
                <td className="whitespace-nowrap">
                  <p className="font-medium">{a.author}</p>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </td>
                <td className="whitespace-nowrap font-monotech text-xs">{a.date}</td>
                <td className="whitespace-nowrap">
                  <button
                    onClick={() => openEdit(a, false)}
                    className="adm-btn-ghost mr-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs"
                  >
                    <AdminIcon name="edit" className="text-[14px]" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirming(a.slug)}
                    disabled={busy}
                    className="adm-btn-danger inline-flex items-center gap-1"
                  >
                    <AdminIcon name="delete" className="text-[14px]" />
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {file && file.articles.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-sub px-4 py-8 text-center">
                  Belum ada artikel. Tulis yang pertama lewat tombol di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <>
          <div className="adm-overlay" onClick={() => setEditing(null)} />
          <aside className="adm-drawer wide">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="adm-eyebrow">Form Editorial Buana</p>
                <h2 className="font-heading text-lg font-extrabold">
                  {isNew ? "Tulis Artikel Baru" : `Edit: ${editing.slug}`}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={labelCls}>
                  Slug (unik)
                  <input
                    value={editing.slug}
                    disabled={!isNew}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Kategori
                  <input
                    value={editing.category}
                    list="blog-cats"
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className={inputCls}
                  />
                  <datalist id="blog-cats">
                    {(file?.categories ?? []).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  Judul
                  <input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  Excerpt
                  <textarea
                    rows={2}
                    value={editing.excerpt}
                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Tag badge
                  <input
                    value={editing.tag}
                    onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Tone badge
                  <select
                    value={editing.tagTone}
                    onChange={(e) =>
                      setEditing({ ...editing, tagTone: e.target.value as BlogArticle["tagTone"] })
                    }
                    className={inputCls}
                  >
                    <option value="pri">pri</option>
                    <option value="sec">sec</option>
                    <option value="tertiary">tertiary</option>
                  </select>
                </label>
                <label className={labelCls}>
                  Serial
                  <input
                    value={editing.serial}
                    onChange={(e) => setEditing({ ...editing, serial: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Penulis
                  <input
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Peran penulis
                  <input
                    value={editing.role}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Tanggal
                  <input
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Menit baca
                  <input
                    type="number"
                    min={1}
                    value={editing.readMinutes}
                    onChange={(e) =>
                      setEditing({ ...editing, readMinutes: Number(e.target.value) })
                    }
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Label pembaca
                  <input
                    value={editing.readers}
                    onChange={(e) => setEditing({ ...editing, readers: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <div className={labelCls}>
                  <ImageField
                    label="Gambar artikel"
                    value={editing.image}
                    onChange={(url) => setEditing({ ...editing, image: url })}
                    hint="Upload sampul artikel, atau tempel link."
                  />
                </div>
                <label className={labelCls}>
                  Lab label
                  <input
                    value={editing.labLabel}
                    onChange={(e) => setEditing({ ...editing, labLabel: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Lab value
                  <input
                    value={editing.labValue}
                    onChange={(e) => setEditing({ ...editing, labValue: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Teks CTA
                  <input
                    value={editing.cta}
                    onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Tags (pisah koma)
                  <input
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  heroSpecs (JSON array)
                  <textarea
                    rows={3}
                    value={heroSpecsText}
                    onChange={(e) => setHeroSpecsText(e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-on-surface-variant">
                  Sections ({sectionsText.length}) — edit sebagai JSON, kind:
                  lead/spec/part/advice/chart/quote/takeaway
                </p>
                {sectionsText.map((t, i) => (
                  <div
                    key={i}
                    className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5"
                  >
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs">
                      <span className="adm-chip adm-chip-blue font-mono">#{i + 1}</span>
                      <button
                        onClick={() => moveSection(i, -1)}
                        className="adm-btn-ghost inline-flex items-center p-1.5"
                        aria-label="Pindah ke atas"
                      >
                        <AdminIcon name="arrow_upward" className="text-[15px]" />
                      </button>
                      <button
                        onClick={() => moveSection(i, 1)}
                        className="adm-btn-ghost inline-flex items-center p-1.5"
                        aria-label="Pindah ke bawah"
                      >
                        <AdminIcon name="arrow_downward" className="text-[15px]" />
                      </button>
                      <button
                        onClick={() => setSectionsText(sectionsText.filter((_, j) => j !== i))}
                        className="adm-btn-danger inline-flex items-center gap-1"
                      >
                        <AdminIcon name="delete" className="text-[14px]" />
                        Hapus
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={t}
                      onChange={(e) => {
                        const next = [...sectionsText];
                        next[i] = e.target.value;
                        setSectionsText(next);
                      }}
                      spellCheck={false}
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <select
                    value={newKind}
                    onChange={(e) => setNewKind(e.target.value)}
                    className="adm-input w-40"
                  >
                    {Object.keys(SECTION_TEMPLATES).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const tpl = SECTION_TEMPLATES[newKind];
                      if (tpl) setSectionsText([...sectionsText, tpl]);
                    }}
                    className="adm-btn-ghost inline-flex items-center gap-1 text-xs"
                  >
                    <AdminIcon name="add" className="text-[15px]" />
                    Section
                  </button>
                </div>
              </div>
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
                    : "Simpan ke blog.json"
                }
                className="adm-btn-pri inline-flex flex-1 items-center justify-center gap-1.5"
              >
                <AdminIcon name="save" className="text-[18px]" />
                {busy ? "Menyimpan…" : "Simpan Artikel"}
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
          title="Hapus Artikel?"
          message={`Hapus artikel ${confirming}? Konten hilang dari Buana Journal setelah Terbitkan ulang.`}
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={() => remove(confirming)}
        />
      )}

      {!isEasyMode(adminMode) && (
        <JsonEditor
          name="blog"
          title="Data blog.json"
          data={file}
          onReloaded={(d) => {
            setFile(d as BlogFile);
            setEditing(null);
            setIsNew(false);
          }}
        />
      )}
    </div>
  );
}
