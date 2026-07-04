import CycleLog from '../models/CycleLog.js';
import { deleteLog } from './logPeriod.js';
import * as msg from '../utils/messages.js';
import {
  CB,
  deleteLogConfirmKeyboard,
  mainMenuKeyboard,
} from '../utils/keyboard.js';
import { format } from '../utils/dateHelpers.js';

const OPTS       = { parse_mode: 'HTML' };
const MAX_ENTRIES = 12;

// ─────────────────────────────────────────────────────────────────────────────
// handleHistory — entry points:
//
//   null / undefined  → show history list
//   callback_query    → DELETE_LOG:<id>          → confirm prompt
//                     → DELETE_LOG_CONFIRM:<id>  → delete + refresh list
//                     → DELETE_LOG_CANCEL        → back to list
// ─────────────────────────────────────────────────────────────────────────────

export const handleHistory = async (bot, chatId, user, query = null) => {
  if (query && typeof query === 'object' && query.data) {
    return handleDeleteCallback(bot, chatId, user, query);
  }
  return showHistory(bot, chatId, user);
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch and render the history list.
// One message: formatted text + inline keyboard with per-entry delete buttons.
// ─────────────────────────────────────────────────────────────────────────────
const showHistory = async (bot, chatId, user) => {
  const logs = await CycleLog.find({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .limit(MAX_ENTRIES)
    .lean();

  if (!logs.length) {
    await bot.sendMessage(
      chatId,
      msg.noHistory(),
      { ...OPTS, ...mainMenuKeyboard() }
    );
    return;
  }

  // ── Build the formatted text block ───────────────────────────────────────
  let text = msg.historyHeader();

  for (let i = 0; i < logs.length; i++) {
    text += msg.historyEntry(i + 1, logs[i]) + '\n';
  }

  // Append range summary if we have enough cycle-length data.
  const cycleLengths = logs
    .map((l) => l.cycleLength)
    .filter((n) => n != null && n > 0);

  if (cycleLengths.length >= 2) {
    const min = Math.min(...cycleLengths);
    const max = Math.max(...cycleLengths);
    text += msg.historyRangeSummary(min, max, cycleLengths.length);
  }

  // ── Build inline keyboard: one delete button row per entry ───────────────
  // Each row shows the start date so the user knows exactly what they're deleting.
  const inlineRows = logs.map((log, i) => ([
    {
      text:          `🗑 #${i + 1} — ${format(log.periodStartDate)}`,
      callback_data: `${CB.DELETE_LOG_PREFIX}${log._id}`,
    },
  ]));

  await bot.sendMessage(chatId, text, {
    ...OPTS,
    reply_markup: { inline_keyboard: inlineRows },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Handle delete-related callbacks.
// ─────────────────────────────────────────────────────────────────────────────
const handleDeleteCallback = async (bot, chatId, user, query) => {
  const data = query.data;

  // ── Step 1: user taps a delete row → show confirmation ───────────────────
  if (data.startsWith(CB.DELETE_LOG_PREFIX) && !data.startsWith(CB.DELETE_LOG_CONFIRM_PREFIX)) {
    const logId = data.slice(CB.DELETE_LOG_PREFIX.length);
    return showDeleteConfirm(bot, chatId, user, logId);
  }

  // ── Step 2: user confirms deletion ───────────────────────────────────────
  if (data.startsWith(CB.DELETE_LOG_CONFIRM_PREFIX)) {
    const logId = data.slice(CB.DELETE_LOG_CONFIRM_PREFIX.length);
    return confirmDelete(bot, chatId, user, logId);
  }

  // ── Cancel: go back to history list ──────────────────────────────────────
  if (data === CB.DELETE_LOG_CANCEL) {
    return showHistory(bot, chatId, user);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Show a confirmation prompt before deleting.
// ─────────────────────────────────────────────────────────────────────────────
const showDeleteConfirm = async (bot, chatId, user, logId) => {
  const log = await CycleLog.findOne({
    _id:        logId,
    telegramId: user.telegramId,
  }).lean();

  if (!log) {
    // Log no longer exists — silently refresh the list.
    return showHistory(bot, chatId, user);
  }

  await bot.sendMessage(
    chatId,
    msg.deleteLogConfirmPrompt(log.periodStartDate),
    { ...OPTS, ...deleteLogConfirmKeyboard(logId) }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Execute the delete, recalculate averages, then refresh the history view.
// ─────────────────────────────────────────────────────────────────────────────
const confirmDelete = async (bot, chatId, user, logId) => {
  const success = await deleteLog(logId, user);

  if (!success) {
    // Entry already gone or belongs to a different user.
    await bot.sendMessage(
      chatId,
      `Entry not found — it may have already been deleted. 🌸`,
      OPTS
    );
  } else {
    await bot.sendMessage(chatId, msg.deleteLogSuccess(), OPTS);
  }

  // Always refresh the history view after a delete attempt.
  return showHistory(bot, chatId, user);
};
