import { useRef, useState } from "react";
import { adminListUploads, adminUploadImage } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "./AdminIcon";

type UploadItem = { url: string; label: string; at: string };

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

const inputCls = "adm-input";

function looksLikeImage(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

/**
 * Field gambar admin: preview + input URL manual + tombol Upload (file -> Catbox -> link
 * otomatis terisi) + tombol Gallery (pilih dari upload-an sebelumnya).
 */
export function ImageField({ label, value, onChange, hint }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [libOpen, setLibOpen] = useState(false);
  const [lib, setLib] = useState<UploadItem[]>([]);
  const [libBusy, setLibBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const doUpload = async (file: File) => {
    setBusy(true);
    setMsg("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Gagal membaca file."));
        reader.readAsDataURL(file);
      });
      const r = await adminUploadImage({
        data: { token: getAdminToken() ?? "", fileName: file.name, dataUrl },
      });
      onChange(r.url);
      setMsg("Upload OK — link sudah terisi otomatis.");
    } catch (e) {
      setMsg(`Upload gagal: ${errMsg(e)}`);
    } finally {
      setBusy(false);
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
      <span className="adm-label">{label}</span>
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
            placeholder="https://… (atau upload di bawah)"
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
              {busy ? "Mengupload…" : "Upload Gambar"}
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
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void doUpload(f);
            }}
          />
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          {msg && <p className="text-[11px] text-muted-foreground">{msg}</p>}
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
