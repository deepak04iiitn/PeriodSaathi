# PeriodSaathi Bot — Manual Test Plan

**Version:** 1.0  
**Bot:** @your_bot_username (replace with your actual username from BotFather)  
**Environment:** Production (Render deployment)  
**Tester:** _______________  
**Date:** _______________

---

## How to use this document

- Work through each section **in order** — later tests depend on data created by earlier ones.
- For each test case, perform the action, compare the actual result to the expected result, and mark **PASS** or **FAIL**.
- If a test fails, note what you actually saw in the **Notes** column.
- A fresh test run requires deleting all data first — see [Section 9.5](#95-delete-all-data-nuclear-test).

---

## Pre-flight checklist

Before opening Telegram, confirm your backend is alive.


| #   | Check                 | How                                                   | Expected                           | Result |
| --- | --------------------- | ----------------------------------------------------- | ---------------------------------- | ------ |
| P1  | Server is up          | `GET https://your-app.onrender.com/health` in browser | `{"status":"ok","mode":"polling"}` |        |
| P2  | Bot token is set      | Open bot in Telegram, send any message                | Bot responds (even if confused)    |        |
| P3  | MongoDB is connected  | Check Render logs for `[DB] MongoDB connected`        | Log line present                   |        |
| P4  | Bot username resolves | Search `@your_bot_username` in Telegram               | Bot profile appears                |        |


---

## Section 1 — New User Onboarding

> **Goal:** A brand-new user opens the bot and completes setup for the first time.

### 1.1 — `/start` as a new user


| Step | Action                                    | Expected response                                                                                                                                    |
| ---- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the bot chat for the first time      | —                                                                                                                                                    |
| 2    | Tap **Start** or send `/start`            | Welcome message containing your first name, privacy statement ("What I store… / What I never do…"), and prompt: *"when did your last period start?"* |
| 3    | Verify no main-menu keyboard is shown yet | Only the text prompt — no `📅 Log Period` / `📊 My Cycle` buttons in the keyboard                                                                    |


**Pass / Fail:** _____    **Notes:** _______________

---

### 1.2 — Enter last period start date (onboarding)


| Step | Action                                 | Expected response                                                                                      |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1    | Type a date in the past, e.g. `1 June` | Bot replies *"I read that as **1 Jun 2026**. Is that right?"* with **Yes ✅** / **No ❌** inline buttons |
| 2    | Tap **Yes, that's right ✅**            | Bot asks: *"About how long is your cycle usually?"* with guidance to type `28` if unsure               |


**Pass / Fail:** _____    **Notes:** _______________

---

### 1.3 — Enter cycle length (onboarding)


| Step | Action    | Expected response                                                                                                                                                                   |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Type `28` | Bot replies with onboarding complete message, shows predicted next period date, and the **main menu keyboard** (`📅 Log Period`, `📊 My Cycle`, `📜 History`, `⚙ Settings`) appears |


**Pass / Fail:** _____    **Notes:** _______________

---

### 1.4 — Reject the parsed date (onboarding)

> Restart with fresh data (Section 9.5), then repeat 1.1–1.2 but this time tap **No**.


| Step | Action                                          | Expected response                                  |
| ---- | ----------------------------------------------- | -------------------------------------------------- |
| 1    | Complete 1.1, enter a date, see confirmation    | Date confirmation inline buttons shown             |
| 2    | Tap **No, re-enter ❌**                          | Bot re-prompts: *"📅 When did your period start?"* |
| 3    | Type a different valid date and confirm **Yes** | Proceeds to cycle length prompt                    |


**Pass / Fail:** _____    **Notes:** _______________

---

### 1.5 — Invalid cycle length during onboarding


| Step | Action                                   | Expected response                                         |
| ---- | ---------------------------------------- | --------------------------------------------------------- |
| 1    | When prompted for cycle length, type `5` | Bot replies: *"Please enter a number between 15 and 60."* |
| 2    | Type `100`                               | Same validation error                                     |
| 3    | Type `abc`                               | Same validation error                                     |
| 4    | Type `30`                                | Onboarding completes successfully                         |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 2 — Date Parsing

> **Prerequisite:** Onboarding complete (Section 1.3 done). Tap `📅 Log Period` to enter the date-input state for each sub-test.

### 2.1 — Supported date formats


| #     | Input you type | Expected parsed date   | Pass/Fail |
| ----- | -------------- | ---------------------- | --------- |
| 2.1.1 | `today`        | Today's date           |           |
| 2.1.2 | `yesterday`    | Yesterday's date       |           |
| 2.1.3 | `3 July`       | 3 Jul 2026             |           |
| 2.1.4 | `03/07`        | 3 Jul 2026 (day-first) |           |
| 2.1.5 | `15 May`       | 15 May 2026            |           |
| 2.1.6 | `2 weeks ago`  | ~20 Jun 2026           |           |


After each, tap **No, re-enter** to avoid creating duplicate logs.

**Pass / Fail (all):** _____    **Notes:** _______________

---

### 2.2 — Future date rejection


| Step | Action                                           | Expected response                                                                                            |
| ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1    | Tap `📅 Log Period`, type a date 5 days from now | Bot replies: *"That date looks like it's in the future — periods can only be logged for dates up to today."* |
| 2    | No log should be created                         | Tap `📊 My Cycle` — last logged date unchanged                                                               |


**Pass / Fail:** _____    **Notes:** _______________

---

### 2.3 — Unparseable date


| Step | Action                                      | Expected response                                                                                                       |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📅 Log Period`, type `purple elephant` | Bot replies: *"Hmm, I couldn't quite parse that date…"* with guidance to try `today`, `yesterday`, `3 July`, or `03/07` |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 3 — Cycle Logging

> **Prerequisite:** Onboarding complete.

### 3.1 — Log a period via the button


| Step | Action                               | Expected response                                                         |
| ---- | ------------------------------------ | ------------------------------------------------------------------------- |
| 1    | Tap `📅 Log Period` on the main menu | Bot asks: *"📅 When did your period start?"*                              |
| 2    | Type `today`                         | Date confirmation message with **Yes / No** buttons                       |
| 3    | Tap **Yes, that's right ✅**          | Log success message with period start date and next predicted period date |


**Pass / Fail:** _____    **Notes:** _______________

---

### 3.2 — Log a period via free text (no button tap)


| Step | Action                                                                 | Expected response                                                                                                                                         |
| ---- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Without tapping any button, simply type `15 June` directly in the chat | Bot should **not** interpret this as a log attempt (user is in normal state, not AWAITING a date) — bot should show the fallback message with suggestions |


> **Note:** Free-text date logging only works when the bot is actively awaiting a date input (i.e., after tapping `📅 Log Period`).

**Pass / Fail:** _____    **Notes:** _______________

---

### 3.3 — Duplicate log warning


| Step | Action                                                                               | Expected response                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📅 Log Period`, type a date already logged (e.g., today, if you just logged it) | Bot shows a warning: *"You already have a period logged around [date]. Are you sure you want to add another entry?"* with **Yes / No** buttons |
| 2    | Tap **No**                                                                           | Log is cancelled, main menu returns                                                                                                            |
| 3    | Repeat, tap **Yes**                                                                  | Duplicate log is created; verify in History                                                                                                    |


**Pass / Fail:** _____    **Notes:** _______________

---

### 3.4 — Log two cycles (enables personalized predictions)

> Log a second period approximately 28–30 days after the first to give the bot real data.


| Step | Action                                                     | Expected response                                                                                   |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | Tap `📅 Log Period`, enter a date ~28 days after first log | Confirmation prompt                                                                                 |
| 2    | Confirm                                                    | Log success; next predicted date should reflect your personal average, not the default 28-day guess |
| 3    | Tap `📊 My Cycle`                                          | Overview shows updated avg cycle length and refreshed prediction                                    |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 4 — My Cycle Overview

> **Prerequisite:** At least one period logged.

### 4.1 — My Cycle via button


| Step | Action            | Expected response                                                                                                                                   |
| ---- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📊 My Cycle` | Overview message containing: Last period date, Cycle day ("Day X"), Next period prediction with days-until label, Avg cycle length, disclaimer note |


**Pass / Fail:** _____    **Notes:** _______________

---

### 4.2 — My Cycle with no data

> Requires a fresh account with no logs (delete data — Section 9.5 — then `/start` but don't complete onboarding OR complete onboarding only).


| Step | Action                                                         | Expected response                                                                   |
| ---- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1    | Tap `📊 My Cycle` before logging any period (after onboarding) | Bot replies: *"You haven't logged a period yet. Tap 📅 Log Period to get started."* |


**Pass / Fail:** _____    **Notes:** _______________

---

### 4.3 — Cycle day accuracy


| Step | Action                                           | Expected response                         |
| ---- | ------------------------------------------------ | ----------------------------------------- |
| 1    | Log today as a period start date                 | Tap `📊 My Cycle` — should show **Day 1** |
| 2    | If possible, note the date and re-check tomorrow | Should show **Day 2**                     |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 5 — Cycle History

> **Prerequisite:** At least 2 period logs exist.

### 5.1 — View history


| Step | Action                                                           | Expected response                                                                                                                   |
| ---- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📜 History`                                                 | List of all logged cycles, each with start date, end date (or `—`), period length, cycle length, and a `🗑 Delete` button per entry |
| 2    | Verify entries are in reverse-chronological order (newest first) | Most recent log is at the top                                                                                                       |


**Pass / Fail:** _____    **Notes:** _______________

---

### 5.2 — History with no logs


| Step | Action                               | Expected response                                                                         |
| ---- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1    | On a fresh account, tap `📜 History` | Bot replies: *"You haven't logged any periods yet. Tap 📅 Log Period to start tracking."* |


**Pass / Fail:** _____    **Notes:** _______________

---

### 5.3 — Delete a single history entry


| Step | Action                                                              | Expected response                                                                                            |
| ---- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | Tap `📜 History`                                                    | History list shown                                                                                           |
| 2    | Tap `🗑 Delete` on any entry                                        | Confirmation prompt: *"Are you sure you want to delete the entry for [date]?"* with **Yes ✅** / **Cancel ❌** |
| 3    | Tap **Cancel ❌**                                                    | Confirmation dismissed, nothing deleted                                                                      |
| 4    | Tap `🗑 Delete` again on the same entry, then tap **Yes, delete ✅** | *"Entry deleted. Your cycle averages have been updated."*                                                    |
| 5    | Tap `📜 History` again                                              | Entry is gone; remaining entries updated                                                                     |
| 6    | Tap `📊 My Cycle`                                                   | Average cycle length recalculated based on remaining entries                                                 |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 6 — Settings

> **Prerequisite:** Onboarding complete.

### 6.1 — Open settings


| Step | Action           | Expected response                                                                                                                                                                       |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `⚙ Settings` | Settings menu with inline buttons: Edit Cycle Length (showing current value), Edit Period Length, three reminder toggles (all ✅ by default), Pause Tracking, Delete All My Data, ← Back |


**Pass / Fail:** _____    **Notes:** _______________

---

### 6.2 — Edit cycle length


| Step | Action                                            | Expected response                                                                                |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1    | In Settings, tap **✏️ Edit Cycle Length: X days** | Bot asks: *"How many days is your cycle usually? (15–60)"*                                       |
| 2    | Type `32`                                         | *"✅ Cycle length updated to 32 days."* followed by the settings menu refreshed to show `32 days` |
| 3    | Verify: tap `📊 My Cycle`                         | Next predicted date reflects the new 32-day cycle                                                |
| 4    | Reopen Settings, tap Edit Cycle Length, type `8`  | Validation error: *"Please enter a number between 15 and 60."*                                   |
| 5    | Type `28` to reset                                | Updated to 28 days                                                                               |


**Pass / Fail:** _____    **Notes:** _______________

---

### 6.3 — Edit period length


| Step | Action                                             | Expected response                                                 |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | In Settings, tap **✏️ Edit Period Length: X days** | Bot asks: *"How many days does your period usually last? (1–14)"* |
| 2    | Type `6`                                           | *"✅ Period length updated to 6 days."* Settings menu refreshed    |
| 3    | Type `0` (invalid)                                 | Validation error: *"Please enter a number between 1 and 14."*     |
| 4    | Type `5` to reset                                  | Updated to 5 days                                                 |


**Pass / Fail:** _____    **Notes:** _______________

---

### 6.4 — Toggle reminders


| Step | Action                       | Expected response                                                             |
| ---- | ---------------------------- | ----------------------------------------------------------------------------- |
| 1    | In Settings, tap **3-day ✅** | Button changes to **3-day ❌**; settings menu re-renders showing the new state |
| 2    | Tap **3-day ❌** again        | Toggles back to **3-day ✅**                                                   |
| 3    | Tap **1-day ✅**              | Changes to **1-day ❌**                                                        |
| 4    | Tap **Day-of ✅**             | Changes to **Day-of ❌**                                                       |
| 5    | Restore all toggles to ✅     | All three reminder toggles show ✅                                             |


**Pass / Fail:** _____    **Notes:** _______________

---

### 6.5 — Pause and resume tracking


| Step | Action                                | Expected response                                                                                                                     |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | In Settings, tap **⏸ Pause Tracking** | *"Tracking paused. You won't receive any reminders until you resume. Tap ▶️ Resume Tracking in ⚙ Settings."* Main menu keyboard shown |
| 2    | Tap `⚙ Settings`                      | Settings menu shows **▶️ Resume Tracking** button (not Pause)                                                                         |
| 3    | Tap **▶️ Resume Tracking**            | *"Tracking resumed! Reminders are back on."* Settings menu shows **⏸ Pause Tracking** again                                           |


**Pass / Fail:** _____    **Notes:** _______________

---

### 6.6 — Back button


| Step | Action                              | Expected response                                      |
| ---- | ----------------------------------- | ------------------------------------------------------ |
| 1    | In Settings, tap **← Back to Menu** | *"🌸 Back to the main menu."* Main menu keyboard shown |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 7 — Help & About

### 7.1 — `/help` command


| Step | Action       | Expected response                                                                                                                                        |
| ---- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Type `/help` | Help message listing all capabilities: `📅 Log Period`, `📊 My Cycle`, `📜 History`, `⚙ Settings`, `/start`, `/help`, `/about` — with main menu keyboard |


**Pass / Fail:** _____    **Notes:** _______________

---

### 7.2 — `/about` command


| Step | Action        | Expected response                                                                                                                     |
| ---- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Type `/about` | About message with bot tagline, privacy stance ("What I store… / What I never do…"), and data deletion info — with main menu keyboard |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 8 — Fallback & Edge Cases

### 8.1 — Unrecognised free text


| Step | Action                                                      | Expected response                                                                        |
| ---- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1    | Type `hello` (not a command, not a date, no pending action) | *"I didn't quite get that. Here's what you can do: …"* fallback message with suggestions |
| 2    | Type `how are you`                                          | Same fallback message                                                                    |
| 3    | Type `🎉` (emoji only)                                      | Same fallback message                                                                    |


**Pass / Fail:** _____    **Notes:** _______________

---

### 8.2 — `/start` for a returning user


| Step | Action                                          | Expected response                                                                                                         |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1    | With onboarding already complete, send `/start` | *"🌸 Welcome back, [name]! What would you like to do today?"* — main menu keyboard shown, NO onboarding flow re-triggered |


**Pass / Fail:** _____    **Notes:** _______________

---

### 8.3 — Rate limiting


| Step | Action                                                 | Expected response                                                                                                       |
| ---- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Send 10+ messages as fast as possible (hold down send) | After the threshold, bot stops responding to that burst for ~1 minute; after the window passes, normal responses resume |


**Pass / Fail:** _____    **Notes:** _______________

---

### 8.4 — Interrupted state recovery


| Step | Action                                        | Expected response                                                                                                       |
| ---- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📅 Log Period` (bot now awaits a date)   | Prompt shown                                                                                                            |
| 2    | Instead of entering a date, tap `📊 My Cycle` | Bot should handle the tap gracefully — either show the cycle overview (clearing the pending state) or show the fallback |
| 3    | Verify bot is not stuck                       | Sending any normal message afterwards gets a proper response                                                            |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 9 — Data Management

### 9.1 — Health check before data deletion


| Step | Action            | Expected response          |
| ---- | ----------------- | -------------------------- |
| 1    | Tap `📜 History`  | At least one entry visible |
| 2    | Tap `📊 My Cycle` | Cycle overview shown       |


**Pass / Fail:** _____    **Notes:** _______________

---

### 9.2 — Delete confirmation — cancel path


| Step | Action                        | Expected response                                                                                                                                                             |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tap `⚙ Settings`              | Settings menu                                                                                                                                                                 |
| 2    | Tap **🗑 Delete All My Data** | Warning: *"⚠️ Are you sure? This will permanently delete all your cycle logs and settings. This cannot be undone."* with **Yes, delete everything** / **No, go back** buttons |
| 3    | Tap **No, go back**           | Settings menu shown again; no data deleted                                                                                                                                    |
| 4    | Verify: Tap `📜 History`      | History still intact                                                                                                                                                          |


**Pass / Fail:** _____    **Notes:** _______________

---

### 9.3 — Verify predictions are estimates


| Step | Action            | Expected response                                                                                         |
| ---- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | Tap `📊 My Cycle` | Overview message contains the disclaimer line: *"Predictions are estimates — cycles can naturally vary."* |


**Pass / Fail:** _____    **Notes:** _______________

---

### 9.4 — Server health during use


| Step | Action                                                                            | Expected response                                    |
| ---- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1    | While chatting normally, open `https://your-app.onrender.com/health` in a browser | `{"status":"ok","mode":"polling"}` — server is alive |


**Pass / Fail:** _____    **Notes:** _______________

---

### 9.5 — Delete all data (nuclear test) ⚠️

> **Use this to reset state before a full test re-run. All data will be permanently lost.**


| Step | Action                                       | Expected response                                                                                    |
| ---- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1    | Tap `⚙ Settings` → **🗑 Delete All My Data** | Warning prompt                                                                                       |
| 2    | Tap **⚠️ Yes, delete everything**            | *"Your data has been deleted. You can start fresh anytime by sending /start."* — keyboard is removed |
| 3    | Send `/start`                                | Full new-user onboarding begins (welcome message, date prompt) — NOT welcome-back                    |
| 4    | Tap `📊 My Cycle` without logging anything   | *"You haven't logged a period yet."*                                                                 |
| 5    | Tap `📜 History` without logging anything    | *"You haven't logged any periods yet."*                                                              |


**Pass / Fail:** _____    **Notes:** _______________

---

## Section 10 — Reminder Verification (Manual Trigger)

> **Prerequisite:** `ENABLE_ADMIN_ROUTES=true` set in your Render environment variables.

### 10.1 — Trigger reminders manually


| Step | Action                                                                                          | Expected response                                                                                                                                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Make sure a period is logged and the predicted next date is today, tomorrow, or 3 days from now | —                                                                                                                                                                                                                            |
| 2    | From terminal or Postman, send: `POST https://your-app.onrender.com/admin/trigger-reminders`    | Response: `{"ok":true,"message":"Reminder job completed."}`                                                                                                                                                                  |
| 3    | Check Telegram                                                                                  | Appropriate reminder message received: *"🌸 Just a heads-up — your period is expected in about 3 days…"* or *"🌸 Your period is expected tomorrow…"* or *"🌸 Today's your predicted period start date…"* depending on timing |


**Pass / Fail:** _____    **Notes:** _______________

---

### 10.2 — No reminder when paused


| Step | Action                                             | Expected response                                       |
| ---- | -------------------------------------------------- | ------------------------------------------------------- |
| 1    | Pause tracking via `⚙ Settings → ⏸ Pause Tracking` | Confirmed paused                                        |
| 2    | Trigger reminders manually (10.1 step 2)           | No reminder received in Telegram for the paused account |
| 3    | Resume tracking                                    | ▶️ Tracking resumed                                     |


**Pass / Fail:** _____    **Notes:** _______________

---

## Test Summary


| Section                   | Total tests | Passed | Failed |
| ------------------------- | ----------- | ------ | ------ |
| Pre-flight                | 4           |        |        |
| 1 — Onboarding            | 5           |        |        |
| 2 — Date parsing          | 7           |        |        |
| 3 — Cycle logging         | 4           |        |        |
| 4 — My Cycle              | 3           |        |        |
| 5 — History               | 3           |        |        |
| 6 — Settings              | 6           |        |        |
| 7 — Help & About          | 2           |        |        |
| 8 — Fallback & edge cases | 4           |        |        |
| 9 — Data management       | 5           |        |        |
| 10 — Reminders            | 2           |        |        |
| **Total**                 | **45**      |        |        |


---

## Known limitations / not tested in MVP


| Item                         | Reason                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Period **end date** logging  | Not implemented in MVP (Phase 2)                                                  |
| Fertile window               | Stubbed in prediction service (Phase 14)                                          |
| Multi-timezone reminder time | Reminders fire at 09:00 IST for all users                                         |
| Late period nudge            | Partially implemented — `nudgeSentAt` guard exists but full nudge logic is a stub |
| Webhook mode                 | Tested via polling on Render; webhook path covered by code review only            |


