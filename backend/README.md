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
| `NODE_ENV` | `development` (polling) or `production` (webhooks) |
| `WEBHOOK_URL` | Public HTTPS URL — production only |

## Development vs Production

| Mode | Transport | Notes |
|---|---|---|
| `development` | Polling | No public URL needed |
| `production` | Webhooks | Requires `WEBHOOK_URL` set |

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
