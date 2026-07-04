"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Send } from "lucide-react";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ivory border-b border-wine/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="#" aria-label="PeriodSaathi home" className="flex items-center gap-2.5 select-none">
          <Image
            src="/PeriodSaathi.png"
            alt="PeriodSaathi"
            width={140}
            height={140}
            className="h-14 w-auto mix-blend-multiply"
            priority
          />
          <span className="font-serif text-lg text-plum hidden sm:inline">
            Period<em className="text-wine">Saathi</em>
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-plum/70">
          <a href="#how-it-works" className="hover:text-plum transition-colors duration-150">
            How it works
          </a>
          <a href="#privacy" className="hover:text-plum transition-colors duration-150">
            Privacy
          </a>
        </div>

        {/* CTA */}
        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 bg-wine text-ivory text-sm font-medium
            px-4 py-2 rounded-lg
            hover:bg-wine-dark
            transition-colors duration-200
          "
        >
          Open in Telegram
          <Send className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
