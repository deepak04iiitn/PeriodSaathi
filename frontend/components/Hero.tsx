"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

/* ── decorative petal SVG ─────────────────────────────────────────── */
function PetalDecor() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="78%" cy="18%" r="260" fill="#ffe0e8" fillOpacity="0.38" />
      <circle cx="12%" cy="82%" r="180" fill="#ffc2d1" fillOpacity="0.25" />
      <circle cx="6%"  cy="22%" r="90"  fill="#f9e4ea" fillOpacity="0.50" />
      <ellipse
        cx="82%" cy="64%" rx="120" ry="60"
        fill="#ffe0e8" fillOpacity="0.20"
        transform="rotate(-30 82% 64%)"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      <PetalDecor />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-24 pb-20 flex flex-col items-center text-center">

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="mb-6"
        >
          {/* outer glow ring */}
          <div className="relative inline-flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-blush-100 blur-2xl opacity-60 scale-110"
            />
            <Image
              src="/PeriodSaathi.png"
              alt="PeriodSaathi — Your Cycle, Your Companion"
              width={220}
              height={220}
              className="relative w-44 sm:w-52 h-auto mix-blend-multiply drop-shadow-sm"
              priority
            />
          </div>
        </motion.div>

        {/* ── SEO h1 (visually a descriptor subtitle) ── */}
        <motion.h1
          {...fadeUp(0.2)}
          className="sr-only"
        >
          PeriodSaathi — Period tracking inside Telegram
        </motion.h1>

        {/* ── descriptor ── */}
        <motion.p
          {...fadeUp(0.28)}
          className="text-base sm:text-lg text-bark/75 max-w-xl leading-relaxed"
        >
          Never miss your period again.{" "}
          <span className="text-bark/90 font-medium">
            Private reminders, smart predictions
          </span>{" "}
          — all inside Telegram.
          <br className="hidden sm:block" />
          No app download. No sign-up. Just chat.
        </motion.p>

        {/* ── CTA buttons ── */}
        <motion.div
          {...fadeUp(0.40)}
          className="mt-9 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center gap-2
              bg-blush text-white font-semibold text-base
              px-8 py-3.5 rounded-full shadow-md
              hover:bg-blush-400 hover:shadow-lg hover:scale-[1.03]
              active:scale-95
              transition-all duration-200
            "
          >
            Start Tracking — It&apos;s Free
            <span aria-hidden="true">→</span>
          </a>

          <a
            href="#how-it-works"
            className="
              inline-flex items-center justify-center gap-1
              text-bark/70 font-medium text-sm
              px-6 py-3.5 rounded-full border border-rose-warm
              hover:bg-feather hover:text-bark
              transition-all duration-200
            "
          >
            See how it works ↓
          </a>
        </motion.div>

        {/* ── trust badge ── */}
        <motion.p
          {...fadeUp(0.52)}
          className="mt-8 text-xs text-bark/45 tracking-wide uppercase"
        >
          100% private · No email · No password · Just Telegram
        </motion.p>
      </div>
    </section>
  );
}
