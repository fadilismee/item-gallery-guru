import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
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
    const url = `https://buanacomputer.web.id/produk/${product.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: product.shortDescription },
        {
          name: "keywords",
          content: `${product.name}, ${product.brand}, ${product.category}, toko komputer bantul, yogyakarta`,
        },
        { property: "og:type", content: "product" },
        { property: "og:title", content: title },
        { property: "og:description", content: product.shortDescription },
        { property: "og:image", content: product.image },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: product.shortDescription },
        { name: "twitter:image", content: product.image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductDetail,
});

function ImageLightbox({
  images,
  initialIndex = 0,
  title,
  onClose,
}: {
  images: string[];
  initialIndex?: number;
  title: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, onClose, prev]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-3 sm:p-6 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex w-full max-w-5xl items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          <p className="truncate text-sm sm:text-base font-bold">{title}</p>
          <p className="text-xs text-white/60">
            Foto {currentIndex + 1} dari {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Tutup foto"
        >
          <X size={20} />
        </button>
      </div>

      {/* Middle stage */}
      <div
        className="relative flex flex-1 w-full max-w-5xl items-center justify-center p-2 sm:p-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 sm:left-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors shadow-lg"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={images[currentIndex]}
          alt={`${title} foto ${currentIndex + 1}`}
          className="max-h-[65vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 select-none"
        />

        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors shadow-lg"
            aria-label="Foto selanjutnya"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex w-full max-w-5xl items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                currentIndex === idx
                  ? "border-primary scale-105 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const galleryImages =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const currentVariant = hasVariants ? product.variants![selectedVariantIndex] : undefined;
  const currentPrice = currentVariant ? currentVariant.price : product.price;
  const currentOldPrice = currentVariant?.oldPrice ?? product.oldPrice;
  const currentStock = currentVariant?.stock ?? product.stock;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: galleryImages,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "IDR",
      availability:
        currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://buanacomputer.web.id/produk/${product.id}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.sold,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Katalog",
        item: "https://buanacomputer.web.id/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: "https://buanacomputer.web.id/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://buanacomputer.web.id/produk/${product.id}`,
      },
    ],
  };

  const related = (() => {
    const same = products.filter((p) => p.category === product.category && p.id !== product.id);
    if (same.length >= 4) return same.slice(0, 4);
    const others = products
      .filter((p) => p.category !== product.category && p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4 - same.length);
    return [...same, ...others].slice(0, 4);
  })();

  const discount = currentOldPrice
    ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
    : 0;

  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const variantLabel = currentVariant ? ` (Varian: ${currentVariant.name})` : "";
  const waMessage = encodeURIComponent(
    `Halo Buana Computer, saya tertarik ${product.name}${variantLabel} — ${formatPrice(currentPrice)} x ${qty}. Apakah masih ready? (WA: 6285979220599)`,
  );
  const waHref = `https://wa.me/6285979220599?text=${waMessage}`;

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    add(product, qty, currentVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Katalog
        </Link>
        <span className="mx-1">/</span>
        <span>{product.category}</span>
        <span className="mx-1">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-8">
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

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:pb-16 lg:grid-cols-[380px_1fr] lg:gap-10">
        <div>
          <div
            onClick={() => openLightbox(active)}
            className="group/main-img relative aspect-square overflow-hidden rounded-xl border bg-muted cursor-zoom-in"
            title="Klik untuk melihat foto lebih besar"
          >
            <img
              src={galleryImages[active] ?? product.image}
              alt={`${product.name} foto ${active + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/main-img:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover/main-img:opacity-100 pointer-events-none">
              <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                <ZoomIn size={14} /> Klik untuk memperbesar
              </span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-2 py-0.5 font-monotech text-[10px] font-semibold text-white backdrop-blur-sm sm:hidden">
              🔍 Zoom
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {galleryImages.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                onDoubleClick={() => openLightbox(i)}
                className={`overflow-hidden rounded-lg border p-0.5 transition-colors ${
                  active === i ? "border-primary ring-2 ring-primary/20" : "border-transparent"
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
            {currentStock > 0 ? (
              <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
                Stok {currentStock}
              </span>
            ) : (
              <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                Stok Habis
              </span>
            )}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-primary">
            {product.brand} &middot; {product.condition}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-foreground">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            &#9733; {product.rating} &middot; {product.sold} terjual &middot;{" "}
            {currentStock > 0 ? `Stok ${currentStock}` : "Stok Habis"}
          </p>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(currentPrice)}
              </span>
              {currentOldPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(currentOldPrice)}
                  </span>
                  <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Pilihan Varian Produk */}
            {hasVariants && (
              <div className="mt-4 border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pilihan Varian:
                  </span>
                  <span className="text-xs font-bold text-primary">{currentVariant?.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants!.map((v, i) => {
                    const activeVariant = selectedVariantIndex === i;
                    const isOutOfStock = typeof v.stock === "number" && v.stock <= 0;
                    return (
                      <button
                        key={v.name}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariantIndex(i)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                          activeVariant
                            ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                            : isOutOfStock
                              ? "border-border bg-muted/40 text-muted-foreground/50 line-through cursor-not-allowed"
                              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="ml-1.5 opacity-80 font-mono">{formatPrice(v.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-xs font-medium text-muted-foreground sm:hidden">
                  Kuantitas:
                </span>
                <div className="flex items-center rounded-lg border border-input">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={currentStock <= 0}
                    className="flex h-9 w-9 items-center justify-center text-lg text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Kurangi jumlah"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-semibold text-foreground">
                    {currentStock > 0 ? qty : 0}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(currentStock, q + 1))}
                    disabled={currentStock <= 0 || qty >= currentStock}
                    className="flex h-9 w-9 items-center justify-center text-lg text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Tambah jumlah"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1">
                <Button asChild className="h-10 flex-1 font-semibold">
                  <a href={waHref} target="_blank" rel="noreferrer" className="truncate">
                    Hubungi Penjual
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1 font-medium truncate"
                  disabled={currentStock <= 0}
                  onClick={handleAddToCart}
                >
                  {currentStock <= 0 ? "Stok Habis" : added ? "✓ Ditambahkan" : "+ Keranjang"}
                </Button>
              </div>
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
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Produk Serupa</h2>
          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ReviewReels />

      <PurePoster />

      <SiteFooter />

      {lightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          title={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
