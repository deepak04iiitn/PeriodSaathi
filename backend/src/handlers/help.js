import * as msg from '../utils/messages.js';
import { mainMenuKeyboard } from '../utils/keyboard.js';

const OPTS = { parse_mode: 'HTML' };

// ─────────────────────────────────────────────────────────────────────────────
// handleHelp — called by /help, /about, and /how_to_use command listeners.
// @param type  'help' | 'about' | 'howto'
// ─────────────────────────────────────────────────────────────────────────────
export const handleHelp = async (bot, chatId, type) => {
  const text =
    type === 'about' ? msg.aboutText() :
    type === 'howto' ? msg.howToUseText() :
    msg.helpText();

  await bot.sendMessage(chatId, text, {
    ...OPTS,
    ...mainMenuKeyboard(),
    // Disable link previews — /about copy contains no URLs, but guard anyway.
    disable_web_page_preview: true,
  });
};
