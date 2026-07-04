import { format } from '../utils/dateHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// All bot-facing copy lives here. No raw strings should appear in handlers.
// Keeping copy centralised makes tone tweaks, A/B tests, and future
// localisation straightforward without touching handler logic.
// ─────────────────────────────────────────────────────────────────────────────

// ── Onboarding ────────────────────────────────────────────────────────────────

export const welcome = (firstName) =>
  `🌸 Hi ${firstName}! I'm *PeriodSaathi* — your private cycle companion.\n\n` +
  `I'll help you track your periods and remind you before your next one is due.\n\n` +
  `*What I store:* your Telegram ID, first name, and the dates you log.\n` +
  `*What I never do:* share your data, sell it, or use it for anything else.\n\n` +
  `Let's get started — *when did your last period start?*\n` +
  `_(You can type a date like *3 July*, say *today*, or *yesterday*)_`;

export const welcomeBack = (firstName) =>
  `🌸 Welcome back, ${firstName}! What would you like to do today?`;

export const askCycleLength = () =>
  `Got it! 🌸\n\n` +
  `About how long is your cycle usually? _(Days between the start of one period and the start of the next)_\n\n` +
  `Just type a number — type *28* if you're not sure, that's the average.`;

export const onboardingComplete = (nextDate) =>
  `You're all set! 🎉\n\n` +
  `Based on what you've told me, your next period is predicted for *${format(nextDate)}*.\n\n` +
  `I'll remind you before it arrives. Tap *📊 My Cycle* anytime to check your status.`;

// ── Date parsing & confirmation ───────────────────────────────────────────────

export const confirmDate = (date) =>
  `I read that as *${format(date)}*. Is that right?`;

export const dateParseError = () =>
  `Hmm, I couldn't quite parse that date. 🌸\n\n` +
  `Try something like *today*, *yesterday*, *3 July*, or *03/07*.`;

export const dateTooFarFuture = () =>
  `That date looks like it's in the future — periods can only be logged for dates up to today. 🌸\n\n` +
  `Try again with a past or today's date.`;

// ── Cycle logging ─────────────────────────────────────────────────────────────

export const askPeriodDate = () =>
  `📅 When did your period start?\n\n` +
  `_(Type a date like *today*, *yesterday*, *3 July*, or *03/07*)_`;

export const duplicateLogWarning = (existingDate) =>
  `You already have a period logged around *${format(existingDate)}*.\n\n` +
  `Are you sure you want to add another entry?`;

export const logSuccess = (startDate, nextDate) =>
  `Logged! 🌸\n\n` +
  `*Period start:* ${format(startDate)}\n` +
  `*Next predicted period:* ${format(nextDate)}\n\n` +
  `I'll remind you before it arrives.`;

// ── My Cycle overview ─────────────────────────────────────────────────────────

export const cycleOverview = ({ lastStart, cycleDay, nextDate, daysUntil, avgCycleLength, fertileWindow = null }) => {
  const daysLabel =
    daysUntil > 0
      ? `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
      : daysUntil === 0
      ? 'today'
      : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago (may be running late)`;

  const fertileWindowLine = fertileWindow
    ? `\n🌿 Fertile window _(est.)_: *${format(fertileWindow.start)} – ${format(fertileWindow.end)}*\n` +
      `_Not medical advice — ovulation timing varies._`
    : '';

  return (
    `📊 *Your Cycle Overview*\n\n` +
    `📅 Last period: *${format(lastStart)}*\n` +
    `🔢 Cycle day: *Day ${cycleDay}*\n` +
    `🔮 Next period: *~${format(nextDate)}* (${daysLabel})\n` +
    `📏 Avg cycle length: *${avgCycleLength} days*` +
    fertileWindowLine +
    `\n\n_Predictions are estimates — cycles can naturally vary._`
  );
};

export const noCycleData = () =>
  `You haven't logged a period yet. 🌸\n\n` +
  `Tap *📅 Log Period* to get started and I'll start predicting your cycle.`;

// ── History ───────────────────────────────────────────────────────────────────

export const historyHeader = () => `📜 *Your Cycle History*\n\n`;

