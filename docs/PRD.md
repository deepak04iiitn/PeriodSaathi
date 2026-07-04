# Product Requirements Document (PRD)

## PeriodSaathi

**Tagline:** Your cycle, Your companion
**About:** Never miss your next period. Private reminders, cycle tracking, and smart predictions.
**Description:** Your private period reminder and cycle companion. Track your periods, receive timely reminders, predict your next cycle, and stay informed.

---

## 1. Overview

PeriodSaathi is a Telegram bot that helps users track their menstrual cycle, receive private and timely reminders, and get smart predictions for their next period. It is designed to be lightweight, judgment-free, and accessible to anyone with a Telegram account — no app download, no account creation friction, and no public-facing profile.

The bot lives entirely inside a 1:1 Telegram chat, making it feel like a private, always-available companion rather than a heavyweight health app.

---

## 2. Problem Statement

Many people who menstruate struggle to consistently track their cycles because:

- Dedicated period-tracking apps require downloads, sign-ups, and permissions (notifications, storage, sometimes even camera/contacts) that feel excessive for a simple reminder need.
- Existing apps can feel cluttered with features (mood logs, symptom logs, community feeds, ads) when all the user wants is: *"tell me when my period is coming."*
- Privacy is a real concern — many users are hesitant to install a period-tracking app that syncs to the cloud, shows up in their app drawer, or could be seen by others using their phone.
- People already live inside messaging apps like Telegram/WhatsApp daily; adding "one more app" is a barrier to consistent tracking.

PeriodSaathi solves this by meeting users where they already are — a chat interface — and reducing the entire experience to a few simple conversational interactions.

---

## 3. Goals & Objectives

### Primary Goals
1. Make period tracking as easy as chatting with a friend.
2. Provide accurate, timely, and private reminders for upcoming periods.
3. Predict future cycles based on historical data with reasonable accuracy.
4. Ensure user data is private, secure, and never exposed to other Telegram users.

### Non-Goals (Explicitly Out of Scope for MVP)
- No monetization, subscriptions, or paid tiers.
- No social/community features (no sharing, no public profiles).
- No symptom/mood/fertility tracking in MVP (can be considered later).
- No integration with wearables or third-party health apps in MVP.
- No multi-language support in MVP (English-first, expandable later).

---

## 4. Target Users

### Primary Persona: "The Busy Tracker"
- Age 18–35, uses Telegram regularly for personal or professional communication.
- Wants a simple, no-fuss way to know when her next period is due.
- Values privacy — doesn't want a period app icon visible on her home screen or data tied to a public social profile.
- Not interested in deep analytics — just wants reliable reminders.

### Secondary Persona: "The Irregular Cycle User"
- Has a somewhat irregular cycle and wants the bot to learn from historical entries to improve prediction accuracy over time rather than relying on a fixed 28-day assumption.

### Tertiary Persona: "The Caretaker/Partner" (Future Consideration)
- Someone tracking on behalf of/with consent from a partner or family member. Not part of MVP, but worth keeping architecture flexible for.

---

## 5. Key Value Propositions

| Value | Why It Matters |
|---|---|
| **Privacy-first** | Lives in a private Telegram chat; no public profile, no app install, no visible icon. |
| **Zero friction onboarding** | Start chatting immediately — no signup forms, no email/password. |
| **Smart predictions** | Learns from cycle history instead of assuming a fixed 28-day cycle. |
| **Always accessible** | Works anywhere Telegram works — no dependency on a specific phone OS or app store. |
| **Lightweight** | Simple conversational UI (buttons + text) instead of complex dashboards. |

---

## 6. Core Features (MVP Scope)

### 6.1 Onboarding
- `/start` triggers a warm welcome message introducing PeriodSaathi and its purpose.
- Bot briefly explains what it will ask for (last period start date, average cycle length, average period length) and reassures the user about privacy.
- Simple guided setup flow (conversational, one question at a time) rather than a long form.

### 6.2 Cycle Logging
- Users can log the **start date** of their period via a button (`📅 Log Period`) or natural text input (e.g., "3 July", "today", "yesterday").
- Bot supports flexible date parsing (relative dates like "today"/"yesterday" and absolute dates like "3 July" or "03/07").
- Bot confirms the logged date back to the user before saving.
- Optionally logs **period end date** to calculate period length over time (improves prediction accuracy) — can be a lightweight follow-up prompt ("Has your period ended? When?").

### 6.3 Cycle Overview
- `📊 My Cycle` button/command shows:
  - Last logged period start date
  - Current cycle day (e.g., "Day 14 of your cycle")
  - Predicted next period date
  - Predicted fertile window (optional stretch feature, clearly marked as estimate, not medical advice)

### 6.4 Smart Predictions
- MVP: Calculate next period date using average cycle length from the user's own historical logs (fallback to a default 28-day cycle if fewer than 2 data points exist).
- As more cycles are logged, the bot recalculates a **rolling average** cycle length to refine future predictions.
- Predictions are always labeled as **estimates**, with a short disclaimer that cycles can naturally vary.

