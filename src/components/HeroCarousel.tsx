import { useEffect, useRef, useState } from "react";
import reff1 from "@/img/reff1.jpg";
import reff2 from "@/img/reff2.jpg";
import reff3 from "@/img/reff3.jpg";
import reffV2 from "@/img/reff-v2.png";

type Props = {
  images?: string[];
  interval?: number;
};

const defaultImages = [reff1, reff2, reff3, reffV2];

export function HeroCarousel({ images = defaultImages, interval = 3000 }: Props) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const len = images.length;

  const start = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % len);
    }, interval);
  };

  useEffect(() => {
    start();
    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [len, interval]);

  const go = (i: number) => setIndex(((i % len) + len) % len);

  // touch swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    pausedRef.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    if (startX !== null && endX !== null) {
      const diff = endX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) go(index + 1);
        else go(index - 1);
      }
    }
    touchStartX.current = null;
    setTimeout(() => (pausedRef.current = false), 800);
  };

  return (
    <section
      className="w-full bg-black"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Hero carousel"
    >
      <div className="relative w-full overflow-hidden h-[78vh] min-h-[520px] sm:h-[82vh] sm:min-h-[560px] lg:h-[88vh] lg:min-h-[600px] xl:h-[92vh]">
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="h-full w-full shrink-0">
              <img
                src={src}
                alt={`Hero ${i + 1}`}
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Dots lonjong ala asus.com */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
