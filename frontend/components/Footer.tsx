import Image from "next/image";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-feather border-t border-rose-warm/40 py-10">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* brand */}
          <a href="#" aria-label="PeriodSaathi home" className="flex items-center select-none">
            <Image
              src="/PeriodSaathi.png"
              alt="PeriodSaathi"
              width={100}
              height={100}
              className="h-12 w-auto mix-blend-multiply"
            />
          </a>

          {/* tagline */}
          <p className="text-bark/50 text-xs text-center">
            Your cycle, your companion.
          </p>

          {/* links */}
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <a
              href="#privacy"
              className="text-bark/55 text-sm hover:text-bark transition-colors duration-150"
            >
              Privacy
            </a>
            <span className="text-rose-warm/70" aria-hidden="true">·</span>
            <a
              href="#how-it-works"
              className="text-bark/55 text-sm hover:text-bark transition-colors duration-150"
            >
              About
            </a>
            <span className="text-rose-warm/70" aria-hidden="true">·</span>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bark/55 text-sm hover:text-bark transition-colors duration-150"
            >
              Open in Telegram
            </a>
          </nav>
        </div>

        <p className="mt-8 text-center text-bark/35 text-xs">
          © {YEAR} PeriodSaathi. Made with 💗 for every woman who deserves a little
          less to worry about.
        </p>
      </div>
    </footer>
  );
}
