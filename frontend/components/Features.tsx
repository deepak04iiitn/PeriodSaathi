const features = [
  {
    icon: "🔒",
    title: "Completely private",
    description:
      "Lives in your Telegram DMs — no app, no public profile, no visible icon on your home screen.",
  },
  {
    icon: "🧠",
    title: "Learns your cycle",
    description:
      "Predictions improve with every log, using your real cycle history — not a fixed 28-day guess.",
  },
  {
    icon: "🔔",
    title: "Smart reminders",
    description:
      "Get a heads-up 3 days before, 1 day before, and on the day — fully customisable from the bot.",
  },
  {
    icon: "📜",
    title: "Cycle history",
    description:
      "See all your past cycles at a glance. No chart needed — just a clean, simple list.",
  },
  {
    icon: "⚙️",
    title: "Full control",
    description:
      "Pause tracking anytime. Delete all your data in seconds. You are always in charge.",
  },
  {
    icon: "💛",
    title: "Zero friction",
    description:
      "No email, no password, no download. If you have Telegram, you are ready to start.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-petal">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* header */}
        <div className="text-center mb-14">
          <p className="text-blush font-semibold text-sm uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark">
            Built around your comfort
          </h2>
          <p className="mt-4 text-bark/65 max-w-xl mx-auto text-sm leading-relaxed">
            PeriodSaathi is designed to stay out of the way — showing up only when you need
            it, completely on your terms.
          </p>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="
                group bg-feather rounded-2xl p-6
                border border-rose-warm/40
                hover:border-blush/40 hover:shadow-md hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              <div className="text-3xl mb-4" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="font-serif text-base font-bold text-bark mb-2">
                {f.title}
              </h3>
              <p className="text-bark/60 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
