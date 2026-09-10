import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ImageCanvas } from "@/components/ImageCanvas";
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

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Toko Komputer
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Laptop, PC Rakitan & Aksesoris Lengkap
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Semua produk toko dalam satu katalog. Klik produk untuk melihat foto,
              spesifikasi, dan detail garansi.
            </p>
            <div className="mt-6 flex max-w-md gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari laptop, VGA, monitor..."
                className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
              <button className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Cari
              </button>
            </div>
          </div>
          <ImageCanvas ratio="wide" label="Banner Promo" />
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
