"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageCircle, CalendarDays, BellRing } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const steps = [
  {
    number: "01",
    Icon: MessageCircle,
    heading: "Open the bot",
    copy: "Find @PeriodSaathi on Telegram and tap Start. No sign-up, no form to fill.",
  },
  {
    number: "02",
    Icon: CalendarDays,
    heading: "Log start & end",
    copy: 'Tell it when your period starts — and again when it ends. Just type a date or say "today".',
  },
  {
    number: "03",
    Icon: BellRing,
    heading: "Get reminded",
    copy: "We'll remind you 3 days, 1 day, and on the day your next period is due — based on your real averages.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 sm:py-28 bg-ivory">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="text-clay-dark font-medium text-sm tracking-wide mb-3">
            Three simple steps
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-plum">
            Set up in under 60 seconds
          </h2>
        </motion.div>

        {/* steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-wine/10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-8 sm:py-0"
            >
              <span className="font-serif text-5xl text-wine-soft leading-none select-none">
                {step.number}
              </span>

              <div className="w-10 h-10 rounded-lg bg-clay-soft flex items-center justify-center -mt-5 mb-5">
                <step.Icon className="w-5 h-5 text-clay-dark" strokeWidth={2} aria-hidden="true" />
              </div>

              <h3 className="font-serif text-lg text-plum mb-2">{step.heading}</h3>
              <p className="text-plum/60 text-sm leading-relaxed max-w-[230px]">
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
