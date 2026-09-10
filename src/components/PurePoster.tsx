import purePoster from "@/img/reff-v2.png";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

export function PurePoster({ src = purePoster, alt = "Poster Buana Computer", className }: Props) {
  return (
    <section
      className={`w-full border-y border-black/10 bg-black ${className ?? ""}`}
      aria-label="Poster"
    >
      <img src={src} alt={alt} className="h-auto w-full object-cover" loading="lazy" />
    </section>
  );
}
