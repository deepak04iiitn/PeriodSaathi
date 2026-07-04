import { ShieldCheck, PackageCheck, Ban, Trash2 } from "lucide-react";

const points = [
  {
    Icon: PackageCheck,
    text: "We only store your Telegram ID and the dates you log. That's it.",
  },
  {
    Icon: Ban,
    text: "Your data is never shared, sold, or used for anything else — ever.",
  },
  {
    Icon: Trash2,
    text: "Delete everything in seconds, any time, directly from the bot.",
  },
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="py-24 sm:py-28 bg-ivory">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        {/* left: statement */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-clay-dark font-medium text-sm tracking-wide mb-4">
            <ShieldCheck className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
            Your privacy, always
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-plum leading-snug">
            We take your privacy seriously.
            <br />
            <em className="text-wine">No exceptions.</em>
          </h2>
          <p className="mt-5 text-plum/65 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
            Period data is personal. We designed PeriodSaathi from day one to
            collect only what is strictly necessary — and to give you full
            control over it.
          </p>
        </div>

        {/* right: points */}
        <ul className="flex flex-col gap-3">
          {points.map((p) => (
            <li
              key={p.text}
              className="flex items-start gap-4 bg-wine-soft/60 rounded-xl px-5 py-4 border border-wine/10"
            >
              <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center flex-shrink-0 mt-0.5">
                <p.Icon className="w-4 h-4 text-wine" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="text-plum/80 text-sm leading-relaxed pt-1.5">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
