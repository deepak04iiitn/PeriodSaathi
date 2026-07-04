"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const steps = [
  {
    number: "01",
    emoji: "💬",
    heading: "Open the bot",
    copy: "Find @PeriodSaathi on Telegram and tap Start. No sign-up, no form to fill.",
  },
  {
    number: "02",
    emoji: "📅",
    heading: "Log your period",
    copy: 'Tell the bot when your last period started — just type the date or say "today".',
  },
  {
    number: "03",
    emoji: "🔔",
    heading: "Get reminded",
    copy: "We'll remind you 3 days, 1 day, and on the day your next period is due.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 bg-white/60">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-blush font-semibold text-sm uppercase tracking-widest mb-3">
            Three simple steps
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark">
            Set up in under 60 seconds
          </h2>
        </motion.div>

        {/* steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {/* connecting line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute top-10 left-[calc(16.7%+1.5rem)] right-[calc(16.7%+1.5rem)] h-px bg-gradient-to-r from-rose-warm via-blush-200 to-rose-warm"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                ease: EASE,
                delay: 0.15 + i * 0.12,
              }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* circle with emoji */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-rose-soft border-2 border-rose-warm flex items-center justify-center text-3xl shadow-sm">
                  {step.emoji}
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blush text-white text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-bark mb-2">
                {step.heading}
              </h3>
              <p className="text-bark/65 text-sm leading-relaxed max-w-[230px]">
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
