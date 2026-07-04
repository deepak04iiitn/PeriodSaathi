"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-petal/80 backdrop-blur-md shadow-sm border-b border-rose-warm/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" aria-label="PeriodSaathi home" className="flex items-center gap-2 select-none">
          <Image
            src="/PeriodSaathi.png"
            alt="PeriodSaathi"
            width={112}
            height={112}
            className="h-11 w-auto mix-blend-multiply"
            priority
          />
        </a>

        {/* CTA */}
        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 bg-blush text-white text-sm font-semibold
            px-5 py-2 rounded-full shadow-sm
            hover:bg-blush-400 active:scale-95
            transition-all duration-200
          "
        >
          Open in Telegram
          <svg
            className="w-4 h-4 opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
