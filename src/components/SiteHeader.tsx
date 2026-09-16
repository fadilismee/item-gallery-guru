import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/data/cartStore";
import { formatPrice } from "@/data/products";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type SiteHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

export function SiteHeader({ query: propQuery, onQueryChange }: SiteHeaderProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";
  // Samain semua page: search selalu ada, di home pakai prop filter langsung, di page lain redirect ke /?q= saat submit/enter
  const [localQuery, setLocalQuery] = useState("");
  const query = propQuery ?? localQuery;
  const handleQueryChange = (value: string) => {
    if (onQueryChange) onQueryChange(value);
    setLocalQuery(value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isHome) {
      navigate({ to: "/", search: { q: query.trim() || undefined } as never });
    }
  };
  const items = useCart((s) => s.items);
  const count = useCart((s) => s.count)();
  const subtotal = useCart((s) => s.subtotal)();
  const remove = useCart((s) => s.remove);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const waCartMessage = encodeURIComponent(
    `Halo Buana Computer, saya mau checkout:\n` +
      items
        .map((it) => `- ${it.product.name} x${it.qty} = ${formatPrice(it.product.price * it.qty)}`)
        .join("\n") +
      `\nTotal: ${formatPrice(subtotal)}\nMohon info stok & pembayaran, terima kasih!`,
  );
  const waCartHref = `https://wa.me/6285979220599?text=${waCartMessage}`;

  const marqueeItems = [
    "Konsultasi Gratis — Chat WA 6285979220599 →",
    "Harga Terbaik & Garansi Resmi — Tanya Stok Sekarang →",
    "Jual Rusak? HP 80rb–600rb • Laptop 500rb–2,5jt — Estimasi Via WA →",
    "Bantul 55196 — Jemput Gratis Area Bantul →",
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar — running text CTA hover pause (simple) */}
      <div className="bg-[#0f0f0f] text-white overflow-hidden">
        <div className="group flex items-center whitespace-nowrap py-1.5 text-[10px] tracking-wide sm:py-2 sm:text-[11px]">
          <div className="flex w-max animate-marquee items-center gap-8 group-hover:[animation-play-state:paused] sm:gap-10 [animation-duration:20s]">
            {[...marqueeItems, ...marqueeItems].map((txt, i) => (
              <span key={`${txt}-${i}`} className="px-2 text-white/80">
                {txt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Buanacomputer-logo.png"
              alt="Buana Computer"
              className="h-8 w-auto object-contain"
              loading="eager"
            />
            <span className="hidden text-[15px] font-bold tracking-tight text-black sm:block">
              BUANA<span className="font-light"> COMPUTER</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 text-[13px] font-medium text-black/70 lg:flex">
            <Link to="/" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Katalog
            </Link>
            <Link to="/jual" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Jual
            </Link>
            <Link to="/blog" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Blog
            </Link>
            <Link to="/about" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Tentang
            </Link>
            <a href="#kontak" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Kontak
            </a>
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="mx-4 hidden max-w-md flex-1 lg:flex">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">
                ⌕
              </span>
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                placeholder="Cari laptop, VGA, monitor..."
                aria-label="Cari produk"
                className="h-9 w-full rounded-full border border-black/10 bg-muted/50 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-black/20 focus:bg-white"
              />
            </div>
          </form>

          {/* Mobile Spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Action buttons (Search, Cart, Mobile Menu) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 hover:bg-black hover:text-white lg:hidden"
              aria-label="Cari"
            >
              ⌕
            </button>

            {/* Keranjang hover desktop, click toggle mobile */}
            <div
              className="relative"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button
                onClick={() => setOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 hover:bg-black hover:text-white"
                aria-label="Keranjang"
              >
                🛒
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>

              {open && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setOpen(false)}
                  />
                  <div className="fixed inset-x-4 top-20 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:w-80 sm:pt-2">
                    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-2xl sm:rounded-xl sm:p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">Keranjang Belanja</h4>
                        <button
                          onClick={() => setOpen(false)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted lg:hidden"
                          aria-label="Tutup keranjang"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {items.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Keranjang masih kosong.
                        </p>
                      ) : (
                        <>
                          <ul className="mt-3 max-h-64 space-y-3 overflow-auto pr-1">
                            {items.map((it) => (
                              <li key={it.product.id} className="flex gap-3">
                                <img
                                  src={it.product.image}
                                  alt={it.product.name}
                                  className="h-12 w-12 rounded-lg object-cover border"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-1 text-xs font-medium text-foreground">
                                    {it.product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatPrice(it.product.price)} × {it.qty}
                                  </p>
                                </div>
                                <button
                                  onClick={() => remove(it.product.id)}
                                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                  Hapus
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 border-t pt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="font-bold text-foreground">
                                {formatPrice(subtotal)}
                              </span>
                            </div>
                            <a
                              href={waCartHref}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setOpen(false)}
                              className="mt-3 flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/80"
                            >
                              Checkout via WhatsApp
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <a
              href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/70 hover:border-black/20 hover:text-black sm:inline-flex"
            >
              Chat WA
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 hover:bg-black hover:text-white lg:hidden"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down navigation drawer */}
        {menuOpen && (
          <div className="border-t border-black/10 bg-white px-4 py-5 shadow-lg lg:hidden animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-1 text-sm font-medium text-black/80">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-black/5 hover:text-black"
              >
                <span>Katalog Laptop & PC</span>
                <span className="text-xs text-muted-foreground">Belanja →</span>
              </Link>
              <Link
                to="/jual"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-black/5 hover:text-black"
              >
                <span>Jual Hardware Bekas & Rusak</span>
                <span className="rounded bg-pri/10 px-2 py-0.5 text-xs font-semibold text-pri">
                  Cair Instan
                </span>
              </Link>
              <Link
                to="/blog"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-black/5 hover:text-black"
              >
                <span>Buana Journal & Tips</span>
                <span className="text-xs text-muted-foreground">Artikel →</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-black/5 hover:text-black"
              >
                <span>Tentang Lab Buana</span>
                <span className="text-xs text-muted-foreground">Profil →</span>
              </Link>
              <a
                href="#kontak"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-black/5 hover:text-black"
              >
                <span>Lokasi & Kontak</span>
                <span className="text-xs text-muted-foreground">Bantul DIY →</span>
              </a>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5">
              <a
                href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                Hubungi WhatsApp (0859-7922-0599)
              </a>
            </div>
          </div>
        )}
      </div>
      {searchOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-2 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">
              ⌕
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
              }}
              placeholder="Cari laptop, VGA, monitor..."
              aria-label="Cari produk"
              className="h-9 w-full rounded-full border border-black/10 bg-muted/50 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-black/20 focus:bg-white"
            />
          </form>
        </div>
      )}
    </header>
  );
}
