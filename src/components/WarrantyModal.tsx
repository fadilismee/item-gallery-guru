import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";

export function WarrantyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
              Kebijakan Garansi, Retur &amp; Refund
            </h2>
            <p className="text-xs text-muted-foreground">
              Standar Perlindungan Pembeli Buana Computer Store • Banguntapan, Bantul
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-6 text-xs leading-relaxed text-foreground">
          {/* Section 1: Masa Garansi */}
          <div>
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-primary">
              <FileText size={16} />
              1. Masa Garansi Toko Resmi
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="font-bold text-foreground">Laptop Second</p>
                <p className="mt-1 text-muted-foreground">
                  Garansi hardware <strong>1 Bulan</strong> (Mainboard, RAM, SSD, Layar, Keyboard).
                  Baterai 14 hari pemakaian wajar.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="font-bold text-foreground">PC Rakitan</p>
                <p className="mt-1 text-muted-foreground">
                  Garansi toko <strong>1 – 3 Bulan</strong>. Part baru mengikuti garansi resmi
                  distributor 1–3 tahun.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="font-bold text-foreground">Storage &amp; Part</p>
                <p className="mt-1 text-muted-foreground">
                  SSD &amp; Hardisk garansi <strong>3 – 12 Bulan</strong> (Sentinel 100% langsung
                  tukar baru).
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Syarat Klaim & Retur */}
          <div>
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-primary">
              <PackageCheck size={16} />
              2. Syarat &amp; Ketentuan Klaim Retur
            </h3>
            <div className="mt-2.5 space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3">
                <Video size={18} className="mt-0.5 shrink-0 text-primary" />
                <p>
                  <strong className="text-foreground">Wajib Video Unboxing:</strong> Rekam video
                  saat paket dibuka pertama kali tanpa jeda/pause sebagai bukti kondisi fisik saat
                  diterima dari kurir.
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <p>
                  <strong className="text-foreground">Segel Toko Utuh:</strong> Segel garansi Buana
                  Computer pada baut casing atau komponen tidak boleh sobek, rusak, atau dibongkar
                  sendiri tanpa izin teknisi.
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <p>
                  <strong className="text-foreground">Bukan Kerusakan Pengguna:</strong> Garansi
                  tidak mencakup kerusakan akibat jatuh/pecah, terkena tumpahan cairan, atau
                  lonjakan listrik/petir di lokasi pembeli.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Alur Solusi & Refund Dana */}
          <div>
            <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-primary">
              <RotateCcw size={16} />
              3. Alur Solusi Retur &amp; Jaminan 100% Refund
            </h3>
            <div className="mt-2.5 space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-foreground">
              <p>
                <strong>Tahap 1 (Tukar Unit / Komponen):</strong> Jika ditemukan cacat hardware
                selama masa garansi, unit/komponen langsung diganti unit setara tanpa biaya
                tambahan.
              </p>
              <p>
                <strong>Tahap 2 (Pengembalian Dana 100%):</strong> Jika stok unit pengganti tidak
                tersedia atau tidak ada solusi yang disepakati,{" "}
                <strong>dana dikembalikan 100% utuh</strong> ke rekening pembeli maksimal 1×24 jam
                setelah barang sampai di toko.
              </p>
            </div>
          </div>

          {/* Section 4: Kontak Bantuan */}
          <div className="rounded-2xl border border-border bg-card p-3.5 text-center">
            <p className="font-bold text-foreground">Butuh Bantuan Klaim atau Konsultasi?</p>
            <p className="mt-1 text-muted-foreground">
              Hubungi WhatsApp Customer Support Toko: <strong>0859-7922-0599</strong>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Trust Badge & Button in Product Details
 */
export function WarrantyTrustBox() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-heading text-xs font-bold text-foreground">
                Jaminan Garansi Toko &amp; Retur Aman
              </p>
              <p className="text-[11px] text-muted-foreground">
                Garansi hardware resmi, 100% refund jika barang tidak sesuai.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
          >
            Baca Kebijakan →
          </button>
        </div>
      </div>

      <WarrantyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
