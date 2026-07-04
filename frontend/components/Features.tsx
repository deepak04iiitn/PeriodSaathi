import { Lock, Brain, CalendarRange, Bell, SlidersHorizontal, History } from "lucide-react";

const features = [
  {
    Icon: Lock,
    title: "Completely private",
    description:
      "Lives in your Telegram DMs — no app, no public profile, no visible icon on your home screen. No email or password either.",
    big: true,
  },
  {
    Icon: Brain,
    title: "Learns your cycle",
    description:
      "Predictions improve with every log, using a rolling average of your real cycles — not a fixed 28-day guess.",
  },
  {
    Icon: CalendarRange,
    title: "Start to finish",
    description:
      "Log when your period begins and when it ends, so we learn your average length too — not just your cycle.",
  },
  {
    Icon: Bell,
    title: "Smart reminders",
    description:
      "A heads-up 3 days before, 1 day before, and on the day — each one you can turn on or off.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Full control",
    description: "Pause tracking anytime, fine-tune your averages by hand, or delete everything in seconds.",
  },
  {
    Icon: History,
    title: "Cycle history",
    description: "Every past cycle in one clean list — start date, end date, and how long it lasted.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-28 bg-ivory-deep">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* header */}
        <div className="max-w-xl mb-14">
          <p className="text-clay-dark font-medium text-sm tracking-wide mb-3">
            Everything you need
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-plum">
            Built to stay out of your way
          </h2>
          <p className="mt-4 text-plum/65 text-sm leading-relaxed">
            PeriodSaathi shows up only when you need it, and disappears the rest of
            the time — completely on your terms.
          </p>
        </div>

        {/* bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`
                bg-paper rounded-2xl p-7
                border border-wine/10
                hover:border-wine/25
                transition-colors duration-200
                ${f.big ? "lg:col-span-2" : ""}
              `}
            >
              <div className="w-11 h-11 rounded-xl bg-clay-soft flex items-center justify-center mb-5">
                <f.Icon className="w-5 h-5 text-clay-dark" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg text-plum mb-2">{f.title}</h3>
              <p className="text-plum/60 text-sm leading-relaxed max-w-md">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
