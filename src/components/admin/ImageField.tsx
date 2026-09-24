import { useRef, useState } from "react";
import {
  adminEnhanceImage,
  adminListUploads,
  adminUploadImage,
  adminUploadLocalBanner,
} from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "./AdminIcon";

type UploadItem = { url: string; label: string; at: string };

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  aiPromptDefault?: string;
  bannerMode?: boolean;
};

const inputCls = "adm-input";

function looksLikeImage(url: string): boolean {
  const t = url.trim();
  return (
    /^https?:\/\//i.test(t) || t.startsWith("/") || /\.(webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(t)
  );
}

/**
 * Kompresi banner khusus format WebP HD (1920px max, quality 0.85, target ~80-120KB,
 * nama selalu diprefix Buanacomputer-*.webp) untuk disimpan langsung di repo lokal / GitHub.
 */
async function compressBannerWebpClient(
  file: File,
  maxDimension = 1920,
  quality = 0.85,
): Promise<{ dataUrl: string; fileName: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Gagal membuat canvas kompresi WebP."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let dataUrl = canvas.toDataURL("image/webp", currentQuality);
        const head = "data:image/webp;base64,";
        let b64Length = dataUrl.length - head.length;
        let compressedSize = Math.round((b64Length * 3) / 4);

        // Jika ukuran masih > 150 KB, turunkan sedikit ke 0.78 agar optimal ~80-120 KB
        if (compressedSize > 150 * 1024 && currentQuality > 0.75) {
          currentQuality = 0.78;
          dataUrl = canvas.toDataURL("image/webp", currentQuality);
          b64Length = dataUrl.length - head.length;
          compressedSize = Math.round((b64Length * 3) / 4);
        }

        const baseRaw = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const cleanBase = /^buanacomputer-/i.test(baseRaw)
          ? `Buanacomputer-${baseRaw.replace(/^buanacomputer-/i, "")}`
          : `Buanacomputer-${baseRaw || "banner"}`;
        const compressedFileName = `${cleanBase}.webp`;

        resolve({
          dataUrl,
          fileName: compressedFileName,
          originalSize: file.size,
          compressedSize,
        });
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar banner untuk dikompresi."));
      img.src = String(event.target?.result);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

/**
 * Kompresi gambar client-side sebelum upload ke server / Catbox:
 * - Batasi dimensi maksimum (1200px width/height)
 * - Target ukuran agresif ~85KB - 100KB (JPEG kualitas 0.68 dengan adaptive pass)
 * - Mengurangi ukuran file dari 2-5 MB menjadi ~85-100 KB agar web super cepat
 */
async function compressImageClient(
  file: File,
  maxDimension = 1200,
  quality = 0.68,
): Promise<{ dataUrl: string; fileName: string; originalSize: number; compressedSize: number }> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  if (ext === "svg" || ext === "gif") {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Gagal membaca file."));
      reader.readAsDataURL(file);
    });
    return {
      dataUrl,
      fileName: file.name,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Gagal membuat canvas kompresi."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
        const head = "data:image/jpeg;base64,";
        let b64Length = dataUrl.length - head.length;
        let compressedSize = Math.round((b64Length * 3) / 4);

        // Jika ukuran masih > 100 KB, turunkan kualitas secara adaptif ke target ~85-100 KB
        if (compressedSize > 100 * 1024 && currentQuality > 0.55) {
          currentQuality = 0.58;
          dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
          b64Length = dataUrl.length - head.length;
          compressedSize = Math.round((b64Length * 3) / 4);
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const compressedFileName = `${baseName}.jpg`;

        resolve({
          dataUrl,
          fileName: compressedFileName,
          originalSize: file.size,
          compressedSize,
        });
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar untuk dikompresi."));
      img.src = String(event.target?.result);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

/**
 * Field gambar admin: preview + input URL manual / lokal + tombol Upload (file -> WebP lokal atau Catbox -> link
 * otomatis terisi) + tombol Gallery (pilih dari upload-an sebelumnya).
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  aiPromptDefault,
  bannerMode = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [libOpen, setLibOpen] = useState(false);
  const [lib, setLib] = useState<UploadItem[]>([]);
  const [libBusy, setLibBusy] = useState(false);
  const [aiCustomOpen, setAiCustomOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    aiPromptDefault ||
      "E-commerce catalog photo, pure white background #ffffff, studio softbox lighting, centered product, sharp focus, 4k, clean and tidy",
  );
  const fileRef = useRef<HTMLInputElement | null>(null);

  const doEnhanceAI = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setBusy(true);
    setMsg("Memproses foto dengan Google Nano Banana AI…");
    try {
      const r = await adminEnhanceImage({
        data: {
          token: getAdminToken() ?? "",
          imageUrl: trimmed,
          prompt: aiPrompt,
        },
      });
      onChange(r.url);
      setMsg("✨ Foto berhasil dipoles AI & tersimpan ke katalog!");
    } catch (e) {
      setMsg(`AI gagal: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const doLocalStudioEnhance = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setBusy(true);
    setMsg("Memoles foto studio lokal (auto-contrast & brightness)…");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Gagal memuat gambar untuk poles lokal."));
        img.src = trimmed;
      });
      let width = img.width;
      let height = img.height;
      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Gagal akses canvas.");
      ctx.filter = "brightness(1.05) contrast(1.08) saturate(1.03)";
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.68);
      const fileName = `studio-${Date.now()}.jpg`;
      const r = await adminUploadImage({
        data: { token: getAdminToken() ?? "", fileName, dataUrl },
      });
      onChange(r.url);
      setMsg("✨ Foto berhasil dipoles filter studio lokal & terkompresi (~85-100KB)!");
    } catch (e) {
      setMsg(`Poles lokal gagal: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const doUpload = async (file: File) => {
    setBusy(true);
    if (bannerMode) {
      setMsg("Mengonversi ke WebP HD & menyimpan ke repository lokal…");
      try {
        const { dataUrl, fileName, originalSize, compressedSize } =
          await compressBannerWebpClient(file);
        const r = await adminUploadLocalBanner({
          data: { token: getAdminToken() ?? "", fileName, dataUrl },
        });
        onChange(r.url);
        const savedPct =
          originalSize > compressedSize
            ? ` (Hemat ${Math.round((1 - compressedSize / originalSize) * 100)}%: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB)`
            : "";
        setMsg(`✓ Tersimpan lokal: ${r.fileName} (WebP HD)${savedPct}`);
      } catch (e) {
        setMsg(`Upload banner gagal: ${errMsg(e)}`);
      } finally {
        setBusy(false);
      }
    } else {
      setMsg("Mengompresi & mengupload gambar…");
      try {
        const { dataUrl, fileName, originalSize, compressedSize } = await compressImageClient(file);
        const r = await adminUploadImage({
          data: { token: getAdminToken() ?? "", fileName, dataUrl },
        });
        onChange(r.url);
        const savedPct =
          originalSize > compressedSize
            ? ` (Hemat ${Math.round((1 - compressedSize / originalSize) * 100)}%: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB)`
            : "";
        setMsg(`Upload sukses!${savedPct}`);
      } catch (e) {
        setMsg(`Upload gagal: ${errMsg(e)}`);
      } finally {
        setBusy(false);
      }
    }
  };

  const openLibrary = async () => {
    setLibOpen(true);
    setLibBusy(true);
    try {
      const r = await adminListUploads({ data: { token: getAdminToken() ?? "" } });
      setLib(r.uploads as UploadItem[]);
    } catch (e) {
      setMsg(`Gagal buka Gallery: ${errMsg(e)}`);
      setLibOpen(false);
    } finally {
      setLibBusy(false);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link tersalin.");
    } catch {
      setMsg("Gagal menyalin — salin manual dari kolom URL.");
    }
  };

  const trimmed = value.trim();

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="adm-label">{label}</span>
        {bannerMode && (
          <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Format: WebP HD • Git-Push Direct
          </span>
        )}
      </div>
      <div className="mt-1 flex items-start gap-2">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {looksLikeImage(trimmed) ? (
            <img src={trimmed} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center text-[10px] text-muted-foreground">
              Belum ada gambar
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            value={value}
            placeholder={
              bannerMode
                ? "/banners/Buanacomputer-banner.webp (atau upload file di bawah)"
                : "https://… (atau upload di bawah)"
            }
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="adm-btn-pri inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <AdminIcon name="upload" className="text-[15px]" />
              {busy ? "Mengupload…" : bannerMode ? "Upload Banner WebP" : "Upload Gambar"}
            </button>
            <button
              type="button"
              onClick={openLibrary}
              className="adm-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <AdminIcon name="photo_library" className="text-[15px]" />
              Gallery
            </button>
            {trimmed && (
              <button
                type="button"
                onClick={() => copyLink(trimmed)}
                className="adm-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <AdminIcon name="content_copy" className="text-[15px]" />
                Salin Link
              </button>
            )}
            {!bannerMode && looksLikeImage(trimmed) && (
              <button
                type="button"
                onClick={doEnhanceAI}
                disabled={busy}
                title="Poles foto produk menjadi foto katalog studio latar putih bersih dengan Google Nano Banana AI"
                className="adm-btn-ghost inline-flex items-center gap-1 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-xs font-semibold"
              >
                <AdminIcon name="auto_fix_high" className="text-[15px]" />
                {busy ? "Memproses AI…" : "Poles AI"}
              </button>
            )}
            {!bannerMode && looksLikeImage(trimmed) && (
              <button
                type="button"
                onClick={doLocalStudioEnhance}
                disabled={busy}
                title="Poles kontras & kecerahan foto studio otomatis secara lokal tanpa butuh kuota AI"
                className="adm-btn-ghost inline-flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 text-xs font-semibold"
              >
                <AdminIcon name="tune" className="text-[15px]" />
                Poles Studio Lokal
              </button>
            )}
            {!bannerMode && looksLikeImage(trimmed) && (
              <button
                type="button"
                onClick={() => setAiCustomOpen((v) => !v)}
                className="text-[11px] text-purple-700 underline hover:text-purple-900 px-1 py-1"
              >
                {aiCustomOpen ? "Tutup Prompt" : "Atur Prompt"}
              </button>
            )}
          </div>
          {aiCustomOpen && !bannerMode && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-2.5 text-xs space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                Prompt Konsistensi Katalog AI
              </label>
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="adm-input text-xs"
                placeholder="Prompt visual AI..."
              />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void doUpload(file);
              e.target.value = "";
            }}
          />
          {hint && <p className="adm-sub text-[11px]">{hint}</p>}
          {bannerMode && (
            <p className="adm-sub text-[11px] text-emerald-800">
              💡 Banner otomatis terkompresi ke <strong>WebP HD</strong>, dinamai{" "}
              <code>Buanacomputer-*.webp</code>, dan tersimpan langsung di repositori untuk di-push
              ke GitHub.
            </p>
          )}
          {msg && <p className="font-mono text-[11px] text-slate-700">{msg}</p>}
        </div>
      </div>

      {libOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLibOpen(false)}
        >
          <div
            className="adm-card max-h-[80vh] w-full max-w-2xl overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold">Gallery Upload-an ({lib.length})</h3>
              <button
                onClick={() => setLibOpen(false)}
                className="adm-btn-ghost inline-flex items-center gap-1 px-2 py-1 text-xs"
              >
                <AdminIcon name="close" className="text-[15px]" />
                Tutup
              </button>
            </div>
            {libBusy ? (
              <p className="mt-3 text-sm text-muted-foreground">Memuat…</p>
            ) : lib.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada upload. Pakai tombol Upload Gambar dulu.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {lib.map((it) => (
                  <button
                    key={it.url}
                    onClick={() => {
                      onChange(it.url);
                      setMsg(`Dipilih dari Gallery: ${it.label}`);
                      setLibOpen(false);
                    }}
                    title={it.label}
                    className="group overflow-hidden rounded-lg border border-border hover:border-pri"
                  >
                    <img
                      src={it.url}
                      alt={it.label}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <span className="block truncate px-1 py-0.5 text-[10px] text-muted-foreground">
                      {it.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
