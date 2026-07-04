import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import bot from './bot/index.js';
// Router self-registers all message/callback listeners on the bot instance.
import './bot/router.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

// ── Webhook endpoint (production only) ────────────────────────────────────────
if (NODE_ENV === 'production') {
  const webhookPath = `/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;

  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  if (NODE_ENV === 'production') {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('[BOT] WEBHOOK_URL is required in production. Check your .env file.');
      process.exit(1);
    }
    await bot.setWebHook(`${webhookUrl}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`);
    console.log('[BOT] Webhook registered at', webhookUrl);
  } else {
    bot.startPolling();
    console.log('[BOT] Polling started (development mode).');
  }

  app.listen(PORT, () => {
    console.log(`[APP] Server running on port ${PORT} in ${NODE_ENV} mode.`);
  });
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[APP] ${signal} received — shutting down gracefully.`);
  try {
    bot.stopPolling();
  } catch (_) {}

  const { default: mongoose } = await import('mongoose');
  await mongoose.connection.close();
  console.log('[DB] MongoDB connection closed.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
