# PeriodSaathi — Backend

Telegram bot + Express API server for PeriodSaathi.

## Tech Stack

- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Bot:** node-telegram-bot-api
- **Scheduler:** node-cron
- **Date Parsing:** chrono-node

## Getting Started

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token from [@BotFather](https://t.me/BotFather) |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Express server port (default `3000`) |
| `WEBHOOK_URL` | Leave empty for polling. Set to your public HTTPS URL to enable webhooks. |
| `ENABLE_ADMIN_ROUTES` | Set `true` to expose `POST /admin/trigger-reminders` for manual job testing. |

## Polling vs Webhook Mode

| `WEBHOOK_URL` | Mode | Notes |
|---|---|---|
| _(empty)_ | Polling | No public URL needed — use for local dev |
| `https://...` | Webhooks | Bot receives updates via HTTP push |

## Project Structure

```
src/
├── app.js              # Entry point
├── bot/
│   ├── index.js        # Bot instance
│   ├── router.js       # Central event router
│   └── middleware/     # sessionGuard
├── handlers/           # One file per feature
├── models/             # Mongoose schemas
├── services/           # Business logic
├── jobs/               # Cron jobs
├── utils/              # Keyboards, message copy
└── config/
    └── db.js           # MongoDB connection
```