### 6.5 Reminders
- Daily scheduled job checks all users and sends reminders based on their predicted next period date:
  - **3 days before** predicted period (gentle heads-up)
  - **1 day before** predicted period
  - **On the predicted day**
- Reminder copy is warm, non-clinical, and reassuring (e.g., "🌸 Heads up — your period is expected in 3 days. Want to log anything?").
- Users can customize reminder timing/frequency via `⚙ Settings` (e.g., turn off the 3-day reminder, keep only day-of).

### 6.6 Settings
- `⚙ Settings` menu allows users to:
  - Update average cycle length manually (override auto-calculated value)
  - Update average period length
  - Toggle specific reminders on/off
  - Delete all their stored data (see Privacy section)
  - Pause tracking temporarily (e.g., during pregnancy, travel, etc.) without deleting history

### 6.7 Cycle History
- `📜 History` button/command shows the user's past logged cycles in a simple, readable list (e.g., last 6–12 entries).
- Each entry shows: period start date, period end date (if logged), and cycle length from the previous entry.
- Helps users see patterns over time (e.g., "your cycles have ranged from 26–30 days") without needing a chart or dashboard.
- If the user has no history yet, bot responds with a friendly message encouraging them to log their first period.
- Optional: allow correcting/deleting a specific past entry directly from the history view (e.g., if a date was logged by mistake).

### 6.9 Help & Support
- `/help` lists all available commands and a short explanation of what the bot can do.
- `/about` shares the bot's purpose, privacy stance, and tagline.

### 6.10 Message Handling & Natural Input
- Bot should gracefully handle free-text input where possible (e.g., a raw date sent without pressing a button) rather than forcing rigid button-only interaction.
- Unrecognized input triggers a friendly fallback message with suggested commands, not a silent failure.

---

## 7. User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| 1 | New user | Start the bot and set up quickly | I can begin tracking without a long form |
| 2 | User | Log my period start date easily | The bot can predict my next cycle |
| 3 | User | See how many days into my cycle I am | I understand where I am without doing math |
| 4 | User | Get reminded a few days before my period | I can be prepared in advance |
| 5 | User | View my past logged cycles | I can spot patterns and trust the bot's predictions |
| 6 | User | Adjust my cycle length manually | I have full control if the bot's estimate is off |
| 7 | User | Turn off or customize reminders | The bot respects my preferences |
| 8 | User | Delete my data at any time | I trust the bot with my privacy |
| 9 | User | Ask for help/commands anytime | I don't get stuck or confused |

---

## 8. Conversation & Command Map

```
/start   → Welcome + onboarding flow
/help    → List of commands
/about   → About the bot

📅 Log Period   → Prompt for period start date → confirm → save
📊 My Cycle     → Show current cycle day + next predicted date
📜 History      → Show past logged cycles (start/end dates, cycle lengths)
⚙ Settings      → Cycle length / period length / reminders / delete data / pause tracking
```

---

## 9. Data Model (Conceptual)

### User
| Field | Type | Notes |
|---|---|---|
| telegramId | Number | Unique identifier from Telegram |
| firstName | String | For personalized greetings |
| createdAt | Date | Account creation timestamp |
| avgCycleLength | Number | Default 28, recalculated as data grows |
| avgPeriodLength | Number | Default 5, recalculated as data grows |
| reminderSettings | Object | Which reminders are enabled |
| isPaused | Boolean | Whether tracking is temporarily paused |

### CycleLog
| Field | Type | Notes |
|---|---|---|
| telegramId | Number | Links to User |
| periodStartDate | Date | User-logged start date |
| periodEndDate | Date (optional) | User-logged end date, if provided |
| createdAt | Date | When this log entry was saved |

> Storing logs as a separate collection (rather than only a single "last period" field) enables historical analysis and improving prediction accuracy over time.

---

## 10. Reminder Logic (High-Level)

1. Daily scheduled job runs once per day (e.g., 9:00 AM local/server time).
2. For each active (non-paused) user:
   - Calculate predicted next period date using `lastPeriodStartDate + avgCycleLength`.
   - Check if today matches a configured reminder offset (e.g., predicted date − 3 days, − 1 day, or 0 days).
   - If yes, send the corresponding reminder message.
3. Recalculate `avgCycleLength` and `avgPeriodLength` whenever a new complete cycle is logged (rolling average across the last N cycles, e.g., last 6).

---

## 11. Technical Approach (Suggested)

### Tech Stack
- **Bot Framework:** `node-telegram-bot-api`
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Scheduling:** `node-cron` for daily reminder jobs
- **Environment Config:** `.env` for bot token, DB URI, port

### Development vs Production
| Environment | Mode |
|---|---|
| Development | Polling (simple, no public URL needed) |
| Production | Webhooks (more efficient, scalable, recommended once deployed) |

### High-Level Architecture
```
Telegram <-> Bot Server (Express + node-telegram-bot-api)
                   |
                   v
              MongoDB (Users, CycleLogs)
                   |
                   v
          node-cron (Daily Reminder Job)
```

