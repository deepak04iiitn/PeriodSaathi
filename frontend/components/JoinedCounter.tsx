"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const POLL_MS = 60_000;
const MIN_TO_SHOW = 10;

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Eases the displayed number toward `target` whenever it changes, instead of jumping. */
function useCountUp(target: number | null) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === null) return;

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const duration = Math.min(1400, 500 + Math.abs(delta) * 4);
    const start = performance.now();

    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return display;
}

export default function JoinedCounter() {
  const [count, setCount] = useState<number | null>(null);
  const displayCount = useCountUp(count);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats/joined-count`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") setCount(data.count);
      } catch {
        // Silently ignore — the counter simply won't render.
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (count === null || count <= MIN_TO_SHOW) return null;

  return (
    <section className="bg-ivory">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14 flex justify-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-3 bg-wine-soft/60 border border-wine/10 rounded-full px-6 py-3"
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-clay"
              animate={{ scale: [1, 2.2], opacity: [0.55, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-clay-dark" />
          </span>

          <p className="text-sm sm:text-base text-plum/75">
            <span className="font-serif text-lg text-wine">
              {displayCount.toLocaleString()}+
            </span>{" "}
            women are already tracking with PeriodSaathi
          </p>
        </motion.div>
      </div>
    </section>
  );
}
