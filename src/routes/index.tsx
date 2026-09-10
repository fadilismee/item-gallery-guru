import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ImageCanvas } from "@/components/ImageCanvas";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MicroComputer - Katalog Laptop, PC Rakitan & Aksesoris" },
      {
        name: "description",
        content:
          "Katalog lengkap laptop, PC rakitan, monitor, komponen, dan aksesoris komputer dengan harga terbaik.",
      },
      { property: "og:title", content: "MicroComputer - Katalog Laptop & PC" },
      {
        property: "og:description",
        content:
          "Jelajahi katalog laptop, PC rakitan, monitor, dan aksesoris komputer lengkap dengan spesifikasi.",
      },
    ],
  }),
  component: Index,
});

const sorts = [
  { id: "populer", label: "Terpopuler" },
  { id: "termurah", label: "Harga Terendah" },
  { id: "termahal", label: "Harga Tertinggi" },
] as const;

function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("populer");

  const list = useMemo(() => {
    let out = products.filter(
      (p) =>
        (category === "Semua" || p.category === category) &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())),
    );
    out = [...out].sort((a, b) => {
      if (sort === "termurah") return a.price - b.price;
      if (sort === "termahal") return b.price - a.price;
      return b.sold - a.sold;
    });
    return out;
  }, [query, category, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-card py-5 sm:py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative flex min-h-[440px] items-end overflow-hidden rounded-2xl bg-primary sm:min-h-[400px] md:items-center">
            <div className="absolute inset-0 flex items-center justify-center border border-dashed border-primary-foreground/30 bg-primary">
              <span className="absolute right-5 top-5 rounded-md border border-primary-foreground/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70 sm:right-8 sm:top-8">
                Area Poster Utama
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/30 md:bg-gradient-to-r" />
            <div className="relative z-10 w-full p-6 sm:p-10 md:w-3/5 md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                Toko Komputer
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                Laptop, PC Rakitan & Aksesoris Lengkap
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
                Semua produk toko dalam satu katalog. Klik produk untuk melihat foto,
                spesifikasi, dan detail garansi.
              </p>
              <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:max-w-lg">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari laptop, VGA, monitor..."
                  aria-label="Cari produk"
                  className="h-11 min-w-0 rounded-lg border border-primary-foreground/20 bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-ring"
                />
                <Button variant="secondary" className="h-11 shrink-0 px-5">
                  Cari
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-lg font-bold text-foreground">Kategori</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? "Semua" : c)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors ${
                category === c
                  ? "border-primary bg-accent text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <ImageCanvas label="Ikon" className="w-full" />
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="relative grid min-h-40 overflow-hidden rounded-xl border border-dashed border-border bg-muted sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Area Poster Promo
            </p>
            <h2 className="mt-2 max-w-xl text-xl font-bold text-foreground sm:text-2xl">
              Tempat promo mingguan, produk baru, atau pengumuman toko
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ganti area ini dengan poster horizontal Anda.
            </p>
          </div>
          <div className="flex items-center justify-center border-t border-dashed border-border px-8 py-5 sm:h-full sm:min-w-64 sm:border-l sm:border-t-0">
            <span className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Poster Horizontal
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">
            {category === "Semua" ? "Semua Produk" : category}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {list.length} produk
            </span>
          </h2>
          <div className="flex gap-2">
            {sorts.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Produk tidak ditemukan.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
