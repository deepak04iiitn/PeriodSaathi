import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('[BOT] TELEGRAM_BOT_TOKEN is not set. Check your .env file.');
  process.exit(1);
}

// Instantiate without starting polling — app.js controls when polling/webhooks begin.
const bot = new TelegramBot(token);

export default bot;
