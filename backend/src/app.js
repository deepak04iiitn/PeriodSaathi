import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import bot from './bot/index.js';
// Router self-registers all message/callback listeners on the bot instance.
import './bot/router.js';
// Cron job self-registers on import.
import './jobs/dailyReminder.js';
import { runDailyReminders } from './services/reminderService.js';
import User from './models/User.js';

// ── Startup env validation ─────────────────────────────────────────────────────
// Fail fast with a clear message rather than a cryptic runtime crash.
const REQUIRED_ENV = ['TELEGRAM_BOT_TOKEN', 'MONGODB_URI'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`[APP] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[APP] Copy .env.example to .env and fill in all values.');
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 3000;

// Webhook mode is determined entirely by whether WEBHOOK_URL is set.
// No WEBHOOK_URL → polling. WEBHOOK_URL set → webhooks.
const WEBHOOK_URL   = process.env.WEBHOOK_URL?.trim() || '';
const USE_WEBHOOKS  = WEBHOOK_URL.length > 0;

// Admin trigger route is opt-in via an explicit env flag.
const ENABLE_ADMIN  = process.env.ENABLE_ADMIN_ROUTES === 'true';

app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mode: USE_WEBHOOKS ? 'webhook' : 'polling' });
});

// ── Webhook endpoint ───────────────────────────────────────────────────────────
if (USE_WEBHOOKS) {
  const webhookPath = `/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;

  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

// ── Public: joined-women counter for the landing page ─────────────────────────
// No auth needed — exposes only a count, never any user data. Cached briefly
// so a burst of landing-page visitors doesn't hammer the DB.
const JOINED_COUNT_CACHE_MS = 60_000;
let joinedCountCache = { count: 0, fetchedAt: 0 };

app.get('/api/stats/joined-count', async (_req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const isStale = Date.now() - joinedCountCache.fetchedAt > JOINED_COUNT_CACHE_MS;
    if (isStale) {
      const count = await User.countDocuments({ onboardingComplete: true });
      joinedCountCache = { count, fetchedAt: Date.now() };
    }
    res.json({ count: joinedCountCache.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: manual reminder trigger ────────────────────────────────────────────
if (ENABLE_ADMIN) {
  app.post('/admin/trigger-reminders', async (_req, res) => {
    console.log('[ADMIN] Manual reminder trigger requested.');
    try {
      await runDailyReminders();
      res.json({ ok: true, message: 'Reminder job completed.' });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  if (USE_WEBHOOKS) {
    await bot.setWebhook(`${WEBHOOK_URL}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`);
    console.log('[BOT] Webhook registered at', WEBHOOK_URL);
  } else {
    bot.startPolling();
    console.log('[BOT] Polling started.');
  }

  // Register commands so they appear in Telegram's / autocomplete menu.
  await bot.setMyCommands([
    { command: 'log',         description: 'Log your period start or end date'      },
    { command: 'cycle',       description: 'See your current cycle day & prediction' },
    { command: 'history',     description: 'View your past logged cycles'            },
    { command: 'settings',    description: 'Edit preferences, reminders & data'     },
    { command: 'how_to_use',  description: 'Full step-by-step guide to PeriodSaathi' },
    { command: 'help',        description: 'Show all available commands'             },
    { command: 'about',       description: 'About PeriodSaathi'                     },
    { command: 'start',       description: 'Start or restart setup'                  },
  ]);
  console.log('[BOT] Commands registered.');

  app.listen(PORT, () => {
    console.log(
      `[APP] Server on port ${PORT} — mode: ${USE_WEBHOOKS ? 'webhook' : 'polling'}` +
      (ENABLE_ADMIN ? ' | admin routes: ON' : '')
    );
  });
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[APP] ${signal} received — shutting down gracefully.`);
  try { bot.stopPolling(); } catch (_) {}

  const { default: mongoose } = await import('mongoose');
  await mongoose.connection.close();
  console.log('[DB] MongoDB connection closed.');
  process.exit(0);
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
