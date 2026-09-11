import purePoster from "@/img/Buanacomputer-footer.png";
import banners from "@/data/banners.json";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

export function PurePoster({
  src = (banners.footer as string) || purePoster,
  alt = "Poster Buana Computer",
  className,
}: Props) {
  return (
    <section
      className={`w-full border-y border-black/10 bg-black ${className ?? ""}`}
      aria-label="Poster"
    >
      <img src={src} alt={alt} className="h-auto w-full object-cover" loading="lazy" />
    </section>
  );
}
