# PeriodSaathi 🌸

> **Your cycle, your companion** — a private Telegram bot for period tracking and cycle reminders, with a beautiful web landing page.

## Monorepo Structure

```
periodsaathi/
├── backend/    ← Telegram bot + Express API (Node.js · Express · MongoDB)
├── frontend/   ← Web landing page (Next.js 14 · Tailwind CSS · TypeScript)
└── docs/       ← PRD and implementation plan
```

## Quick Start

### Backend (Telegram Bot)

```bash
cd backend
cp .env.example .env   # fill in your TELEGRAM_BOT_TOKEN and MONGODB_URI
npm install
npm run dev
```

### Frontend (Landing Page)

```bash
cd frontend
cp .env.example .env.local   # fill in NEXT_PUBLIC_BOT_URL
npm install
npm run dev
```

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## Tech Stack

| Layer | Technology |
|---|---|
| Bot framework | node-telegram-bot-api |
| Backend runtime | Node.js 18+ (ES Modules) |
| Backend framework | Express |
| Database | MongoDB + Mongoose |
| Scheduler | node-cron |
| Date parsing | chrono-node |
| Frontend framework | Next.js 14 (App Router) |
| Frontend styling | Tailwind CSS |
| Frontend language | TypeScript |
| Animations | Framer Motion |

## Privacy

PeriodSaathi stores only what is strictly necessary: your Telegram ID, first name, and the dates you log. No data is shared with third parties. Users can delete everything at any time via ⚙ Settings in the bot.
