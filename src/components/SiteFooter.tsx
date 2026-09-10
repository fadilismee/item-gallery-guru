export function SiteFooter() {
  return (
    <footer id="kontak" className="border-t border-white/10 bg-[#0f0f0f] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 lg:gap-12 lg:py-12">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-black">
              BC
            </span>
            <span className="text-sm font-bold tracking-tight">BUANA COMPUTER</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
            Toko laptop, PC rakitan, dan aksesoris komputer. Melayani satuan & korporat. Cek katalog
            online sebelum ke toko — harga transparan, garansi jelas.
          </p>
          <p className="mt-4 text-xs text-white/40">
            Mertosan Kulon, Potorono, Banguntapan, Bantul 55196
          </p>
        </div>

        <div className="text-sm">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">Kontak</h4>
          <ul className="mt-4 space-y-2 text-white/60">
            <li>
              WhatsApp:{" "}
              <a
                href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white hover:text-white hover:underline"
              >
                6285979220599
              </a>
            </li>
            <li>Alamat: Mertosan Kulon, Potorono, Kec. Banguntapan, Bantul, DIY 55196</li>
            <li>
              <a
                href="https://google.com"
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
            Jam Buka & Layanan
          </h4>
          <ul className="mt-4 space-y-2 text-white/60">
            <li>Senin – Sabtu: 09.00 – 20.00 WIB</li>
            <li>Minggu: 10.00 – 17.00 WIB (janjian WA)</li>
            <li className="pt-2">
              <a href="/jual" className="text-white hover:underline">
                Jual Barang Rusak →
              </a>
            </li>
            <li>
              <a
                href="https://google.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Services & Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Buana Computer. Semua hak dilindungi.</p>
          <div className="flex gap-4">
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white/70"
            >
              Syarat Layanan
            </a>
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white/70"
            >
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
