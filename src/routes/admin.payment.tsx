import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminGetDataset,
  adminGetPaymentSecrets,
  adminSaveDataset,
  adminSavePaymentSecrets,
  adminTestPaymentConnection,
  type PaymentSecrets,
} from "@/server/admin";
import { errMsg, getAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { isEasyMode, useAdminMode } from "@/lib/adminMode";

export const Route = createFileRoute("/admin/payment")({
  component: AdminPayment,
});

type MethodSetting = { id: string; label: string; enabled: boolean };

type PaymentSettings = {
  activeGateway: "tripay" | "tokopay" | "manual";
  mode: "sandbox" | "live";
  methods: MethodSetting[];
  staticQrisUrl: string;
  shipping: { javaFee: number; outsideJavaFee: number };
};

const GATEWAYS = [
  {
    id: "tripay" as const,
    label: "Tripay.co.id",
    desc: "QRIS dinamis + Virtual Account bank. Rekomendasi utama toko.",
  },
  {
    id: "tokopay" as const,
    label: "Tokopay.id",
    desc: "QRIS via Tokopay. Aktifkan bila jalur API Tokopay sudah dibuka.",
  },
  {
    id: "manual" as const,
    label: "Manual (WA / COD saja)",
    desc: "Matikan semua pembayaran otomatis. Pembeli hanya via WhatsApp, COD, & marketplace.",
  },
] as const;

const blankSecrets = (): PaymentSecrets => ({
  tripay: { merchantCode: "", apiKey: "", privateKey: "" },
  tokopay: { merchantId: "", secretKey: "" },
});

function AdminPayment() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [secrets, setSecrets] = useState<PaymentSecrets>(blankSecrets());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});
  const [confirmingSave, setConfirmingSave] = useState(false);

  const token = () => getAdminToken() ?? "";
  const adminMode = useAdminMode((s) => s.mode);

  useEffect(() => {
    adminGetDataset({ data: { token: token(), name: "paymentSettings" } })
      .then((r) => {
        const d = r.data as PaymentSettings;
        setSettings({
          ...d,
          shipping: d.shipping ?? { javaFee: 25000, outsideJavaFee: 40000 },
        });
      })
      .catch((e) => setError(errMsg(e)));
    adminGetPaymentSecrets({ data: { token: token() } })
      .then((r) => setSecrets(r.secrets))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setBusy("settings");
    setError("");
    setNotice("");
    try {
      await adminSaveDataset({
        data: { token: token(), name: "paymentSettings", data: settings },
      });
      setNotice("Pengaturan pembayaran tersimpan. Klik Terbitkan agar live di website.");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
      setConfirmingSave(false);
    }
  };

  const saveSecrets = async () => {
    setBusy("secrets");
    setError("");
    setNotice("");
    try {
      await adminSavePaymentSecrets({ data: { token: token(), secrets } });
      setNotice(
        "Kredensial API tersimpan aman di server lokal (tidak ikut ter-push ke GitHub). Restart dev server agar payment live memakai key baru.",
      );
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const testConnection = async (gateway: "tripay" | "tokopay") => {
    setBusy(`test-${gateway}`);
    setTestMsg((p) => ({ ...p, [gateway]: "" }));
    try {
      const r = await adminTestPaymentConnection({
        data: { token: token(), gateway },
      });
      setTestMsg((p) => ({ ...p, [gateway]: `✓ ${r.message}` }));
    } catch (e) {
      setTestMsg((p) => ({ ...p, [gateway]: `✗ ${errMsg(e)}` }));
    } finally {
      setBusy(null);
    }
  };

  const toggleMethod = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      methods: settings.methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    });
  };

  const setMethodLabel = (id: string, label: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      methods: settings.methods.map((m) => (m.id === id ? { ...m, label } : m)),
    });
  };

  const secretInputCls = "adm-input mt-1 font-mono text-xs";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="adm-eyebrow">Pengaturan Toko & Kasir Online</p>
          <h1 className="adm-h1 mt-1">Pembayaran & Gateway</h1>
          <p className="adm-sub mt-1">
            Atur gateway aktif, mode sandbox/live, metode yang tampil di checkout, dan API key —
            semua dari sini.
          </p>
        </div>
        <button
          onClick={() => setConfirmingSave(true)}
          disabled={busy === "settings" || !settings}
          className="adm-btn-pri inline-flex items-center gap-1.5"
        >
          <AdminIcon name="save" className="text-[18px]" />
          {busy === "settings" ? "Menyimpan…" : "Simpan Pengaturan"}
        </button>
      </div>

      {error && <p className="adm-alert-err">{error}</p>}
      {notice && <p className="adm-alert-ok">{notice}</p>}

      {/* ---------- gateway aktif ---------- */}
      <section className="adm-card p-4 sm:p-5">
        <h2 className="font-heading text-lg font-extrabold">Gateway Pembayaran Aktif</h2>
        <p className="adm-sub mt-0.5">
          Gateway inilah yang dipakai tombol “Beli Langsung” di web. Mode Manual mematikan seluruh
          pembayaran otomatis.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {GATEWAYS.map((g) => {
            const active = settings?.activeGateway === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => settings && setSettings({ ...settings, activeGateway: g.id })}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-pri bg-pri/5 shadow-sm ring-2 ring-pri/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-on-surface">{g.label}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      active ? "border-pri bg-pri text-white" : "border-slate-300 text-transparent"
                    } text-[12px]`}
                  >
                    ✓
                  </span>
                </div>
                <p className="adm-sub mt-1 text-[11px] leading-relaxed">{g.desc}</p>
              </button>
            );
          })}
        </div>

        {settings && settings.activeGateway !== "manual" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-xs font-bold text-on-surface">Mode transaksi:</span>
            {(["sandbox", "live"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSettings({ ...settings, mode: m })}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  settings.mode === m
                    ? m === "live"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {m === "live" ? "● Live (uang asli)" : "◐ Sandbox (testing)"}
              </button>
            ))}
            <span className="adm-sub text-[11px]">
              {settings.mode === "live"
                ? "QR yang keluar bisa discan m-banking & uang sungguhan masuk."
                : "QR hanya simulasi developer — untuk uji alur tanpa uang asli."}
            </span>
          </div>
        )}
      </section>

      {/* ---------- metode pembayaran ---------- */}
      <section className="adm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-extrabold">Metode yang Tampil di Checkout</h2>
            <p className="adm-sub">
              {settings?.methods.filter((m) => m.enabled).length ?? 0} dari{" "}
              {settings?.methods.length ?? 0} metode aktif tampil ke pembeli.
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {(settings?.methods ?? []).map((m) => (
            <div
              key={m.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors ${
                m.enabled ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                role="switch"
                aria-checked={m.enabled}
                onClick={() => toggleMethod(m.id)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  m.enabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    m.enabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {m.id}
                </p>
                <input
                  value={m.label}
                  onChange={(e) => setMethodLabel(m.id, e.target.value)}
                  className="adm-input mt-0.5 text-xs font-semibold"
                />
              </div>
              <span
                className={`font-mono text-[10px] font-bold ${
                  m.enabled ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                {m.enabled ? "TAMPIL" : "SEMBUNYI"}
              </span>
            </div>
          ))}
        </div>
        <p className="adm-sub mt-2 text-[11px]">
          💡 QRIS & Virtual Account membutuhkan gateway Tripay/Tokopay yang aktif. COD & transfer
          manual selalu bisa dipakai tanpa gateway.
        </p>
      </section>

      {/* ---------- kredensial API ---------- */}
      <section className="adm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-extrabold">Kredensial API Gateway</h2>
            <p className="adm-sub">
              Tersimpan di <code>src/data/paymentSecrets.json</code> (gitignored —{" "}
              <strong>tidak ikut ter-push ke GitHub</strong>).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSecrets((v) => !v)}
              className="adm-btn-ghost inline-flex items-center gap-1 py-1.5 text-xs"
            >
              <AdminIcon
                name={showSecrets ? "visibility_off" : "visibility"}
                className="text-[15px]"
              />
              {showSecrets ? "Sembunyikan" : "Tampilkan"}
            </button>
            <button
              onClick={saveSecrets}
              disabled={busy === "secrets"}
              className="adm-btn-pri inline-flex items-center gap-1 py-1.5 text-xs"
            >
              <AdminIcon name="save" className="text-[15px]" />
              {busy === "secrets" ? "Menyimpan…" : "Simpan Kredensial"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Tripay */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold">Tripay.co.id</h3>
              <button
                type="button"
                onClick={() => testConnection("tripay")}
                disabled={busy === "test-tripay"}
                className="adm-btn-ghost inline-flex items-center gap-1 px-3 py-1 text-xs"
              >
                <AdminIcon name="wifi_tethering" className="text-[15px] text-pri" />
                {busy === "test-tripay" ? "Mengetes…" : "Tes Koneksi"}
              </button>
            </div>
            <label className="adm-label mt-3">
              Kode Merchant
              <input
                value={secrets.tripay.merchantCode}
                onChange={(e) =>
                  setSecrets({
                    ...secrets,
                    tripay: { ...secrets.tripay, merchantCode: e.target.value },
                  })
                }
                placeholder="T..."
                type={showSecrets ? "text" : "password"}
                className={secretInputCls}
              />
            </label>
            <label className="adm-label mt-2">
              API Key <span className="text-slate-400">(awalan DEV- = sandbox)</span>
              <input
                value={secrets.tripay.apiKey}
                onChange={(e) =>
                  setSecrets({ ...secrets, tripay: { ...secrets.tripay, apiKey: e.target.value } })
                }
                placeholder="DEV-... / ..."
                type={showSecrets ? "text" : "password"}
                className={secretInputCls}
              />
            </label>
            <label className="adm-label mt-2">
              Private Key
              <input
                value={secrets.tripay.privateKey}
                onChange={(e) =>
                  setSecrets({
                    ...secrets,
                    tripay: { ...secrets.tripay, privateKey: e.target.value },
                  })
                }
                placeholder="..."
                type={showSecrets ? "text" : "password"}
                className={secretInputCls}
              />
            </label>
            {testMsg.tripay && (
              <p
                className={`mt-2 font-mono text-[11px] ${
                  testMsg.tripay.startsWith("✓") ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {testMsg.tripay}
              </p>
            )}
          </div>

          {/* Tokopay */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold">Tokopay.id</h3>
              <button
                type="button"
                onClick={() => testConnection("tokopay")}
                disabled={busy === "test-tokopay"}
                className="adm-btn-ghost inline-flex items-center gap-1 px-3 py-1 text-xs"
              >
                <AdminIcon name="wifi_tethering" className="text-[15px] text-pri" />
                {busy === "test-tokopay" ? "Mengetes…" : "Tes Koneksi"}
              </button>
            </div>
            <label className="adm-label mt-3">
              Merchant ID
              <input
                value={secrets.tokopay.merchantId}
                onChange={(e) =>
                  setSecrets({
                    ...secrets,
                    tokopay: { ...secrets.tokopay, merchantId: e.target.value },
                  })
                }
                placeholder="M..."
                type={showSecrets ? "text" : "password"}
                className={secretInputCls}
              />
            </label>
            <label className="adm-label mt-2">
              Secret Key
              <input
                value={secrets.tokopay.secretKey}
                onChange={(e) =>
                  setSecrets({
                    ...secrets,
                    tokopay: { ...secrets.tokopay, secretKey: e.target.value },
                  })
                }
                placeholder="..."
                type={showSecrets ? "text" : "password"}
                className={secretInputCls}
              />
            </label>
            {testMsg.tokopay && (
              <p
                className={`mt-2 font-mono text-[11px] ${
                  testMsg.tokopay.startsWith("✓") ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {testMsg.tokopay}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- tarif ongkir flat ---------- */}
      <section className="adm-card p-4 sm:p-5">
        <h2 className="font-heading text-lg font-extrabold">Tarif Ongkir Flat</h2>
        <p className="adm-sub">
          Zona tujuan ditentukan otomatis oleh AI Gemini dari alamat / GPS pembeli. COD / ambil di
          toko selalu gratis ongkir.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="adm-label">
            Ongkir Pulau Jawa (Rp)
            <input
              type="number"
              min={0}
              step={1000}
              value={settings?.shipping.javaFee ?? 25000}
              onChange={(e) =>
                settings &&
                setSettings({
                  ...settings,
                  shipping: {
                    ...settings.shipping,
                    javaFee: Math.max(0, Number(e.target.value) || 0),
                  },
                })
              }
              className="adm-input mt-1 font-mono"
            />
          </label>
          <label className="adm-label">
            Ongkir Luar Pulau Jawa (Rp)
            <input
              type="number"
              min={0}
              step={1000}
              value={settings?.shipping.outsideJavaFee ?? 40000}
              onChange={(e) =>
                settings &&
                setSettings({
                  ...settings,
                  shipping: {
                    ...settings.shipping,
                    outsideJavaFee: Math.max(0, Number(e.target.value) || 0),
                  },
                })
              }
              className="adm-input mt-1 font-mono"
            />
          </label>
        </div>
      </section>

      {/* ---------- QRIS statis fallback ---------- */}
      <section className="adm-card p-4 sm:p-5">
        <h2 className="font-heading text-lg font-extrabold">QRIS Statis Toko (Opsional)</h2>
        <p className="adm-sub">
          Jika gateway sedang maintenance, tempel URL gambar QRIS cetak toko di sini sebagai
          cadangan yang tampil di invoice.
        </p>
        <input
          value={settings?.staticQrisUrl ?? ""}
          onChange={(e) => settings && setSettings({ ...settings, staticQrisUrl: e.target.value })}
          placeholder="https://… (URL gambar QRIS statis toko, boleh kosong)"
          className="adm-input mt-2 font-mono text-xs"
        />
      </section>

      {!isEasyMode(adminMode) && settings && (
        <JsonEditor
          name="paymentSettings"
          title="Data paymentSettings.json"
          data={settings}
          onReloaded={(d) => setSettings(d as PaymentSettings)}
        />
      )}
      {confirmingSave && (
        <ConfirmDialog
          title="Simpan Pengaturan Pembayaran?"
          message="Perubahan gateway, mode, dan metode checkout disimpan ke paymentSettings.json. Jangan lupa Terbitkan agar live di website."
          onCancel={() => setConfirmingSave(false)}
          onConfirm={saveSettings}
        />
      )}
    </div>
  );
}
