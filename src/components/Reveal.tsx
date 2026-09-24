import { useEffect, useState, type ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  scale?: boolean;
};

export function Reveal({ children, className = "", delayMs = 0, scale = false }: RevealProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: inView && delayMs > 0 ? `${delayMs}ms` : "0ms",
      }}
      className={`${scale ? "buana-reveal-scale" : "buana-reveal"}${
        inView ? " is-visible" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

type CountUpProps = {
  end: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function CountUp({
  end,
  durationMs = 1600,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const { ref, inView } = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(easeOut * end);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [inView, end, durationMs]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("id-ID");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
