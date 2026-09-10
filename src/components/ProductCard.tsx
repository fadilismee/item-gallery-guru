import { Link } from "@tanstack/react-router";
import { ImageCanvas } from "./ImageCanvas";
import { formatPrice, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      to="/produk/$productId"
      params={{ productId: product.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative p-2">
        <ImageCanvas label="Foto" />
        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-md bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
          {product.name}
        </h3>
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
        </div>
      </div>
    </Link>
  );
}
