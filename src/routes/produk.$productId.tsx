import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ImageCanvas } from "@/components/ImageCanvas";
import { Button } from "@/components/ui/button";
import { formatPrice, getProduct, products } from "@/data/products";

export const Route = createFileRoute("/produk/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produk tidak ditemukan" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} - MicroComputer`;
    return {
      meta: [
        { title },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Katalog
        </Link>
        <span className="mx-1">/</span>
        <span>{product.category}</span>
        <span className="mx-1">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="relative grid min-h-36 overflow-hidden rounded-xl border border-dashed border-primary-foreground/25 bg-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/65">
              Area Poster Produk
            </p>
            <h2 className="mt-2 text-xl font-bold text-primary-foreground sm:text-2xl">
              Promo khusus {product.category}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/70">
              Tempatkan poster promo, bonus pembelian, atau informasi garansi di area ini.
            </p>
          </div>
          <div className="flex items-center justify-center border-t border-dashed border-primary-foreground/25 px-8 py-5 sm:h-full sm:min-w-64 sm:border-l sm:border-t-0">
            <span className="text-center text-[11px] font-medium uppercase tracking-widest text-primary-foreground/65">
              Poster Detail
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 lg:grid-cols-[380px_1fr]">
        <div>
          <ImageCanvas label={`Foto ${active + 1}`} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: product.images }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-lg border p-0.5 transition-colors ${
                  active === i ? "border-primary" : "border-transparent"
                }`}
              >
                <ImageCanvas label={`${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            {product.brand} &middot; {product.condition}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-foreground">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            &#9733; {product.rating} &middot; {product.sold} terjual &middot; Stok{" "}
            {product.stock}
          </p>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-input">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 text-lg text-muted-foreground hover:text-foreground"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-semibold text-foreground">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="h-10 w-10 text-lg text-muted-foreground hover:text-foreground"
                >
                  +
                </button>
              </div>
              <Button className="h-10 flex-1 px-6 sm:flex-none">
                Hubungi Penjual
              </Button>
              <Button variant="outline" className="h-10 px-6">
                Simpan
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-bold text-foreground">Spesifikasi</h2>
            <dl className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
              {product.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-3 gap-2 bg-card px-4 py-2.5 text-sm">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="col-span-2 text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-bold text-foreground">Deskripsi Produk</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8">
          <h2 className="text-lg font-bold text-foreground">Produk Serupa</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
