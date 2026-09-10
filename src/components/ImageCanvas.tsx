import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  ratio?: "square" | "wide";
};

/** Blank image placeholder — replace with real photos later. */
export function ImageCanvas({ label = "Foto Produk", className, ratio = "square" }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted",
        ratio === "square" ? "aspect-square" : "aspect-[16/9]",
        className,
      )}
    >
      <span className="px-2 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