export const historyEntry = (index, log, prevLog) => {
  const start = format(log.periodStartDate);
  const end   = log.periodEndDate ? format(log.periodEndDate) : '—';
  const periodLen = log.periodEndDate
    ? `${Math.round((log.periodEndDate - log.periodStartDate) / 86400000)} days`
    : '—';
  const cycleLen = log.cycleLength ? `${log.cycleLength} days` : '—';

  return `*${index}.* ${start} → ${end}  _(${periodLen})_  |  Cycle: ${cycleLen}`;
};

export const historyRangeSummary = (min, max, count) =>
  `\n_Cycles ranged from ${min}–${max} days across your last ${count} entries._`;

export const noHistory = () =>
  `You haven't logged any periods yet. 🌸\n\n` +
  `Tap *📅 Log Period* to start tracking your cycle.`;

export const deleteLogConfirmPrompt = (date) =>
  `Are you sure you want to delete the entry for *${format(date)}*?\n\n` +
  `_This will affect your cycle predictions._`;

export const deleteLogSuccess = () =>
  `Entry deleted. Your cycle averages have been updated. 🌸`;

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsHeader = () => `⚙ *Settings*\n\nWhat would you like to change?`;

export const askNewCycleLength = () =>
  `How many days is your cycle usually? _(15–60)_\n\nJust type the number:`;

export const askNewPeriodLength = () =>
  `How many days does your period usually last? _(1–14)_\n\nJust type the number:`;

export const cycleLengthUpdated = (val) =>
  `✅ Cycle length updated to *${val} days*.`;

export const periodLengthUpdated = (val) =>
  `✅ Period length updated to *${val} days*.`;

export const invalidNumberInput = (min, max) =>
  `Please enter a number between *${min}* and *${max}*.`;

export const pauseConfirm = () =>
  `⏸ Tracking paused. You won't receive any reminders until you resume.\n\n` +
  `Tap *▶️ Resume Tracking* in ⚙ Settings whenever you're ready.`;

export const resumeConfirm = () =>
  `▶️ Tracking resumed! Reminders are back on. 🌸`;

export const deleteDataPrompt = () =>
  `⚠️ *Are you sure?*\n\n` +
  `This will permanently delete *all* your cycle logs and settings. This cannot be undone.`;

export const deleteDataSuccess = () =>
  `Your data has been deleted. 🌸\n\n` +
  `You can start fresh anytime by sending /start.`;

// ── Reminders ─────────────────────────────────────────────────────────────────

export const reminder3Days = () =>
  `🌸 Just a heads-up — your period is expected in about *3 days*. No rush, just wanted you to be prepared!`;

export const reminder1Day = () =>
  `🌸 Your period is expected *tomorrow*. Take care of yourself! 💛`;

export const reminderDayOf = () =>
  `🌸 Today's your predicted period start date. If it begins, tap *📅 Log Period* so I can keep learning your cycle.`;

export const reminderLate = () =>
  `🌸 Your period was predicted a few days ago — everything okay?\n\n` +
  `You can log whenever you're ready, or update your cycle length in ⚙ Settings.`;

// ── Help & About ──────────────────────────────────────────────────────────────

export const helpText = () =>
  `🌸 *Here's what I can do:*\n\n` +
  `📅 *Log Period* — Record when your period starts\n` +
  `📊 *My Cycle* — See your current cycle day and next predicted date\n` +
  `📜 *History* — View your past logged cycles\n` +
  `⚙ *Settings* — Edit preferences, toggle reminders, delete data\n\n` +
  `/start — Re-run setup\n` +
  `/help — Show this message\n` +
  `/about — About PeriodSaathi`;

export const aboutText = () =>
  `🌸 *PeriodSaathi — Your cycle, your companion.*\n\n` +
  `I'm a private Telegram bot that helps you track your periods and reminds you before your next one.\n\n` +
  `*What I store:* your Telegram ID, first name, and the dates you log.\n` +
  `*What I never do:* share your data, sell it, or use it for anything else.\n\n` +
  `You can delete all your data at any time via ⚙ Settings.`;

// ── Fallback ──────────────────────────────────────────────────────────────────

export const fallback = () =>
  `I didn't quite get that. 🌸\n\n` +
  `Here's what you can do:\n` +
  `• Tap *📅 Log Period* to record your period\n` +
  `• Tap *📊 My Cycle* for your cycle overview\n` +
  `• Type /help to see all commands`;

// ── Generic error ─────────────────────────────────────────────────────────────

export const genericError = () =>
  `Something went wrong — please try again in a moment. 🌸`;
