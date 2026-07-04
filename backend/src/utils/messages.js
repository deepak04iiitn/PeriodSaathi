import { format } from '../utils/dateHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// All bot-facing copy lives here. No raw strings should appear in handlers.
// parse_mode: 'HTML' is used throughout — use <b>bold</b> and <i>italic</i>.
// HTML requires escaping only < > & — none of which appear in our copy.
// ─────────────────────────────────────────────────────────────────────────────

// ── Onboarding ────────────────────────────────────────────────────────────────

export const welcome = (firstName) =>
  `🌸 Hi <b>${firstName}</b>! I'm <b>PeriodSaathi</b> — your private cycle companion.\n\n` +
  `I'll help you track your periods and remind you before your next one is due.\n\n` +
  `<b>What I store:</b> your Telegram ID, first name, and the dates you log.\n` +
  `<b>What I never do:</b> share your data, sell it, or use it for anything else.\n\n` +
  `Let's get started — <b>when did your last period start?</b>\n` +
  `<i>(You can type a date like <b>3 July</b>, say <b>today</b>, or <b>yesterday</b>)</i>`;

export const welcomeBack = (firstName) =>
  `🌸 Welcome back, <b>${firstName}</b>! What would you like to do today?`;

export const askCycleLength = () =>
  `Got it! 🌸\n\n` +
  `About how long is your cycle usually? <i>(Days between the start of one period and the start of the next)</i>\n\n` +
  `Just type a number — type <b>28</b> if you're not sure, that's the average.`;

export const onboardingComplete = (nextDate) =>
  `You're all set! 🎉\n\n` +
  `Based on what you've told me, your next period is predicted for <b>${format(nextDate)}</b>.\n\n` +
  `I'll remind you before it arrives. Tap <b>📊 My Cycle</b> anytime to check your status.`;

// ── Log type choice ───────────────────────────────────────────────────────────

export const askLogType = () =>
  `📅 <b>What would you like to log?</b>\n\n` +
  `<i>Tap <b>Period Started</b> to record the first day of your period, or <b>Period Ended</b> once it's over.</i>`;

// ── Date parsing & confirmation ───────────────────────────────────────────────

export const confirmDate = (date, type = 'start') => {
  const label = type === 'end' ? ' <i>(period end date)</i>' : '';
  return `I read that as <b>${format(date)}</b>${label} — is that right?`;
};

export const dateParseError = () =>
  `Hmm, I couldn't quite parse that date. 🌸\n\n` +
  `Try something like <b>today</b>, <b>yesterday</b>, <b>3 July</b>, or <b>03/07</b>.`;

export const dateTooFarFuture = () =>
  `That date looks like it's in the future — periods can only be logged for dates up to today. 🌸\n\n` +
  `Try again with a past or today's date.`;

// ── Cycle logging — start date ────────────────────────────────────────────────

export const askPeriodDate = () =>
  `📅 <b>When did your period start?</b>\n\n` +
  `<i>(Type a date like <b>today</b>, <b>yesterday</b>, <b>3 July</b>, or <b>03/07</b>)</i>`;

export const duplicateLogWarning = (existingDate) =>
  `You already have a period logged around <b>${format(existingDate)}</b>.\n\n` +
  `Are you sure you want to add another entry?`;

export const logSuccess = (startDate, nextDate) =>
  `Logged! 🌸\n\n` +
  `<b>Period start:</b> ${format(startDate)}\n` +
  `<b>Next predicted period:</b> ${format(nextDate)}\n\n` +
  `I'll remind you before it arrives.`;

// ── Cycle logging — end date ──────────────────────────────────────────────────

export const askPeriodEndDate = () =>
  `🏁 <b>When did your period end?</b>\n\n` +
  `<i>(Type a date like <b>today</b>, <b>yesterday</b>, <b>3 July</b>, or <b>03/07</b>)</i>`;

export const logEndSuccess = (endDate, periodDays) =>
  `Logged! 🌸\n\n` +
  `<b>Period ended:</b> ${format(endDate)}\n` +
  `<b>Period length:</b> ${periodDays} day${periodDays === 1 ? '' : 's'}\n\n` +
  `This helps me track your cycle more accurately.`;

export const noOpenLog = () =>
  `I don't have an open period start log to attach this end date to. 🌸\n\n` +
  `Tap <b>📅 Period Started</b> first to log when your period began.`;

export const endBeforeStart = (startDate) =>
  `That end date is on or before your period start date (<b>${format(startDate)}</b>). 🌸\n\n` +
  `Please enter a date after the start date.`;

// ── My Cycle overview ─────────────────────────────────────────────────────────

export const cycleOverview = ({ lastStart, cycleDay, nextDate, daysUntil, avgCycleLength, fertileWindow = null }) => {
  const daysLabel =
    daysUntil > 0
      ? `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
      : daysUntil === 0
      ? 'today'
      : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago (may be running late)`;

  const fertileWindowLine = fertileWindow
    ? `\n🌿 Fertile window <i>(est.)</i>: <b>${format(fertileWindow.start)} – ${format(fertileWindow.end)}</b>\n` +
      `<i>Not medical advice — ovulation timing varies.</i>`
    : '';

  return (
    `📊 <b>Your Cycle Overview</b>\n\n` +
    `📅 Last period: <b>${format(lastStart)}</b>\n` +
    `🔢 Cycle day: <b>Day ${cycleDay}</b>\n` +
    `🔮 Next period: <b>~${format(nextDate)}</b> (${daysLabel})\n` +
    `📏 Avg cycle length: <b>${avgCycleLength} days</b>` +
    fertileWindowLine +
    `\n\n<i>Predictions are estimates — cycles can naturally vary.</i>`
  );
};

