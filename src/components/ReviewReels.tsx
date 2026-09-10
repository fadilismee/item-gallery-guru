import { useState } from "react";
import { reviewReels } from "@/data/reviews";

export function ReviewReels() {
  const reels = [...reviewReels, ...reviewReels];
  const [pressed, setPressed] = useState(false);

  const stop = () => setPressed(true);
  const go = () => setPressed(false);

  return (
    <section aria-label="Testimoni pembeli" className="mx-auto max-w-7xl px-4 pb-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Testimoni Pembeli</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Geser otomatis • bentuk Reels 9:16 • tekan & tahan untuk berhenti
          </p>
        </div>
        <a
          href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20mau%20lihat%20testimoni"
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm font-medium text-primary hover:underline sm:block"
        >
          Lihat semua →
        </a>
      </div>

      <div
        className="group relative mt-5 select-none overflow-hidden rounded-xl [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        onMouseDown={stop}
        onMouseUp={go}
        onMouseLeave={go}
        onTouchStart={stop}
        onTouchEnd={go}
        onTouchCancel={go}
      >
        <div
          className="flex w-max gap-3 animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={{ animationPlayState: pressed ? "paused" : undefined }}
        >
          {reels.map((r, idx) => (
            <div
              key={`${r.id}-${idx}`}
              role="button"
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                stop();
              }}
              onMouseUp={go}
              onTouchStart={stop}
              onTouchEnd={go}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  if (e.type === "keydown" && !pressed) stop();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") go();
              }}
              onBlur={go}
              className="relative flex w-[148px] shrink-0 cursor-grab flex-col overflow-hidden rounded-2xl border bg-card active:cursor-grabbing sm:w-[176px] lg:w-[192px] aspect-[9/16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${r.name} - ${r.title}`}
            >
              {r.mediaType === "video" ? (
                <video
                  src={r.mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <img
                    src={r.mediaUrl}
                    alt={r.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 w-full p-3">
                    <p className="line-clamp-1 text-xs font-bold leading-tight text-white">
                      {r.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/85">
                      {r.text}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-foreground">
                        {r.name.charAt(0)}
                      </span>
                      <span className="line-clamp-1 text-[11px] font-medium text-white/90">
                        {r.name}
                      </span>
                      <span className="ml-auto text-[11px] text-amber-300">★ {r.rating}</span>
                    </div>
                    {r.productLabel && (
                      <p className="mt-1.5 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                        {r.productLabel}
                      </p>
                    )}
                  </div>
                </>
              )}
              {r.mediaType === "video" && (
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                  ▶ Video
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Tekan & tahan reels untuk berhenti, lepas untuk jalan lagi
      </p>
    </section>
  );
}
