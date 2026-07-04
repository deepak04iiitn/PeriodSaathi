import bot from './index.js';
import sessionGuard from './middleware/sessionGuard.js';
import { CB } from '../utils/keyboard.js';
import * as msg from '../utils/messages.js';

// ── Handler imports (stubs resolved in later phases) ─────────────────────────
// Each handler module exports a default async function (bot, chatId, user, ...args).
// Phases 4–10 will populate these files. Stubs keep the router bootable now.
import { handleStart }      from '../handlers/start.js';
import { handleHelp }       from '../handlers/help.js';
import { handleLogPeriod }  from '../handlers/logPeriod.js';
import { handleMyCycle }    from '../handlers/myCycle.js';
import { handleHistory }    from '../handlers/history.js';
import { handleSettings }   from '../handlers/settings.js';

// ─────────────────────────────────────────────────────────────────────────────
// Utility: wrap every handler in a try/catch so a crash in one handler never
// takes down the bot process. Logs the error server-side, replies gracefully.
// ─────────────────────────────────────────────────────────────────────────────
const safe = (fn) => async (...args) => {
  try {
    await fn(...args);
  } catch (err) {
    console.error('[ROUTER] Unhandled handler error:', err);

    // Best-effort: try to send a friendly message back to the user.
    const chatId =
      args[0]?.chat?.id ??           // plain message
      args[0]?.message?.chat?.id ??  // callback_query
      null;

    if (chatId) {
      await bot
        .sendMessage(chatId, msg.genericError(), { parse_mode: 'Markdown' })
        .catch(() => {}); // swallow if this also fails
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter — simple in-memory sliding window per telegramId.
// Drops messages beyond 20/min with a polite reply.
// ─────────────────────────────────────────────────────────────────────────────
const rateLimitMap = new Map(); // telegramId → [timestamp, ...]

const isRateLimited = (telegramId, chatId) => {
  const now   = Date.now();
  const limit = 20;
  const window = 60_000;

  const timestamps = (rateLimitMap.get(telegramId) ?? []).filter(
    (t) => now - t < window
  );

  if (timestamps.length >= limit) {
    bot
      .sendMessage(
        chatId,
        '🌸 You\'re sending messages very quickly — please slow down a little!',
        { parse_mode: 'Markdown' }
      )
      .catch(() => {});
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(telegramId, timestamps);
  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract chatId + telegramId from any update type.
// ─────────────────────────────────────────────────────────────────────────────
const idsFrom = (update) => ({
  chatId:     update.chat?.id ?? update.message?.chat?.id,
  telegramId: update.from?.id ?? update.message?.from?.id,
});

// ─────────────────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────────────────
bot.onText(/\/start/, safe(async (message) => {
  const { chatId, telegramId } = idsFrom(message);
  if (isRateLimited(telegramId, chatId)) return;

  const ctx = await sessionGuard(message);
  if (!ctx) return;

  await handleStart(bot, ctx.chatId, ctx.user);
}));

bot.onText(/\/help/, safe(async (message) => {
  const { chatId, telegramId } = idsFrom(message);
  if (isRateLimited(telegramId, chatId)) return;

  const ctx = await sessionGuard(message);
  if (!ctx) return;

  await handleHelp(bot, ctx.chatId, 'help');
}));

bot.onText(/\/about/, safe(async (message) => {
  const { chatId, telegramId } = idsFrom(message);
  if (isRateLimited(telegramId, chatId)) return;

  const ctx = await sessionGuard(message);
  if (!ctx) return;

  await handleHelp(bot, ctx.chatId, 'about');
}));

// ─────────────────────────────────────────────────────────────────────────────
// Free-text messages (dates, cycle length answers, button text)
// ─────────────────────────────────────────────────────────────────────────────
bot.on('message', safe(async (message) => {
  // Ignore forwarded messages, non-text, and anything already handled by
  // a /command listener above.
  if (!message.text || message.text.startsWith('/')) return;

  const { chatId, telegramId } = idsFrom(message);
  if (isRateLimited(telegramId, chatId)) return;

  const ctx = await sessionGuard(message);
  if (!ctx) return;

  const { user, chatId: cid } = ctx;
  const text = message.text.trim();

  // ── Reply-keyboard button presses ────────────────────────────────────────
  if (text === '📅 Log Period') {
    return handleLogPeriod(bot, cid, user, null);
  }
  if (text === '📊 My Cycle') {
    return handleMyCycle(bot, cid, user);
  }
  if (text === '📜 History') {
    return handleHistory(bot, cid, user);
  }
  if (text === '⚙ Settings') {
    return handleSettings(bot, cid, user, null);
  }

  // ── Mid-flow state routing ────────────────────────────────────────────────
  if (user.pendingAction) {
    return routePendingAction(bot, cid, user, text);
  }

  // ── Unrecognised input ────────────────────────────────────────────────────
  await bot.sendMessage(cid, msg.fallback(), { parse_mode: 'Markdown' });
}));

// ─────────────────────────────────────────────────────────────────────────────
// Callback queries (inline keyboard button presses)
// ─────────────────────────────────────────────────────────────────────────────
bot.on('callback_query', safe(async (query) => {
  const { chatId, telegramId } = idsFrom(query);
  if (isRateLimited(telegramId, chatId)) return;

  const ctx = await sessionGuard(query);
  if (!ctx) return;

  const { user, chatId: cid } = ctx;
  const data = query.data ?? '';

  // Always acknowledge the callback to remove the loading spinner.
  await bot.answerCallbackQuery(query.id).catch(() => {});

  // ── Main menu shortcuts via inline buttons ────────────────────────────────
  if (data === CB.LOG_PERIOD)  return handleLogPeriod(bot, cid, user, query);
  if (data === CB.MY_CYCLE)    return handleMyCycle(bot, cid, user);
  if (data === CB.HISTORY)     return handleHistory(bot, cid, user);
  if (data === CB.SETTINGS)    return handleSettings(bot, cid, user, query);

  // ── Date confirmation ─────────────────────────────────────────────────────
  if (data === CB.CONFIRM_DATE_YES || data === CB.CONFIRM_DATE_NO) {
    return handleLogPeriod(bot, cid, user, query);
  }

  // ── Settings callbacks ────────────────────────────────────────────────────
  if (data.startsWith('SETTINGS_')) {
    return handleSettings(bot, cid, user, query);
  }

  // ── History delete callbacks ──────────────────────────────────────────────
  if (
    data.startsWith(CB.DELETE_LOG_PREFIX) ||
    data.startsWith(CB.DELETE_LOG_CONFIRM_PREFIX) ||
    data === CB.DELETE_LOG_CANCEL
  ) {
    return handleHistory(bot, cid, user, query);
  }

  // Unknown callback — silently ignore (already acknowledged above).
}));

// ─────────────────────────────────────────────────────────────────────────────
// Pending-action dispatcher — routes free text while a flow is active.
// ─────────────────────────────────────────────────────────────────────────────
const routePendingAction = async (bot, chatId, user, text) => {
  const action = user.pendingAction;

  if (
    action === 'AWAITING_FIRST_PERIOD_DATE' ||
    action === 'AWAITING_LOG_PERIOD_DATE'
  ) {
    return handleLogPeriod(bot, chatId, user, text);
  }

  if (
    action === 'AWAITING_CYCLE_LENGTH' ||
    action === 'AWAITING_CYCLE_LENGTH_UPDATE'
  ) {
    return handleSettings(bot, chatId, user, text);
  }

  if (action === 'AWAITING_PERIOD_LENGTH_UPDATE') {
    return handleSettings(bot, chatId, user, text);
  }

  if (action === 'AWAITING_ONBOARDING_CYCLE_LENGTH') {
    return handleStart(bot, chatId, user, text);
  }

  // Unknown pending action — clear it and show fallback.
  user.pendingAction = null;
  await user.save();
  await bot.sendMessage(chatId, msg.fallback(), { parse_mode: 'Markdown' });
};

console.log('[ROUTER] Bot router registered.');
