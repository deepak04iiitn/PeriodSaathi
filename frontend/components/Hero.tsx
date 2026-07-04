"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE, delay },
});

export default function Hero() {
  return (
    <section className="texture-grain relative pt-32 sm:pt-40 pb-20 sm:pb-28 bg-ivory">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center">
        {/* ── left: copy ── */}
        <div className="text-center lg:text-left">
          <motion.p
            {...fadeUp(0)}
            className="text-clay-dark font-medium text-sm tracking-wide mb-5 flex items-center gap-2 justify-center lg:justify-start"
          >
            <span className="h-px w-8 bg-clay/60" aria-hidden="true" />
            A gentle companion, right inside Telegram
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.12] text-plum"
          >
            Your period,
            <br />
            <em className="text-wine">quietly looked after.</em>
          </motion.h1>

          <motion.p
            {...fadeUp(0.18)}
            className="mt-6 text-base sm:text-lg text-plum/70 max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            No new app to learn. No account to remember. Open the chat you already
            use, and let PeriodSaathi keep track — gently, privately, on your time.
          </motion.p>

          <motion.div
            {...fadeUp(0.28)}
            className="mt-9 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start"
          >
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2
                bg-wine text-ivory font-medium text-base
                px-7 py-3.5 rounded-xl
                hover:bg-wine-dark
                transition-colors duration-200
              "
            >
              Start on Telegram
              <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
            </a>

            <a
              href="#how-it-works"
              className="
                inline-flex items-center justify-center gap-1.5
                text-plum/70 font-medium text-base
                px-7 py-3.5 rounded-xl border border-wine/15
                hover:border-wine/35 hover:text-plum
                transition-colors duration-200
              "
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            {...fadeUp(0.36)}
            className="mt-8 flex items-center gap-2 text-sm text-plum/50 justify-center lg:justify-start"
          >
            <Lock className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
            Private by default · No sign-up · Always free
          </motion.p>
        </div>

        {/* ── right: warm poster card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
          className="relative"
        >
          <div className="bg-wine-soft border border-wine/10 rounded-3xl px-8 py-12 sm:py-14 flex flex-col items-center text-center">
            <Image
              src="/PeriodSaathi.png"
              alt="PeriodSaathi — Your Cycle, Your Companion"
              width={200}
              height={200}
              className="w-32 sm:w-36 h-auto mix-blend-multiply"
              priority
            />
            <p className="mt-7 font-serif text-xl text-plum leading-snug">
              &ldquo;Every cycle is different.
              <br />
              <em className="text-wine">So is our care.</em>&rdquo;
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-plum/40">
              Made for you, one message at a time
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
