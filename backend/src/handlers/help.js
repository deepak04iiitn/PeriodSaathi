import * as msg from '../utils/messages.js';
import { mainMenuKeyboard } from '../utils/keyboard.js';

const OPTS = { parse_mode: 'Markdown' };

// ─────────────────────────────────────────────────────────────────────────────
// handleHelp — called by /help and /about command listeners in the router.
// @param type  'help' | 'about'
// ─────────────────────────────────────────────────────────────────────────────
export const handleHelp = async (bot, chatId, type) => {
  const text = type === 'about' ? msg.aboutText() : msg.helpText();

  await bot.sendMessage(chatId, text, {
    ...OPTS,
    ...mainMenuKeyboard(),
    // Disable link previews — /about copy contains no URLs, but guard anyway.
    disable_web_page_preview: true,
  });
};
