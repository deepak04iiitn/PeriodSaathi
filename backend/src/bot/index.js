import TelegramBot from 'node-telegram-bot-api';

// Token is validated by app.js before this module is imported.
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

export default bot;
