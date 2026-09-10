import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ReviewReels } from "@/components/ReviewReels";
import { PurePoster } from "@/components/PurePoster";
import { HeroCarousel } from "@/components/HeroCarousel";
import { categories, products } from "@/data/products";

const categoryImages: Record<string, string> = {
  Laptop: "https://picsum.photos/seed/cat-laptop/200/200",
  "PC Rakitan": "https://picsum.photos/seed/cat-pc/200/200",
  Monitor: "https://picsum.photos/seed/cat-monitor/200/200",
  Komponen: "https://picsum.photos/seed/cat-komponen/200/200",
  Aksesoris: "https://picsum.photos/seed/cat-aksesoris/200/200",
  Storage: "https://picsum.photos/seed/cat-storage/200/200",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buana Computer - Katalog Laptop, PC Rakitan & Aksesoris" },
      {
        name: "description",
        content:
          "Katalog lengkap Buana Computer: laptop, PC rakitan, monitor, komponen, dan aksesoris komputer dengan harga terbaik. WA 6285979220599.",
      },
      { property: "og:title", content: "Buana Computer - Katalog Laptop & PC" },
      {
        property: "og:description",
        content:
          "Jelajahi katalog Buana Computer — laptop, PC rakitan, monitor, dan aksesoris komputer lengkap dengan spesifikasi dan harga.",
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
      <SiteHeader query={query} onQueryChange={setQuery} />

      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-foreground">Kategori</h2>
          <span className="text-xs text-muted-foreground">{categories.length} kategori</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setCategory("Semua")}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              category === "Semua"
                ? "border-black bg-black text-white"
                : "border-border bg-white text-muted-foreground hover:border-black/20 hover:text-foreground"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? "Semua" : c)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "border-black bg-black text-white"
                  : "border-border bg-white text-muted-foreground hover:border-black/20 hover:text-foreground"
              }`}
            >
              <img
                src={categoryImages[c] ?? `https://picsum.photos/seed/cat-${c}/200/200`}
                alt={c}
                loading="lazy"
                className="h-5 w-5 rounded-full object-cover"
              />
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
          <p className="mt-10 text-center text-sm text-muted-foreground">Produk tidak ditemukan.</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <PurePoster />

      <ReviewReels />

      <SiteFooter />
    </div>
  );
}
