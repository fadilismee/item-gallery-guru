import { AdminIcon } from "./AdminIcon";

/**
 * Dialog konfirmasi bertema pengganti window.confirm().
 * Render sebagai overlay + kartu modal; tutup via Batal / klik luar.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="adm-overlay" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          className="adm-card w-full max-w-sm p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="adm-icon-chip red">
            <AdminIcon name="warning" />
          </span>
          <h3 className="font-heading mt-2 text-base font-bold">{title}</h3>
          <p className="adm-sub mt-1">{message}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={onCancel} className="adm-btn-ghost flex-1">
              Batal
            </button>
            <button onClick={onConfirm} disabled={busy} className="adm-btn-danger flex-1">
              {busy ? "Memproses…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
