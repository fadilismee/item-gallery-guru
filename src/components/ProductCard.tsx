import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/data/cartStore";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const add = useCart((s) => s.add);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <Link
        to="/produk/$productId"
        params={{ productId: product.id }}
        className="relative block p-2"
      >
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://picsum.photos/seed/${product.id}/600/600`;
            }}
          />
        </div>
        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-md bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span
            className={`absolute left-4 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow ${discount > 0 ? "top-10" : "top-4"}`}
          >
            ★ 4.5 • Produk Pilihan
          </span>
        )}
        {product.condition === "Bekas" && (
          <span className="absolute right-4 top-4 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
            Bekas
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
        <Link
          to="/produk/$productId"
          params={{ productId: product.id }}
          className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-auto pt-2">
          <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            ★ {product.rating} · {product.sold} terjual · Stok {product.stock}
          </p>
          <p className="text-xs text-muted-foreground">{product.location}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full h-8 text-xs"
            onClick={(e) => {
              e.preventDefault();
              add(product, 1);
            }}
          >
            + Keranjang
          </Button>
          {(product.tokopediaUrl || product.shopeeUrl) && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {product.tokopediaUrl && (
                <Button
                  asChild
                  size="sm"
                  className="h-8 bg-[#03AC0E] text-white hover:bg-[#03940C] text-[11px] px-2"
                >
                  <a href={product.tokopediaUrl} target="_blank" rel="noreferrer">
                    <img
                      src="https://cdn.simpleicons.org/tokopedia/FFFFFF"
                      alt="Tokopedia"
                      className="h-3.5 w-3.5"
                    />
                    Tokopedia
                  </a>
                </Button>
              )}
              {product.shopeeUrl && (
                <Button
                  asChild
                  size="sm"
                  className="h-8 bg-[#EE4D2D] text-white hover:bg-[#D73211] text-[11px] px-2"
                >
                  <a href={product.shopeeUrl} target="_blank" rel="noreferrer">
                    <img
                      src="https://cdn.simpleicons.org/shopee/FFFFFF"
                      alt="Shopee"
                      className="h-3.5 w-3.5"
                    />
                    Shopee
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
