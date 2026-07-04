import * as msg from './messages.js';

// ─────────────────────────────────────────────────────────────────────────────
// withErrorHandling
//
// Wraps any async handler function so that:
//   1. Unhandled errors are caught and logged server-side.
//   2. A generic, non-technical reply is sent to the user.
//   3. The bot process is never crashed by a handler error.
//
// Usage:
//   export const handleFoo = withErrorHandling(async (bot, chatId, user) => { ... });
// ─────────────────────────────────────────────────────────────────────────────
export const withErrorHandling = (fn) => async (bot, chatId, ...rest) => {
  try {
    await fn(bot, chatId, ...rest);
  } catch (err) {
    console.error(`[HANDLER] Unhandled error in ${fn.name || 'anonymous'}:`, err);

    try {
      await bot.sendMessage(chatId, msg.genericError(), { parse_mode: 'Markdown' });
    } catch (sendErr) {
      console.error('[HANDLER] Failed to send error reply:', sendErr.message);
    }
  }
};