export const noCycleData = () =>
  `You haven't logged a period yet. 🌸\n\n` +
  `Tap <b>📅 Log Period</b> to get started and I'll start predicting your cycle.`;

// ── History ───────────────────────────────────────────────────────────────────

export const historyHeader = () => `📜 <b>Your Cycle History</b>\n\n`;

export const historyEntry = (index, log) => {
  const start = format(log.periodStartDate);
  const end   = log.periodEndDate ? format(log.periodEndDate) : '—';
  const periodLen = log.periodEndDate
    ? `${Math.round((new Date(log.periodEndDate) - new Date(log.periodStartDate)) / 86400000)} days`
    : '—';
  const cycleLen = log.cycleLength ? `${log.cycleLength} days` : '—';

  return `<b>${index}.</b> ${start} → ${end}  <i>(${periodLen})</i>  |  Cycle: ${cycleLen}`;
};

export const historyRangeSummary = (min, max, count) =>
  `\n<i>Cycles ranged from ${min}–${max} days across your last ${count} entries.</i>`;

export const noHistory = () =>
  `You haven't logged any periods yet. 🌸\n\n` +
  `Tap <b>📅 Log Period</b> to start tracking your cycle.`;

export const deleteLogConfirmPrompt = (date) =>
  `Are you sure you want to delete the entry for <b>${format(date)}</b>?\n\n` +
  `<i>This will affect your cycle predictions.</i>`;

export const deleteLogSuccess = () =>
  `Entry deleted. Your cycle averages have been updated. 🌸`;

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsHeader = () => `⚙ <b>Settings</b>\n\nWhat would you like to change?`;

export const askNewCycleLength = () =>
  `How many days is your cycle usually? <i>(15–60)</i>\n\nJust type the number:`;

export const askNewPeriodLength = () =>
  `How many days does your period usually last? <i>(1–14)</i>\n\nJust type the number:`;

export const cycleLengthUpdated = (val) =>
  `✅ Cycle length updated to <b>${val} days</b>.`;

export const periodLengthUpdated = (val) =>
  `✅ Period length updated to <b>${val} days</b>.`;

export const invalidNumberInput = (min, max) =>
  `Please enter a number between <b>${min}</b> and <b>${max}</b>.`;

export const pauseConfirm = () =>
  `⏸ Tracking paused. You won't receive any reminders until you resume.\n\n` +
  `Tap <b>▶️ Resume Tracking</b> in ⚙ Settings whenever you're ready.`;

export const resumeConfirm = () =>
  `▶️ Tracking resumed! Reminders are back on. 🌸`;

export const deleteDataPrompt = () =>
  `⚠️ <b>Are you sure?</b>\n\n` +
  `This will permanently delete <b>all</b> your cycle logs and settings. This cannot be undone.`;

export const deleteDataSuccess = () =>
  `Your data has been deleted. 🌸\n\n` +
  `You can start fresh anytime by sending /start.`;

// ── Reminders ─────────────────────────────────────────────────────────────────

export const reminder3Days = () =>
  `🌸 Just a heads-up — your period is expected in about <b>3 days</b>. No rush, just wanted you to be prepared!`;

export const reminder1Day = () =>
  `🌸 Your period is expected <b>tomorrow</b>. Take care of yourself! 💛`;

export const reminderDayOf = () =>
  `🌸 Today's your predicted period start date. If it begins, tap <b>📅 Log Period</b> so I can keep learning your cycle.`;

export const reminderLate = () =>
  `🌸 Your period was predicted a few days ago — everything okay?\n\n` +
  `You can log whenever you're ready, or update your cycle length in ⚙ Settings.`;

// ── Help & About ──────────────────────────────────────────────────────────────

export const helpText = () =>
  `🌸 <b>Here's what I can do:</b>\n\n` +
  `/log — Record when your period starts or ends\n` +
  `/cycle — See your current cycle day and next predicted date\n` +
  `/history — View your past logged cycles\n` +
  `/settings — Edit preferences, toggle reminders, delete data\n\n` +
  `/start — Re-run setup\n` +
  `/help — Show this message\n` +
  `/about — About PeriodSaathi`;

export const aboutText = () =>
  `🌸 <b>PeriodSaathi — Your cycle, your companion.</b>\n\n` +
  `I'm a private Telegram bot that helps you track your periods and reminds you before your next one.\n\n` +
  `<b>What I store:</b> your Telegram ID, first name, and the dates you log.\n` +
  `<b>What I never do:</b> share your data, sell it, or use it for anything else.\n\n` +
  `You can delete all your data at any time via ⚙ Settings.`;

// ── Fallback ──────────────────────────────────────────────────────────────────

export const fallback = () =>
  `I didn't quite get that. 🌸\n\n` +
  `Here's what you can do:\n` +
  `• /log — record your period\n` +
  `• /cycle — see your cycle overview\n` +
  `• /help — see all commands`;

// ── Generic error ─────────────────────────────────────────────────────────────

export const genericError = () =>
  `Something went wrong — please try again in a moment. 🌸`;
