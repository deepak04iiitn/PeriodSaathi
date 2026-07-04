const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";

export default function CTASection() {
  return (
    <section className="py-24 gradient-cta">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-blush font-semibold text-sm uppercase tracking-widest mb-4">
          Ready?
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark leading-snug mb-4">
          Take the stress out of tracking.
        </h2>
        <p className="text-bark/65 text-sm mb-10 leading-relaxed">
          It takes less than 60 seconds to set up — and you already have everything you
          need.
        </p>

        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center justify-center gap-2
            bg-blush text-white font-semibold text-base
            px-9 py-4 rounded-full shadow-lg
            hover:bg-blush-400 hover:shadow-xl hover:scale-[1.03]
            active:scale-95
            transition-all duration-200
          "
        >
          🌸 Open PeriodSaathi on Telegram
        </a>

        <p className="mt-6 text-xs text-bark/40 tracking-wide">
          Free · Private · No sign-up required
        </p>
      </div>
    </section>
  );
}
