import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { WarrantyModal } from "@/components/WarrantyModal";

export function SiteFooter() {
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  return (
    <footer id="kontak" className="border-t border-white/10 bg-[#0f0f0f] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:gap-12 lg:grid-cols-[1.5fr_1fr] lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/Buanacomputer-logo.png"
                alt="Buana Computer"
                className="h-8 w-auto object-contain brightness-0 invert"
                loading="lazy"
              />
              <span className="text-sm font-bold tracking-tight">BUANA COMPUTER STORE</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              Toko laptop second teruji, PC rakitan custom, monitor IPS, dan komponen komputer
              berkualitas di Bantul, Yogyakarta. Transparansi kondisi 100%, garansi toko resmi.
            </p>
            <p className="mt-4 text-xs text-white/40">
              Mertosan Kulon, Potorono, Banguntapan, Bantul 55196
            </p>
          </div>

          <div className="text-sm">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              Kontak &amp; Gerai
            </h4>
            <ul className="mt-4 space-y-2 text-white/60">
              <li>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-white hover:text-white hover:underline"
                >
                  0859-7922-0599
                </a>
              </li>
              <li>Alamat: Mertosan Kulon, Potorono, Kec. Banguntapan, Bantul, DIY 55196</li>
              <li>
                <a
                  href="https://maps.google.com/?q=-7.8372069,110.4148331"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Lihat di Google Maps →
                </a>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              Jam Operasional
            </h4>
            <ul className="mt-4 space-y-2 text-white/60">
              <li>Senin – Sabtu: 09.00 – 20.00 WIB</li>
              <li>Minggu: 10.00 – 17.00 WIB (janjian WA)</li>
              <li className="pt-2 text-xs text-emerald-400">
                ✓ Fasilitas Coba Unit Langsung di Toko
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              Menu Toko
            </h4>
            <ul className="mt-4 space-y-2 text-white/60">
              <li>
                <Link to="/" className="hover:text-white hover:underline">
                  Katalog Laptop &amp; PC
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white hover:underline">
                  Buana Journal &amp; Tips
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white hover:underline">
                  Tentang Toko
                </Link>
              </li>
              <li>
                <a
                  href="https://www.tokopedia.com/bmccomp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline"
                >
                  Toko Tokopedia Resmi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-[200px] w-full overflow-hidden rounded-lg sm:h-[260px] lg:h-auto lg:min-h-[300px]">
          <iframe
            src="https://maps.google.com/maps?q=-7.8372069,110.4148331&z=17&hl=id&output=embed"
            title="Lokasi Buana Computer Bantul"
            className="h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Buana Computer Store. Semua hak dilindungi.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setWarrantyOpen(true)}
              className="text-emerald-400 hover:underline hover:text-emerald-300 font-semibold"
            >
              🛡️ Kebijakan Garansi &amp; Refund
            </button>
            <Link to="/about" className="hover:text-white/70">
              Tentang Toko
            </Link>
            <Link to="/about" className="hover:text-white/70">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>

      <WarrantyModal open={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
    </footer>
  );
}
