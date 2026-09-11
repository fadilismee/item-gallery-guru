import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/data/cartStore";
import { formatPrice } from "@/data/products";
import { useState } from "react";

type SiteHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

export function SiteHeader({ query: propQuery, onQueryChange }: SiteHeaderProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";
  // Samain semua page: search selalu ada, di home pakai prop filter langsung, di page lain redirect ke /?q=
  const [localQuery, setLocalQuery] = useState("");
  const query = propQuery ?? localQuery;
  const handleQueryChange = (value: string) => {
    if (onQueryChange) onQueryChange(value);
    else setLocalQuery(value);
    if (!isHome && value.trim()) {
      navigate({ to: "/", search: { q: value } as never });
    } else if (!isHome && !value.trim()) {
      navigate({ to: "/" });
    }
  };
  const items = useCart((s) => s.items);
  const count = useCart((s) => s.count)();
  const subtotal = useCart((s) => s.subtotal)();
  const remove = useCart((s) => s.remove);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
        <div className="group flex items-center whitespace-nowrap py-1 sm:py-1.5 text-[10px] sm:text-[11px] tracking-wide">
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
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 lg:gap-6">
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
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black"
            >
              Services
            </a>
            <a href="#kontak" className="rounded px-2.5 py-2 hover:bg-black/5 hover:text-black">
              Kontak
            </a>
          </nav>

          <nav className="flex items-center gap-1 text-sm font-medium text-black/70 lg:hidden">
            <Link to="/" className="rounded px-2.5 py-2 hover:bg-black/5">
              Katalog
            </Link>
            <Link to="/jual" className="rounded px-2.5 py-2 hover:bg-black/5">
              Jual
            </Link>
          </nav>

          <div className="mx-4 hidden max-w-md flex-1 lg:flex">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">
                ⌕
              </span>
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Cari laptop, VGA, monitor..."
                aria-label="Cari produk"
                className="h-9 w-full rounded-full border border-black/10 bg-muted/50 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-black/20 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 lg:hidden" />
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 hover:bg-black hover:text-white lg:hidden"
            aria-label="Cari"
          >
            ⌕
          </button>

          <div className="flex items-center gap-1">
            {/* Keranjang hover samping — ringan, no page, hover tampil + WA checkout */}
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
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white p-4 shadow-xl">
                  <h4 className="text-sm font-bold text-foreground">Keranjang</h4>
                  {items.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Keranjang kosong — klik + Keranjang di produk
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
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 border-t pt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                        </div>
                        <a
                          href={waCartHref}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setOpen(false)}
                          className="mt-3 flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/80"
                        >
                          Checkout via WA
                        </a>
                        <p className="mt-2 text-center text-[11px] text-muted-foreground">
                          CO langsung ke WA 6285979220599
                        </p>
                      </div>
                    </>
                  )}
                </div>
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
          </div>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-2 lg:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">
              ⌕
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Cari laptop, VGA, monitor..."
              aria-label="Cari produk"
              className="h-9 w-full rounded-full border border-black/10 bg-muted/50 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-black/20 focus:bg-white"
            />
          </div>
        </div>
      )}
    </header>
  );
}
