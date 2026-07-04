import CycleLog from '../models/CycleLog.js';
import User from '../models/User.js';
import * as msg from '../utils/messages.js';
import {
  CB,
  settingsKeyboard,
  deleteConfirmKeyboard,
  mainMenuKeyboard,
} from '../utils/keyboard.js';

const OPTS = { parse_mode: 'Markdown' };

// ─────────────────────────────────────────────────────────────────────────────
// handleSettings — entry points:
//
//   null / undefined  → show settings menu
//   string (text)     → AWAITING_CYCLE_LENGTH_UPDATE | AWAITING_PERIOD_LENGTH_UPDATE
//   callback_query    → all SETTINGS_* callbacks
// ─────────────────────────────────────────────────────────────────────────────
export const handleSettings = async (bot, chatId, user, input = null) => {
  // ── Mid-flow text input ───────────────────────────────────────────────────
  if (typeof input === 'string') {
    return handleTextInput(bot, chatId, user, input);
  }

  // ── Callback query ────────────────────────────────────────────────────────
  if (input && typeof input === 'object' && input.data) {
    return handleCallback(bot, chatId, user, input.data);
  }

  // ── Entry: show the settings menu ─────────────────────────────────────────
  return showSettings(bot, chatId, user);
};

// ─────────────────────────────────────────────────────────────────────────────
// Render the settings menu.
// ─────────────────────────────────────────────────────────────────────────────
const showSettings = async (bot, chatId, user) => {
  await bot.sendMessage(
    chatId,
    msg.settingsHeader(),
    { ...OPTS, ...settingsKeyboard(user) }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Route callback_query payloads to the right sub-handler.
// ─────────────────────────────────────────────────────────────────────────────
const handleCallback = async (bot, chatId, user, data) => {
  switch (data) {
    // ── Edit lengths ─────────────────────────────────────────────────────────
    case CB.SETTINGS_EDIT_CYCLE:
      user.pendingAction = 'AWAITING_CYCLE_LENGTH_UPDATE';
      await user.save();
      return bot.sendMessage(chatId, msg.askNewCycleLength(), OPTS);

    case CB.SETTINGS_EDIT_PERIOD:
      user.pendingAction = 'AWAITING_PERIOD_LENGTH_UPDATE';
      await user.save();
      return bot.sendMessage(chatId, msg.askNewPeriodLength(), OPTS);

    // ── Reminder toggles ─────────────────────────────────────────────────────
    case CB.SETTINGS_TOGGLE_3DAY:
      user.reminderSettings.threeDays = !user.reminderSettings.threeDays;
      await user.save();
      return showSettings(bot, chatId, user);

    case CB.SETTINGS_TOGGLE_1DAY:
      user.reminderSettings.oneDay = !user.reminderSettings.oneDay;
      await user.save();
      return showSettings(bot, chatId, user);

    case CB.SETTINGS_TOGGLE_DAYOF:
      user.reminderSettings.dayOf = !user.reminderSettings.dayOf;
      await user.save();
      return showSettings(bot, chatId, user);

    // ── Pause / resume ────────────────────────────────────────────────────────
    case CB.SETTINGS_PAUSE:
      user.isPaused = true;
      await user.save();
      return bot.sendMessage(
        chatId,
        msg.pauseConfirm(),
        { ...OPTS, ...mainMenuKeyboard() }
      );

    case CB.SETTINGS_RESUME:
      user.isPaused = false;
      await user.save();
      return bot.sendMessage(
        chatId,
        msg.resumeConfirm(),
        { ...OPTS, ...settingsKeyboard(user) }
      );

    // ── Delete data flow ──────────────────────────────────────────────────────
    case CB.SETTINGS_DELETE:
      return bot.sendMessage(
        chatId,
        msg.deleteDataPrompt(),
        { ...OPTS, ...deleteConfirmKeyboard() }
      );

    case CB.SETTINGS_DELETE_YES:
      return deleteAllData(bot, chatId, user);

    case CB.SETTINGS_DELETE_NO:
      return showSettings(bot, chatId, user);

    // ── Back to main menu ─────────────────────────────────────────────────────
    case CB.SETTINGS_BACK:
      return bot.sendMessage(
        chatId,
        '🌸 Back to the main menu.',
        { ...OPTS, ...mainMenuKeyboard() }
      );

    default:
      return showSettings(bot, chatId, user);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Handle free-text input when a settings field is awaiting a value.
// ─────────────────────────────────────────────────────────────────────────────
const handleTextInput = async (bot, chatId, user, text) => {
  const action = user.pendingAction;

  if (action === 'AWAITING_CYCLE_LENGTH_UPDATE') {
    const value = parseInt(text.trim(), 10);
    if (isNaN(value) || value < 15 || value > 60) {
      return bot.sendMessage(chatId, msg.invalidNumberInput(15, 60), OPTS);
    }
    user.avgCycleLength = value;
    user.pendingAction  = null;
    await user.save();
    await bot.sendMessage(chatId, msg.cycleLengthUpdated(value), OPTS);
    return showSettings(bot, chatId, user);
  }

  if (action === 'AWAITING_PERIOD_LENGTH_UPDATE') {
    const value = parseInt(text.trim(), 10);
    if (isNaN(value) || value < 1 || value > 14) {
      return bot.sendMessage(chatId, msg.invalidNumberInput(1, 14), OPTS);
    }
    user.avgPeriodLength = value;
    user.pendingAction   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.periodLengthUpdated(value), OPTS);
    return showSettings(bot, chatId, user);
  }

  // Unexpected text while in settings — re-show the menu.
  return showSettings(bot, chatId, user);
};

// ─────────────────────────────────────────────────────────────────────────────
// Hard-delete all data for this user: all CycleLogs + the User document.
// After deletion the user can restart from scratch via /start.
// ─────────────────────────────────────────────────────────────────────────────
const deleteAllData = async (bot, chatId, user) => {
  const telegramId = user.telegramId;

  await CycleLog.deleteMany({ telegramId });
  await User.deleteOne({ telegramId });

  console.log(`[SETTINGS] All data deleted for telegramId=${telegramId}`);

  // Send farewell — no keyboard attached since the user no longer exists.
  await bot.sendMessage(chatId, msg.deleteDataSuccess(), {
    parse_mode: 'Markdown',
    reply_markup: { remove_keyboard: true },
  });
};