---

## 12. Privacy & Security (Critical for This Product)

Given the sensitive nature of menstrual health data, privacy must be a first-class design principle, not an afterthought.

- **Data minimalism:** Only collect what's strictly needed (dates, cycle length settings). No names beyond Telegram's first name, no other personal identifiers.
- **No data sharing:** Data is never shared with third parties or used for purposes beyond the bot's core function.
- **User-controlled deletion:** Users can request full deletion of their data at any time via `⚙ Settings`, with immediate effect.
- **Encryption:** Database connections should use TLS; sensitive fields can be encrypted at rest if hosting environment allows.
- **No public exposure:** All interactions happen in a private 1:1 chat; the bot never posts to groups or channels unless explicitly extended to do so in the future with clear consent.
- **Transparent communication:** `/about` and onboarding messages clearly state what data is collected and why.
- **Access control:** Bot token and database credentials stored securely via environment variables, never hardcoded or logged.

---

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Reliability | Reminder job must run daily without missing users (retry logic on failure) |
| Performance | Bot should respond to user messages within 1–2 seconds under normal load |
| Scalability | Architecture should support growth from tens to thousands of users without redesign (indexed queries, efficient cron batching) |
| Availability | Target uptime of 99%+ once in production |
| Data Integrity | Cycle logs should never be silently overwritten; corrections should be explicit user actions |
| Accessibility | Simple language, large touch-friendly buttons, minimal typing required |

---

## 14. Success Metrics

- **Activation Rate:** % of users who complete onboarding (log at least one period date) after pressing `/start`.
- **Retention:** % of users still logging periods after 2–3 cycles (60–90 days).
- **Reminder Engagement:** % of users who respond to or acknowledge reminders (e.g., log a new period shortly after a reminder).
- **Prediction Accuracy:** Average deviation (in days) between predicted and actual logged period start dates, tracked over time.
- **Opt-outs:** Number of users disabling reminders or deleting data (signal for UX or trust issues).

---

## 15. Roadmap

### Phase 1 — MVP
- [ ] Bot created via BotFather, `/start` and `/help` working
- [ ] MongoDB connected, User schema implemented
- [ ] Period logging flow (start date, confirmation, save)
- [ ] Cycle length & period length capture (manual + auto-calculated)
- [ ] `📊 My Cycle` overview command
- [ ] `📜 History` command to view past logged cycles
- [ ] Daily reminder scheduler (3-day, 1-day, day-of)
- [ ] Basic settings (edit cycle length, toggle reminders, delete data)
- [ ] Deploy and switch from polling to webhooks

### Phase 2 — Enhancements
- [ ] Rolling average recalculation based on last N cycles
- [ ] Period end date logging for period-length tracking
- [ ] Fertile window estimate (clearly labeled as non-medical estimate)
- [ ] Pause/resume tracking (for travel, pregnancy, etc.)
- [ ] Improved natural language date parsing
- [ ] Gentle check-in messages if a period is late compared to prediction

### Phase 3 — Future Exploration
- [ ] Multi-language support
- [ ] Optional symptom/mood logging (kept simple, opt-in only)
- [ ] Export personal data (e.g., as a simple summary the user can download)
- [ ] Reminder tone customization (formal / friendly / minimal)
- [ ] Partner/caretaker sharing with explicit consent flow

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Users distrust a bot with sensitive health data | Strong privacy messaging at onboarding, easy data deletion, no data sharing |
| Irregular cycles lead to inaccurate predictions | Use rolling averages, clearly label predictions as estimates, allow manual overrides |
| Users forget to log periods, breaking prediction accuracy | Friendly nudge if a period is significantly overdue compared to prediction |
| Telegram API/service disruption | Graceful error handling, retry logic for message sending, monitoring/alerts |
| Scaling issues with polling in production | Plan explicit migration to webhooks before wide rollout |

---

## 17. Open Questions

- Should reminders be sent at a fixed time (e.g., 9 AM server time) or allow per-user time zone/preferred time customization in MVP or later?
- Should the bot proactively check in if a period is late, or only respond when the user initiates contact?
- What is the minimum number of logged cycles before the bot switches from a default 28-day assumption to a personalized average (e.g., 2 cycles vs. 3 cycles)?
- Should period length tracking be part of MVP or deferred to Phase 2 to keep the initial flow as short as possible?

---

## 18. Appendix: Sample Bot Copy (Tone Reference)

- **Welcome:** "🌸 Hi! I'm PeriodSaathi — your private cycle companion. I'll help you track your periods and remind you before your next one's due. Let's get started — when did your last period start?"
- **Reminder (3 days before):** "🌸 Just a heads-up — your period is expected in about 3 days. No rush, just wanted you to be prepared!"
- **Reminder (day-of):** "🌸 Today's your predicted period start date. If it begins, tap 📅 Log Period so I can keep learning your cycle."
- **Data deletion confirmation:** "Your data has been deleted. You can start fresh anytime by sending /start."

---

*End of PRD*