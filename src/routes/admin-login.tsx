import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { adminLogin } from "@/server/admin";
import { errMsg, setAdminRole, setAdminToken } from "@/lib/adminClient";
import { AdminIcon } from "@/components/admin/AdminIcon";

export const Route = createFileRoute("/admin-login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await adminLogin({ data: { password } });
      setAdminToken(res.token);
      setAdminRole(res.role);
      navigate({ to: "/admin" });
    } catch (err) {
      const msg = errMsg(err);
      if (msg === "2FA_REQUIRED") {
        // Password benar — lanjut ke langkah kode authenticator
        setStep(2);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await adminLogin({ data: { password, code } });
      setAdminToken(res.token);
      setAdminRole(res.role);
      navigate({ to: "/admin" });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page flex items-center justify-center px-4">
      {step === 1 ? (
        <form onSubmit={submitPassword} className="adm-card w-full max-w-sm p-6 sm:p-7">
          <p className="adm-eyebrow">Buana Hub • Portal Lab & Media</p>
          <h1 className="font-heading mt-1 text-2xl font-extrabold text-on-surface">Buana Admin</h1>
          <p className="adm-sub mt-1">
            Langkah 1 dari 2 — masukkan password tim (<code>ADMIN_PASSWORD</code> di{" "}
            <code>.env</code>). Tim verifikasi eksternal memakai password reviewer khusus (-mode
            lihat saja, tanpa 2FA).
          </p>
          <label className="adm-label mt-4">
            Password
            <span className="relative mt-1 block">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="adm-input pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <AdminIcon name={show ? "visibility_off" : "visibility"} />
              </button>
            </span>
          </label>
          {error && <p className="adm-alert-err mt-2">{error}</p>}
          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="adm-btn-pri mt-4 inline-flex w-full items-center justify-center gap-1.5 py-2.5"
          >
            {busy ? "Memeriksa…" : "Lanjut"}
            {!busy && <AdminIcon name="arrow_forward" className="text-[18px]" />}
          </button>
          <p className="mt-3 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <AdminIcon name="storefront" className="text-[15px]" />
              Kembali ke Toko
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="adm-card w-full max-w-sm p-6 sm:p-7">
          <p className="adm-eyebrow">Verifikasi 2 Langkah</p>
          <h1 className="font-heading mt-1 text-2xl font-extrabold text-on-surface">
            Kode Authenticator
          </h1>
          <p className="adm-sub mt-1">
            Langkah 2 dari 2 — buka aplikasi authenticator (Google Authenticator / 1Password /
            Bitwarden) lalu masukkan 6 digit yang tampil.
          </p>
          <label className="adm-label mt-4">
            Kode 6 digit
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="adm-input mt-1 text-center font-mono text-2xl font-bold tracking-[0.5em]"
            />
          </label>
          {error && <p className="adm-alert-err mt-2">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="adm-btn-pri mt-4 inline-flex w-full items-center justify-center gap-1.5 py-2.5"
          >
            {busy ? "Memverifikasi…" : "Masuk Dashboard"}
            {!busy && <AdminIcon name="verified_user" className="text-[18px]" />}
          </button>
          <p className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              ← Kembali ke password
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
