import { useEffect, useState } from "react";
import { adminGetDataset, adminSaveDataset } from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "./AdminIcon";

type Props = {
  /** Nama dataset server: products | reviews | blog | banners | paymentSettings */
  name: string;
  title: string;
  /** Data terkini dari halaman (untuk inisialisasi teks) */
  data: unknown;
  /** Dipanggil dengan data segar dari server setelah reload/save */
  onReloaded: (data: never) => void;
};

/**
 * Editor JSON mentah seluruh dataset. Hanya dipakai di Mode Teknis.
 * Save selalu melewati validasi zod server — data rusak ditolak.
 */
export function JsonEditor({ name, title, data, onReloaded }: Props) {
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setText(JSON.stringify(data, null, 2));
    setTouched(false);
  }, [data]);

  const reload = async () => {
    setBusy(true);
    setMsg("");
    try {
      const r = await adminGetDataset({ data: { token: getAdminToken() ?? "", name } });
      onReloaded(r.data as never);
      setMsg("Dimuat ulang dari file.");
    } catch (e) {
      setMsg(`Gagal muat: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Bukan JSON valid — periksa kurung/koma.");
      }
      await adminSaveDataset({ data: { token: getAdminToken() ?? "", name, data: parsed } });
      const r = await adminGetDataset({ data: { token: getAdminToken() ?? "", name } });
      onReloaded(r.data as never);
      setMsg("JSON tersimpan (lolos validasi).");
    } catch (e) {
      setMsg(`Gagal simpan: ${errMsg(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50/60 p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="inline-flex items-center gap-2 font-heading text-sm font-bold">
          <span className="adm-icon-chip sm violet">
            <AdminIcon name="terminal" />
          </span>
          {title} (Mode Teknis)
        </span>
        <AdminIcon
          name={open ? "expand_less" : "expand_more"}
          className="text-[20px] text-slate-500"
        />
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            rows={14}
            spellCheck={false}
            onChange={(e) => {
              setText(e.target.value);
              setTouched(true);
            }}
            className="adm-input font-mono text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={save}
              disabled={busy || !touched}
              className="adm-btn-pri px-4 py-1.5 text-xs"
            >
              {busy ? "Memproses…" : "Simpan JSON"}
            </button>
            <button onClick={reload} disabled={busy} className="adm-btn-ghost px-4 py-1.5 text-xs">
              Muat Ulang
            </button>
            {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Hati-hati: menyimpan menimpa seluruh file. Validasi server menolak data rusak.
          </p>
        </div>
      )}
    </section>
  );
}
