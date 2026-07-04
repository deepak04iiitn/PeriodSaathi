import { ArrowRight } from "lucide-react";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";

export default function CTASection() {
  return (
    <section className="texture-grain bg-wine">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-24 sm:py-28 text-center">
        <p className="text-wine-soft/80 font-medium text-sm tracking-wide mb-4">
          Ready when you are
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ivory leading-snug mb-4">
          Take the stress out of tracking.
        </h2>
        <p className="text-ivory/70 text-sm mb-10 leading-relaxed">
          It takes less than 60 seconds to set up — and you already have
          everything you need.
        </p>

        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center justify-center gap-2
            bg-ivory text-wine font-medium text-base
            px-8 py-3.5 rounded-xl
            hover:bg-paper
            transition-colors duration-200
          "
        >
          Open PeriodSaathi on Telegram
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
        </a>

        <p className="mt-6 text-xs text-ivory/45 tracking-wide">
          Free · Private · No sign-up required
        </p>
      </div>
    </section>
  );
}
