import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1200, className, suffix }: Props) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
