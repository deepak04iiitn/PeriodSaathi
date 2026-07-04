# PeriodSaathi — Implementation Plan

**Tech Stack**
- **Backend:** Node.js · Express · MongoDB (Mongoose) · node-telegram-bot-api · node-cron
- **Frontend:** Next.js 14 (App Router) · Tailwind CSS · TypeScript

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Phase 1 — Foundation & Project Setup](#phase-1--foundation--project-setup) ✅
3. [Phase 2 — Database Layer](#phase-2--database-layer)
4. [Phase 3 — Bot Core & Command Routing](#phase-3--bot-core--command-routing)
5. [Phase 4 — Onboarding Flow](#phase-4--onboarding-flow)
6. [Phase 5 — Cycle Logging](#phase-5--cycle-logging)
7. [Phase 6 — Cycle Overview & Predictions](#phase-6--cycle-overview--predictions)
8. [Phase 7 — Cycle History](#phase-7--cycle-history)
9. [Phase 8 — Settings](#phase-8--settings)
10. [Phase 9 — Reminder Scheduler](#phase-9--reminder-scheduler)
11. [Phase 10 — Help, About & Fallback Handling](#phase-10--help-about--fallback-handling)
12. [Phase 11 — Hardening, Error Handling & Security](#phase-11--hardening-error-handling--security)
13. [Phase 12 — Frontend Landing Page](#phase-12--frontend-landing-page)
14. [Phase 13 — Deployment](#phase-13--deployment)
15. [Phase 14 — Phase 2 Enhancements](#phase-14--phase-2-enhancements)

---

## Project Structure

```
periodsaathi/                         ← monorepo root
│
├── backend/                          ← Telegram bot + Express API
│   ├── src/
│   │   ├── bot/
│   │   │   ├── index.js              # Bot instance & polling/webhook init
│   │   │   ├── router.js             # Central message/callback router
│   │   │   └── middleware/
│   │   │       └── sessionGuard.js   # Ensure user doc exists before handling
│   │   ├── handlers/
│   │   │   ├── start.js              # /start & onboarding
│   │   │   ├── logPeriod.js          # 📅 Log Period flow
│   │   │   ├── myCycle.js            # 📊 My Cycle
│   │   │   ├── history.js            # 📜 History
│   │   │   ├── settings.js           # ⚙ Settings
│   │   │   └── help.js               # /help & /about
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── CycleLog.js
│   │   ├── services/
│   │   │   ├── predictionService.js
│   │   │   ├── reminderService.js
│   │   │   └── dateParser.js
│   │   ├── jobs/
│   │   │   └── dailyReminder.js      # node-cron scheduler
│   │   ├── utils/
│   │   │   ├── keyboard.js           # Reusable Telegram keyboards
│   │   │   └── messages.js           # All bot copy (centralized)
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   └── app.js                    # Express app + webhook endpoint
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json                  # "type": "module" — ES modules
│   └── README.md
│
├── frontend/                         ← Next.js landing page
│   ├── app/
│   │   ├── layout.tsx                # Root layout, fonts, metadata
│   │   ├── page.tsx                  # Landing page (single page)
│   │   └── globals.css               # Tailwind base styles
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── PrivacySection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   ├── public/
│   │   └── og-image.png              # Open Graph social preview image
│   ├── .env.example
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore                        ← root gitignore (covers both)
└── README.md                         ← monorepo overview
```

---

## Phase 1 — Foundation & Project Setup ✅

**Status: Complete.** The `backend/` skeleton is live with Express, MongoDB connection, graceful shutdown, and bot polling/webhook branching.

> All files live under `backend/`. ES modules (`"type": "module"`) are enforced throughout.

**What was built:**
- `backend/package.json` — dependencies installed, ES module flag set
- `backend/.env.example` — all required env vars documented
- `backend/.gitignore`
- `backend/src/config/db.js` — `connectDB()` with timeout config and reconnect logging
- `backend/src/bot/index.js` — singleton bot instance with startup guard
- `backend/src/app.js` — Express server with health check, webhook route, and `SIGINT`/`SIGTERM` shutdown
- `README.md` — project overview and setup instructions

---

## Phase 2 — Database Layer

**Goal:** Finalized Mongoose schemas reflecting the PRD data model.

### Step 2.1 — Create `backend/src/models/User.js`

Fields:

| Field | Type | Default | Notes |
|---|---|---|---|
| `telegramId` | Number | — | Unique, indexed |
| `firstName` | String | — | From Telegram |
| `avgCycleLength` | Number | 28 | Recalculated on each new log |
| `avgPeriodLength` | Number | 5 | Recalculated on each new log |
| `reminderSettings` | Object | `{ threeDays: true, oneDay: true, dayOf: true }` | Toggleable |
| `isPaused` | Boolean | false | Pauses reminder sending |
| `onboardingComplete` | Boolean | false | Set true after first log |
| `pendingAction` | String | null | Tracks mid-flow state machine position |
| `createdAt` | Date | `Date.now` | Auto |

Add a unique index on `telegramId`. Add a method `toSafeObject()` that strips internal Mongoose fields for logging.

### Step 2.2 — Create `backend/src/models/CycleLog.js`

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `telegramId` | Number | Yes | Links to User |
| `periodStartDate` | Date | Yes | User-logged |
| `periodEndDate` | Date | No | Optional, logged later |
| `cycleLength` | Number | No | Calculated from previous log's start date |
| `createdAt` | Date | — | Auto |

Add an index on `{ telegramId: 1, periodStartDate: -1 }` for efficient history queries.

### Step 2.3 — Seed/Test schemas locally

Write a quick throwaway test script (`backend/scripts/testDb.js`) that creates a User and CycleLog, queries them, and deletes them. Run once to verify schemas work, then delete the file.

**Checkpoint:** Mongoose connects without errors, documents can be inserted and queried.

---

## Phase 3 — Bot Core & Command Routing

**Goal:** A clean, centralized router that dispatches every Telegram update to the right handler.

### Step 3.1 — Update `backend/src/bot/index.js`

- Bot instance already exists. Wire it to start polling on `app.js` init.
- In development (`NODE_ENV=development`): polling mode.
- In production: webhooks via Express endpoint.

### Step 3.2 — Create `backend/src/bot/middleware/sessionGuard.js`

A middleware function that, before any handler runs:
1. Checks if a `User` document exists for the `telegramId`.
2. If not, creates a minimal user document (upsert).
3. Attaches the user document to the message context so handlers don't need to re-query.

This ensures no handler ever crashes on a missing user.

### Step 3.3 — Create `backend/src/bot/router.js`

Wire up all inbound Telegram events:

```
bot.onText(/\/start/, sessionGuard → startHandler)
bot.onText(/\/help/,  sessionGuard → helpHandler)
bot.onText(/\/about/, sessionGuard → helpHandler)

bot.on('callback_query', sessionGuard → callbackRouter)
  Callbacks: LOG_PERIOD | MY_CYCLE | HISTORY | SETTINGS | ...

bot.on('message', sessionGuard → freeTextHandler)
  - If user is mid-flow (pendingAction set), route to active flow handler.
  - Otherwise, parse for a date → logPeriod handler.
  - Otherwise, fall back to fallbackHandler.
```

### Step 3.4 — Create `backend/src/utils/keyboard.js`

Export reusable inline keyboard and reply keyboard builders:

- `mainMenuKeyboard()` — the persistent bottom keyboard with the four main buttons.
- `confirmDateKeyboard(date)` — "Yes, that's right ✅" / "No, re-enter ❌".
- `settingsKeyboard(user)` — settings menu with current values shown.
- `reminderToggleKeyboard(user)` — per-reminder toggle buttons.

### Step 3.5 — Create `backend/src/utils/messages.js`

Centralize all bot copy strings here (no hardcoded strings in handlers). This makes tone adjustments, localization, and A/B testing trivial later.

**Checkpoint:** `/start` reaches the handler, a user doc is created in MongoDB, and the main menu keyboard appears.

---

## Phase 4 — Onboarding Flow

**Goal:** A new user who sends `/start` is welcomed and guided through first-time setup.

### Step 4.1 — Design the onboarding state machine

Track `pendingAction` on the User document to know where a user is mid-flow:

```
null → AWAITING_FIRST_PERIOD_DATE → AWAITING_CYCLE_LENGTH → ONBOARDING_COMPLETE
```

### Step 4.2 — Implement `backend/src/handlers/start.js`

**If user is new (`onboardingComplete = false`):**

1. Send warm welcome message (see PRD §18 tone reference).
2. Explain what data the bot collects and why (privacy assurance).
3. Ask: "When did your last period start? (You can type a date like **3 July** or just say **today**)"
4. Set `pendingAction = 'AWAITING_FIRST_PERIOD_DATE'` on the user.

**If user is returning:**

- Send a short "Welcome back!" message.
- Show the main menu keyboard.

### Step 4.3 — Handle `AWAITING_FIRST_PERIOD_DATE` in the free-text router

1. Parse the incoming text with `dateParser.js` (see Phase 5, Step 5.2).
2. If parsed successfully: show confirmation message with the interpreted date + `confirmDateKeyboard`.
3. If parsing fails: friendly error + ask again. Do not change `pendingAction`.

### Step 4.4 — Handle date confirmation callback

- **Confirmed:** Save a `CycleLog` document. Ask for average cycle length.
  Set `pendingAction = 'AWAITING_CYCLE_LENGTH'`.
- **Rejected:** Ask the user to re-enter the date. Retain `pendingAction`.

### Step 4.5 — Handle `AWAITING_CYCLE_LENGTH`

1. Accept a number between 15 and 60.
2. Save `avgCycleLength` to User.
3. Set `onboardingComplete = true`, clear `pendingAction`.
4. Send a success message and show the main menu keyboard.

**Checkpoint:** A fresh `/start` creates a user, logs the first period, sets cycle length, and lands on the main menu.

---

## Phase 5 — Cycle Logging

**Goal:** Users can log a new period start date at any time via button or free text.

### Step 5.1 — Implement `backend/src/handlers/logPeriod.js`

**Entry points:**
- User presses `📅 Log Period` button (callback query).
- User sends a date-like text when no other flow is active.

**Flow:**
1. Check for existing log within 2 days — warn if duplicate.
2. Parse date using `dateParser.js`.
3. Show confirmation with `confirmDateKeyboard`.
4. On confirmation: create a new `CycleLog`.
5. Recalculate averages via `predictionService.recalculateAverages(telegramId)`.
6. Send success message: "Logged! 🌸 Your next period is predicted for **[date]**."
7. Return to main menu.

### Step 5.2 — Implement `backend/src/services/dateParser.js`

Use `chrono-node` to parse flexible date input:

- "today" → current date
- "yesterday" → current date − 1
- "3 July" / "July 3" → specific date
- "03/07" → dd/mm of current year (default to dd/mm for target audience)

Return a `Date` object or `null` if unparseable.

### Step 5.3 — Handle log corrections via History (stub for Phase 7)

Stub out a `deleteLog(logId, telegramId)` function now so it's easy to wire in Phase 7.

**Checkpoint:** `📅 Log Period` → type "today" → confirm → CycleLog saved, averages recalculated, prediction shown.

---

## Phase 6 — Cycle Overview & Predictions

**Goal:** `📊 My Cycle` shows current cycle status and next period prediction.

### Step 6.1 — Implement `backend/src/services/predictionService.js`

Functions to implement:

**`getNextPeriodDate(user, lastLog)`**
- `lastLog.periodStartDate + user.avgCycleLength`

**`getCurrentCycleDay(lastLog)`**
- `daysSince(lastLog.periodStartDate) + 1`

**`recalculateAverages(telegramId)`**
- Fetch last 6 `CycleLog` entries sorted by date.
- Rolling average → update `user.avgCycleLength`.
- Minimum 2 logs required before switching away from default 28-day assumption.

**`getFertileWindow(nextPeriodDate, avgCycleLength)`** *(stub for Phase 14)*

### Step 6.2 — Implement `backend/src/handlers/myCycle.js`

1. Fetch user and most recent `CycleLog`.
2. If no logs: prompt to log first period.
3. Compute cycle day, next date, days until next.
4. Format and send the overview message.

**Checkpoint:** `📊 My Cycle` shows correct cycle day and predicted next period date.

---

## Phase 7 — Cycle History

**Goal:** `📜 History` shows past logged cycles in a clean, readable list.

### Step 7.1 — Implement `backend/src/handlers/history.js`

1. Query last 12 `CycleLog` entries sorted by `periodStartDate` descending.
2. If no logs: send friendly prompt.
3. Format as a readable list with start/end dates, period length, cycle gap.
4. Append a range summary line if 2+ entries exist.
5. Include inline "🗑 Delete" buttons per entry.

### Step 7.2 — Entry deletion

- Callback payload: `DELETE_LOG:<logId>`.
- Show confirmation → on confirm, delete document and recalculate averages.
- Return updated history view.

**Checkpoint:** `📜 History` lists correct past entries with cycle lengths and range summary.

---

## Phase 8 — Settings

**Goal:** Users can view and change their preferences and delete their data.

### Step 8.1 — Implement `backend/src/handlers/settings.js`

Settings inline keyboard:
```
[✏️ Edit Cycle Length: 28 days]
[✏️ Edit Period Length: 5 days]
[🔔 Reminders: 3-day ✅  1-day ✅  Day-of ✅]
[⏸ Pause Tracking]
[🗑 Delete All My Data]
[← Back]
```

### Step 8.2 — Edit cycle length
Set `pendingAction = 'AWAITING_CYCLE_LENGTH_UPDATE'`, validate (15–60), save, confirm.

### Step 8.3 — Edit period length
Same flow for `avgPeriodLength` (1–14 days).

### Step 8.4 — Reminder toggles
Instant toggle on each of `threeDays`, `oneDay`, `dayOf` in `reminderSettings`. Re-render menu.

### Step 8.5 — Pause / resume tracking
Toggle `user.isPaused`. Paused users are skipped by the daily reminder job.

### Step 8.6 — Delete all data
Strong confirmation → delete all `CycleLog` documents → delete `User` document → farewell message.

**Checkpoint:** All settings persist correctly. Delete flow removes all documents for the user.

---

## Phase 9 — Reminder Scheduler

**Goal:** A daily cron job that sends the right reminder to the right users at the right time.

### Step 9.1 — Implement `backend/src/jobs/dailyReminder.js`

```javascript
// Runs daily at 9:00 AM server time
cron.schedule('0 9 * * *', async () => {
  await runDailyReminders();
});
```

### Step 9.2 — Implement `backend/src/services/reminderService.js`

**`runDailyReminders()`**:
1. Fetch all active users (`isPaused = false`, `onboardingComplete = true`).
2. Process in batches of 100.
3. For each: compute `daysUntil` next period → send matching reminder (3-day / 1-day / day-of).
4. Wrap each send in try/catch — one user failure must not stop the loop.
5. Log totals at end of run.

### Step 9.3 — Reminder message copy (from `messages.js`)

```
3-day: "🌸 Just a heads-up — your period is expected in about 3 days. No rush, just wanted you to be prepared!"
1-day: "🌸 Your period is expected tomorrow. Take care of yourself! 💛"
Day-of: "🌸 Today's your predicted period start date. If it begins, tap 📅 Log Period so I can keep learning your cycle."
```

### Step 9.4 — Late period nudge (stub for Phase 14)
If `daysUntil < -3`, stub the check. Full implementation in Phase 14.

### Step 9.5 — Wire the job into `backend/src/app.js`
Import and start the cron job on server start.

**Checkpoint:** Manually invoke `runDailyReminders()`. Users receive correct reminders.

---

## Phase 10 — Help, About & Fallback Handling

**Goal:** Every user interaction gets a meaningful response — no silent failures.

### Step 10.1 — Implement `backend/src/handlers/help.js`
`/help` — command reference list.
`/about` — bot purpose, data policy, and deletion instructions.

### Step 10.2 — Implement fallback handler
Any unrecognized text that isn't part of an active flow → friendly message with suggested next steps.

**Checkpoint:** Random text → fallback. `/help` and `/about` respond correctly.

---

## Phase 11 — Hardening, Error Handling & Security

**Goal:** The bot is robust, secure, and ready for real users.

### Step 11.1 — Global error handling
Wrap all handlers in a `withErrorHandling(fn)` utility. Never expose stack traces to users.

### Step 11.2 — Input validation
- Numeric inputs validated for type and range.
- All dates via `dateParser.js` — never `new Date(rawInput)`.
- MongoDB queries always filtered by `telegramId`.

### Step 11.3 — Rate limiting
In-memory `Map` with rolling 1-minute window. Cap at 20 messages/min per user.

### Step 11.4 — Environment & secrets security
Startup check exits process if `TELEGRAM_BOT_TOKEN` or `MONGODB_URI` are missing.

### Step 11.5 — Database connection resilience
Mongoose timeout config already in place. Monitor reconnect events.

### Step 11.6 — Graceful shutdown
Already implemented in Phase 1. Verify it works end-to-end after all handlers are live.

### Step 11.7 — Logging
Structured prefixes: `[BOT]`, `[DB]`, `[CRON]`. Log commands (not content). Never log health data.

**Checkpoint:** Purposely trigger a handler error. User sees a graceful message; bot keeps running.

---

## Phase 12 — Frontend Landing Page

**Goal:** A beautiful, warm, and welcoming Next.js landing page that introduces PeriodSaathi, explains what it does, and drives users to the Telegram bot.

**Design principles:**
- Warm, feminine palette — soft pinks, dusty rose, warm whites, blush tones.
- Clean and uncluttered — no dashboards, no data overload.
- Emotionally reassuring copy — judgment-free, gentle, private.
- Mobile-first (most visitors will come from phones).
- Accessible (WCAG AA contrast, semantic HTML, readable font sizes).

### Step 12.1 — Scaffold the Next.js project

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Install additional dependencies:
```bash
npm install framer-motion lucide-react @fontsource/inter @fontsource/playfair-display
```

| Package | Purpose |
|---|---|
| `framer-motion` | Smooth section fade-ins and button hover animations |
| `lucide-react` | Clean icon set (shield, bell, calendar, etc.) |
| `@fontsource/playfair-display` | Elegant serif for headings |
| `@fontsource/inter` | Clean sans-serif for body copy |

### Step 12.2 — Configure Tailwind theme (`frontend/tailwind.config.ts`)

Extend the default theme with the PeriodSaathi palette and custom fonts:

```typescript
colors: {
  blush:    { 50: '#fff0f3', 100: '#ffe0e8', 200: '#ffc2d1', 300: '#ff96b2', 400: '#ff5c8a', DEFAULT: '#e85d8a' },
  rose:     { soft: '#f9e4ea', warm: '#f4c2cf', deep: '#c4627e' },
  petal:    '#fdf6f8',   // page background
  bark:     '#5c3344',   // dark text
  feather:  '#f0e6eb',   // card backgrounds
},
fontFamily: {
  sans:  ['Inter', 'sans-serif'],
  serif: ['Playfair Display', 'serif'],
},
```

### Step 12.3 — Create `frontend/app/layout.tsx`

- Set page metadata: title, description, Open Graph tags, Twitter card.
- Load fonts.
- Set `<html lang="en">` and root `<body>` background color (`petal`).

### Step 12.4 — Implement `frontend/components/Navbar.tsx`

- Sticky top navbar with logo ("🌸 PeriodSaathi") on the left.
- Single CTA button on the right: "Open in Telegram" linking to the bot's `t.me` URL.
- Blurs on scroll (backdrop-filter glassmorphism effect).
- No navigation links needed — single-page design.

### Step 12.5 — Implement `frontend/components/Hero.tsx`

Full-viewport hero section:

```
🌸
PeriodSaathi
Your cycle, your companion.

Never miss your period again.
Private reminders, smart predictions — all inside Telegram.
No app download. No sign-up. Just chat.

[Start Tracking — It's Free →]   ← links to t.me/periodsaathi_bot
```

- Large serif heading, warm subheading, two-line descriptor.
- Soft illustrated background or abstract petal SVG decoration.
- Animated fade-in on load (framer-motion).
- CTA button in blush pink with hover scale animation.

### Step 12.6 — Implement `frontend/components/HowItWorks.tsx`

Three-step flow with icons, numbers, and short captions:

| Step | Icon | Heading | Copy |
|---|---|---|---|
| 1 | 💬 | Open the bot | Find @PeriodSaathi on Telegram and tap Start |
| 2 | 📅 | Log your period | Tell the bot when your last period started — one message |
| 3 | 🔔 | Get reminded | We'll remind you 3 days, 1 day, and on the day your next period is due |

- Cards laid out in a responsive row (stacked on mobile, 3-column on desktop).
- Subtle connecting line/arrow between steps on desktop.

### Step 12.7 — Implement `frontend/components/Features.tsx`

Feature highlight grid (2×2 or 2×3 depending on count):

| Icon | Feature | Description |
|---|---|---|
| 🔒 | Completely private | Lives in your Telegram DMs — no app, no public profile, no visible icon on your home screen |
| 🧠 | Learns your cycle | Predictions improve with every log, using your real cycle history — not a fixed 28-day guess |
| 🔔 | Smart reminders | Get a heads-up 3 days before, 1 day before, and on the day — fully customizable |
| 📜 | Cycle history | See all your past cycles at a glance. No chart needed — just a clean, simple list |
| ⚙️ | Full control | Pause tracking anytime. Delete all your data in seconds. You're always in charge |
| 💛 | Zero friction | No email, no password, no download. If you have Telegram, you're ready |

### Step 12.8 — Implement `frontend/components/PrivacySection.tsx`

A dedicated, reassuring privacy statement section:

- Warm, conversational tone — not legal boilerplate.
- Three short bullet points:
  - "We only store your Telegram ID and the dates you log. That's it."
  - "Your data is never shared, sold, or used for anything else."
  - "Delete everything in seconds, any time, directly from the bot."
- Soft shield icon or lock illustration.
- Background in a slightly deeper petal/rose tone to visually separate from Features.

### Step 12.9 — Implement `frontend/components/CTASection.tsx`

Bottom CTA section before the footer:

```
Ready to take the stress out of tracking?

It takes less than 60 seconds to set up.

[🌸 Open PeriodSaathi on Telegram]
```

- Full-width blush gradient background.
- Centered copy with large CTA button.

### Step 12.10 — Implement `frontend/components/Footer.tsx`

Minimal footer:
- "🌸 PeriodSaathi — Your cycle, your companion."
- Links: Privacy · About · Open in Telegram
- Copyright line.

### Step 12.11 — Assemble `frontend/app/page.tsx`

Compose all sections in order:

```tsx
<Navbar />
<main>
  <Hero />
  <HowItWorks />
  <Features />
  <PrivacySection />
  <CTASection />
</main>
<Footer />
```

### Step 12.12 — Configure `frontend/.env.example`

```ini
NEXT_PUBLIC_BOT_USERNAME=periodsaathi_bot
NEXT_PUBLIC_BOT_URL=https://t.me/periodsaathi_bot
```

**Checkpoint:** `npm run dev` in `frontend/` serves a beautiful, responsive landing page. All sections render on mobile and desktop. CTA links point to the correct Telegram bot URL.

---

## Phase 13 — Deployment

**Goal:** Both backend and frontend are live in production.

### Step 13.1 — Backend deployment

**Platform:** Railway, Render, or a VPS with a domain + TLS.

1. Set all production env vars (`TELEGRAM_BOT_TOKEN`, `MONGODB_URI`, `WEBHOOK_URL`, `NODE_ENV=production`, `PORT`).
2. `NODE_ENV=production` activates webhook mode in `backend/src/app.js`.
3. Use **MongoDB Atlas** (free tier) for the hosted database.
4. Verify webhook registration: send `/start` to the bot and confirm the response arrives via webhook (not polling).

### Step 13.2 — Frontend deployment

**Platform:** Vercel (recommended for Next.js — zero-config deployment).

1. Connect the `frontend/` directory to a Vercel project.
2. Set `NEXT_PUBLIC_BOT_URL` to the production bot's `t.me` URL.
3. Configure a custom domain if desired.
4. Verify Open Graph metadata renders correctly via [opengraph.xyz](https://www.opengraph.xyz).

### Step 13.3 — Verify end-to-end

1. Visit the landing page — all sections render, CTA links open the bot in Telegram.
2. `/start` the bot — onboarding completes successfully.
3. Log a period, check `📊 My Cycle`.
4. Verify cron job runs at 9 AM (check server logs for `[CRON]` output).

**Checkpoint:** Both services are live, independently deployed, and working together.

---

## Phase 14 — Phase 2 Enhancements

*Implement after Phase 13 is stable in production.*

### Step 14.1 — Period end date logging
Follow-up message after start log → store `periodEndDate` → recalculate `avgPeriodLength`.

### Step 14.2 — Fertile window estimate
Enable the stub in `predictionService.getFertileWindow()`. Show in `📊 My Cycle` with a clear non-medical disclaimer.

### Step 14.3 — Late period nudge
Enable the Phase 9 stub. Send a gentle check-in if period is 3+ days overdue. Track `nudgeSentAt` on User to prevent repeated nudges.

### Step 14.4 — Pause/resume long-idle reminder
If `isPaused = true` for 90+ days, send a gentle "still paused" check-in.

### Step 14.5 — Improved natural language parsing
Extend `dateParser.js`: "last Monday", "2 days ago", "the 5th". Handle ambiguous future-year dates.

### Step 14.6 — Frontend blog/FAQ section
Add a collapsible FAQ section to the landing page answering common questions ("Is this really private?", "What if my cycle is irregular?", "Can I delete my data?").

---

## Dependency & Milestone Summary

| Phase | Key Deliverable | Depends On |
|---|---|---|
| 1 ✅ | Backend skeleton (ES modules, Express, DB, bot stub) | — |
| 2 | Mongoose schemas | 1 |
| 3 | Bot router + keyboards + message copy | 1, 2 |
| 4 | Onboarding flow | 2, 3 |
| 5 | Cycle logging + date parser | 2, 3, 4 |
| 6 | Predictions & My Cycle | 2, 5 |
| 7 | History + log deletion | 2, 5 |
| 8 | Settings | 2, 3 |
| 9 | Daily reminder scheduler | 2, 6 |
| 10 | Help, About, fallback | 3 |
| 11 | Hardening, security, error handling | 2–10 |
| 12 | Next.js landing page | Independent of 1–11 |
| 13 | Deployment (backend + frontend) | 11, 12 |
| 14 | Phase 2 enhancements | 13 |

> **Note:** Phase 12 (frontend) is independent of Phases 2–11 and can be worked on in parallel with backend phases once Phase 1 is complete.

---

*End of Implementation Plan*
