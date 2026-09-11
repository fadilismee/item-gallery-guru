import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ReviewReels } from "@/components/ReviewReels";
import { PurePoster } from "@/components/PurePoster";
import { Button } from "@/components/ui/button";
import { formatPrice, getProduct, products } from "@/data/products";
import { useCart } from "@/data/cartStore";
import reff1 from "@/img/reff1.jpg";

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
    const title = `${product.name} - Buana Computer`;
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

  const related = (() => {
    const same = products.filter((p) => p.category === product.category && p.id !== product.id);
    if (same.length >= 4) return same.slice(0, 4);
    const others = products
      .filter((p) => p.category !== product.category && p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4 - same.length);
    return [...same, ...others].slice(0, 4);
  })();

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const waMessage = encodeURIComponent(
    `Halo Buana Computer, saya tertarik ${product.name} — ${formatPrice(product.price)} x ${qty}. Apakah masih ready? (WA: 6285979220599)`,
  );
  const waHref = `https://wa.me/6285979220599?text=${waMessage}`;

  const handleAddToCart = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
        <div className="relative grid min-h-36 overflow-hidden rounded-xl border border-primary/20 bg-primary sm:grid-cols-[minmax(0,1fr)_340px] sm:items-center">
          <img
            src={reff1}
            alt="Poster promo"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/80">
              Promo Buana Computer
            </p>
            <h2 className="mt-2 text-xl font-bold text-primary-foreground sm:text-2xl">
              Promo khusus {product.category}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
              Tanya stok & garansi via WA 6285979220599 — foto asli menyusul.
            </p>
          </div>
          <div className="relative hidden h-full min-h-36 items-center justify-center bg-primary/20 sm:flex">
            <span className="rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {product.brand}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 lg:grid-cols-[380px_1fr]">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              src={product.gallery[active] ?? product.image}
              alt={`${product.name} foto ${active + 1}`}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {product.gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-lg border p-0.5 transition-colors ${
                  active === i ? "border-primary" : "border-transparent"
                }`}
                aria-label={`Lihat foto ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`thumb ${i + 1}`}
                  loading="lazy"
                  className="aspect-square w-full object-cover rounded-md"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isFeatured && (
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
                ★ 4.5 • Produk Pilihan
              </span>
            )}
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
              Stok {product.stock}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-primary">
            {product.brand} &middot; {product.condition}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-foreground">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            &#9733; {product.rating} &middot; {product.sold} terjual &middot; Stok {product.stock}
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
              <Button asChild className="h-10 flex-1 px-6 sm:flex-none">
                <a href={waHref} target="_blank" rel="noreferrer">
                  Hubungi Penjual
                </a>
              </Button>
              <Button variant="outline" className="h-10 px-6 sm:px-4" onClick={handleAddToCart}>
                {added ? "✓ Ditambahkan" : "+ Keranjang"}
              </Button>
            </div>
            {(product.tokopediaUrl || product.shopeeUrl) && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {product.tokopediaUrl && (
                  <Button asChild className="h-10 bg-[#03AC0E] text-white hover:bg-[#03940C]">
                    <a href={product.tokopediaUrl} target="_blank" rel="noreferrer">
                      <img
                        src="https://cdn.simpleicons.org/tokopedia/FFFFFF"
                        alt="Tokopedia"
                        className="h-4 w-4"
                      />
                      Tokopedia
                    </a>
                  </Button>
                )}
                {product.shopeeUrl && (
                  <Button asChild className="h-10 bg-[#EE4D2D] text-white hover:bg-[#D73211]">
                    <a href={product.shopeeUrl} target="_blank" rel="noreferrer">
                      <img
                        src="https://cdn.simpleicons.org/shopee/FFFFFF"
                        alt="Shopee"
                        className="h-4 w-4"
                      />
                      Shopee
                    </a>
                  </Button>
                )}
              </div>
            )}
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

      <ReviewReels />

      <PurePoster />

      <SiteFooter />
    </div>
  );
}
