const points = [
  {
    emoji: "📦",
    text: "We only store your Telegram ID and the dates you log. That's it.",
  },
  {
    emoji: "🚫",
    text: "Your data is never shared, sold, or used for anything else — ever.",
  },
  {
    emoji: "🗑️",
    text: "Delete everything in seconds, any time, directly from the bot.",
  },
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="py-24 bg-rose-soft">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        {/* shield icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blush-100 border border-blush-200 mb-8">
          <span className="text-3xl" aria-hidden="true">🛡️</span>
        </div>

        <p className="text-blush font-semibold text-sm uppercase tracking-widest mb-3">
          Your privacy, always
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mb-6">
          We take your privacy seriously.
          <br className="hidden sm:block" />
          <span className="text-rose-deep">No exceptions.</span>
        </h2>

        <p className="text-bark/65 text-sm leading-relaxed max-w-xl mx-auto mb-10">
          Period data is personal. We designed PeriodSaathi from day one to collect
          only what is strictly necessary — and to give you full control over it.
        </p>

        {/* bullet points */}
        <ul className="flex flex-col gap-4 text-left max-w-lg mx-auto">
          {points.map((p) => (
            <li
              key={p.text}
              className="flex items-start gap-4 bg-white/70 rounded-xl px-5 py-4 border border-blush-100"
            >
              <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
                {p.emoji}
              </span>
              <span className="text-bark/80 text-sm leading-relaxed">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
