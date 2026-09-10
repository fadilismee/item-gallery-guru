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
            &#9733; {product.rating} &middot; {product.sold} terjual
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
        </div>
      </div>
    </div>
  );
}
