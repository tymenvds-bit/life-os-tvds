# Life OS TvdS

Personal life operating system for Tijmen van der Schyff.

## Architecture

- **Single-file PWA** — all frontend lives in `index.html` (HTML + CSS + JS in one file)
- **Backend** — Google Sheets via Apps Script (`backend/api.gs`), deployed as a web app
- **AI** — Claude API called directly from the browser using an Anthropic API key
- **Offline** — Service worker (`sw.js`) caches the app shell; API calls are network-first

## Stack

- Vanilla HTML/CSS/JS — no frameworks, no build step, no dependencies
- Fonts: DM Sans, DM Mono, Lora (loaded from Google Fonts)
- Auto light/dark theme (Pretoria sunrise/sunset via `SUN_TABLE`) with manual override in Settings (`CFG.theme`: `auto`|`dark`|`light`)
- Gold accent color (`#c9a84c`)

## Modules

| Tab | Sheet | Description |
|-----|-------|-------------|
| Todos | Todos | Task manager with statuses (open/in-progress/waiting/done), progress logs, priorities, categories, due dates, overdue tracking, AI breakdown. Capture AI matches brain dump items to existing tasks via `task_updates`. |
| Notes | Notes | Freeform notes with categories and tags |
| Time | Time | Time tracking with live timer, manual entry, AI bulk parse; duration-based blocks from capture; date navigation (◀/▶/Today); Screen Time-style stats (day/week/month with stacked category bars and breakdown) |
| Journal | Journal | Daily journal with mood tracking |
| Vehicles | GQ_Patrol, GU_Patrol | Fuel/service/repair logs for two vehicles |
| Home | HomeInventory | Household item tracking |
| Prima Stock | PrimaStock | Business stock/inventory |
| Calendar | Google Calendar API | Live events from Google Calendar; create via capture or Quick Event |

## Deployment

- Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → GitHub Pages
- Live at: https://tymenvds-bit.github.io/life-os-tvds/

## Rules

- Keep the single-file structure (`index.html`). Do not split into multiple files.
- No frameworks (React, Vue, etc.). No build tools (Webpack, Vite, etc.).
- No npm dependencies. Everything is vanilla.
- All data persists to localStorage first, then syncs to Google Sheets.
- Escape all user input with `esc()` before rendering as HTML.
- Test changes by opening `index.html` directly in a browser or via GitHub Pages.
- **After every significant change:** update this file (CLAUDE.md) to reflect new modules, functions, API actions, or architecture changes. This file must always match the current state of the codebase.

## Key Functions

- `apiFetch(sheet)` / `apiPost(action, sheet, data)` — Google Sheets API calls
- `calFetch(days)` / `calCreate(ev)` — Google Calendar API (via Apps Script)
- `claude(prompt, system, max)` — Claude API call
- `capture(mode)` — AI-powered natural language capture (modes: `standard`, `eod`, `whatsapp`, `fuel`); sends existing open tasks to AI for matching; routes to task_updates, todos, notes, time, journal, calendar, fuel
- `buildPreview(parsed)` — renders editable preview with inline fields and delete buttons; stores data in `captureData` global
- `collectPreviewEdits()` — reads edited values from preview DOM back into `captureData` before saving
- `removePreviewItem(section, index)` — removes an item from preview and re-renders
- `commitCapture()` — saves all captured items from `captureData`; handles task_updates (progress + status), new todos, notes, duration-based time blocks, journal, fuel, calendar events
- `renderAll()` — re-renders all tabs
- `cycleStatus(id)` / `setTaskStatus(id, status)` — cycle or set task status (open → in-progress → waiting → done)
- `addProgress(id)` — add timestamped progress note to a task
- `getStatus(t)` — get task status (backward-compatible with legacy `done` field)
- `isOverdue(t)` — check if task is past due and not done
- `esc(s)` — HTML-escape strings (XSS prevention)
- `uid()` — generate unique IDs
- `toast(msg)` — show notification
- `normalizeDate(d)` — convert any date format (Date object, MM/DD/YYYY, ISO) to YYYY-MM-DD
- `shiftTimeDate(offset)` — navigate Time tab date (◀/▶ arrows, Today button)
- `setTimeView(mode)` / `renderTimeStats()` — Screen Time-style visualization (day/week/month with stacked category bars)
- `applyTheme()` / `isDaylight()` — auto light/dark theme based on Pretoria sunrise/sunset times; manual override in Settings
- `loadAll()` — fetches all sheets from API + normalizes dates; loads calendar events
- `renderAll()` calls: `renderTodos()`, `renderNotes()`, `renderTimeLog()`, `renderJournal()`, `renderCalendar()`, `renderVehicles()`, `renderHome()`, `renderStock()`, `renderSnapshot()`, `updateStats()`
- `startTimer()` / `stopTimer()` — live timer with elapsed display in header
- `addTimeBlock()` — manual time entry with start/end/title/category
- `bulkParse()` — AI parses freeform time text into structured blocks
- `quickAdd()` — quick task add from Capture tab

## Backend API Actions (api.gs)

| Action | Method | Description |
|--------|--------|-------------|
| `read` | GET | Read rows from a sheet |
| `ping` | GET | Health check |
| `calendar` | GET | List Google Calendar events (`?days=14`) |
| `append` | POST | Add a row to a sheet |
| `write` | POST | Overwrite all rows in a sheet |
| `update` | POST | Update a row by ID |
| `delete` | POST | Delete a row by ID |
| `upsert` | POST | Update or insert a row |
| `cal_create` | POST | Create a Google Calendar event |
| `cal_delete` | POST | Delete a Google Calendar event |

## Data Architecture & Backup

| Layer | Location | Purpose | Survives |
|-------|----------|---------|----------|
| **localStorage** | Browser (per device) | Offline-first cache, instant reads | Cleared if browser data wiped |
| **Google Sheets** | Google account (`17IXrGN11g8Fm8AjROr_W9_99xz1q_jqCdb8AQOFIX2s`) | Source of truth for all data | Google's infrastructure, auto-versioned |
| **Google Calendar** | Google account | Calendar events (independent of Life OS) | Standard Google backup |
| **GitHub** | `tymenvds-bit/life-os-tvds` | Code versioning only (no user data) | Every commit recoverable |

**Backup strategy**: Google Sheets IS the backup. Every write goes to Sheets via Apps Script. localStorage is just a fast cache.

**Migration path** (if rebuilding the app):
- Google Sheets data is universally readable — export to CSV/Excel/JSON anytime
- Apps Script API (`?action=read&sheet=Todos`) returns all data as JSON
- Any new app (React, Flutter, native) can connect to the same Sheets backend with zero data migration
- Google Calendar events are independent — always accessible via Google Calendar API
- **Data is never locked in** — the architecture was deliberately chosen for portability

**Device setup**: Each new device needs API URLs + Anthropic key entered in Settings. Data syncs automatically from Sheets on first load.

## Tijmen's Voice Profile (for AI Journal Writing)

Source: `Tijmen_Voice_Style_Profile.docx` — extracted from 200+ conversations.

**Core voice**: Young Afrikaans CEO (born 1997) who grew up with spanners in his hands and spreadsheets on his screen. Writes like he's talking to himself at 21:00 after a long day — direct, sometimes tired, always thinking, never pretentious.

**Language**: English with natural Afrikaans woven in. Afrikaans increases for emotional/personal/family topics. Common insertions: "dis", "maar", "net", "moeg", "ek weet nie", "ja-nee", "nee wat".

**Sentence style**: Short, punchy, stacked declaratives. Dashes for mid-thought breaks. One-word sentences for emphasis ("Done.", "Finally.", "Disaster."). No long compound sentences, no hedging, no passive voice, almost no exclamation marks.

**Emotional register**: Emotions show through facts and framing, not by naming feelings. Stress = lists and numbers. Frustration = blunt short sentences. Satisfaction = understated results. Love = brief and private. Faith = woven in, not performed. Humour = dry, self-deprecating, situational. **Never swears in writing** — frustration shows through bluntness, not profanity.

**Vocabulary**: Practical and specific. Uses: cashflow, GM, breakeven, overdraft, CTC, retrench. Amounts in ZAR (R1.6M). Metric units (km/L, bar, °C). SA date format (17 March 2026). People by first name.

**Never uses**: "synergise", "leverage", "circle back", "deep dive", "beautiful", "incredible", "holding space", "my inner child", therapy-speak, corporate jargon, flowery language, passive voice, motivational platitudes.

**Thinking patterns**: Munger inversion, first principles, quantification, systems thinking, cost-benefit framing, Reformed theology lens.

## Future Development Roadmap

### 1. Meal Planning & Kitchen AI (New Module)
**Context**: Tijmen cooks for 2 at home and handles all meal planning and groceries.

**Vision**: Turn HomeInventory into a smart kitchen system:
- **Pantry tracker** — categorize inventory into pantry staples, spices, fridge, freezer, fresh produce. Track quantities and expiry dates.
- **AI recipe suggestions** — "What can I cook tonight?" sends pantry/spice inventory to Claude, gets recipes using what's on hand. Suggest meals that use ingredients nearing expiry first.
- **Monthly meal planner** — AI generates a 4-week meal plan for 2 people, balanced nutrition, considers what's already in the pantry. Calendar integration for meal schedule.
- **Auto grocery list** — from the meal plan, subtract what's in pantry, generate a shopping list grouped by store aisle. Track favourite stores/prices (Checkers, Woolworths, etc.)
- **Recipe library** — save favourite recipes with ingredients, steps, prep time. Tag by cuisine, difficulty, weeknight vs weekend.
- **"I just shopped"** capture mode — scan/photograph a till slip or dictate what was bought to update pantry inventory in bulk.

**Household Profiles & Dietary Biases** (stored in Settings or a `HouseholdProfiles` sheet):
- **Tijmen**: Loves onions, loves sauces/gravies, adventurous eater, no specific restrictions.
- **Wife**: Tolerates onions in moderation (not raw/overbearing), prioritises iron and Vitamin B intake, avoids calorie creep (gym-conscious — no heavy cream sauces, cheese-laden dishes), prefers lighter/cleaner meals.
- **Shared rules**: Cook for 2. Meals must work for both unless tagged as individual. Balance across the week — if Tijmen gets a rich sauce night, wife gets a lighter option or the dish is adapted (sauce on the side, lighter sauce base, etc.)
- **Meal log** — track what was actually cooked/eaten. AI learns preferences over time: "You haven't had red meat in 8 days" or "Wife's iron sources this week: 2 spinach dishes, 1 lentil". Avoids repetition — don't suggest chicken stir-fry 3x in a week.
- **Adaptation strategies**: AI can suggest base dish + variations (e.g. "Beef stir-fry: Tijmen's bowl gets oyster sauce, wife's gets a light soy-ginger drizzle"). One cook, two happy people.
- **Nutritional awareness**: Flag iron-rich ingredients (red meat, spinach, lentils, chickpeas), B-vitamin sources (eggs, whole grains, leafy greens), and build meal plans that hit targets without supplements.

**Sheet**: Expand `HomeInventory` or add `Pantry`, `Recipes`, `MealPlan`, `MealLog`, `HouseholdProfiles` sheets.

### 2. Compliance Calendar & Team Visibility
**Context**: Tijmen has an Excel sheet with all Prima Joinery compliance dates — VAT submissions, fire extinguisher services, vehicle licences, insurance renewals, COIDA, UIF, etc. He oversees and actions many of these personally. Team currently uses ClickUp but it's not working — too much friction, items get lost.

**Data source**: Existing Excel spreadsheet with ~200+ compliance items, each with:
- What (description)
- Frequency (monthly, quarterly, annual, once-off)
- Due date / recurring schedule
- Responsible person
- Status (done/pending/overdue)

**Vision**:
- **Import from Excel** — one-time bulk import of compliance items into a `Compliance` sheet
- **Recurring auto-generation** — system auto-creates next occurrence when current one is completed (e.g. VAT submission done → next one due in 2 months)
- **Dashboard widget** — "Compliance due this week/month" with red/amber/green status
- **Team view** — lightweight shared URL (read-only or with action buttons) so team members see what's due without needing ClickUp. Could be a separate simple page that reads from the same Google Sheet.
- **Notifications** — items approaching due date surface in daily focus. Overdue items escalate to urgent.
- **Categories**: Tax (VAT, PAYE, UIF, SDL), Insurance (vehicle, building, liability), Safety (fire extinguishers, COC), Licences (vehicle, trade), HR (contracts, COIDA), Other.

### 3. ClickUp Migration & List Consolidation
**Problem**: ~200+ items on ClickUp across to-do lists and wish lists. Nobody looks at it. Items accumulate and die.

**Root cause analysis** (why long lists fail):
1. **No triage** — everything has equal visual weight. Item #1 and item #187 look the same.
2. **No surfacing** — out of sight, out of mind. If you don't open ClickUp daily, items are invisible.
3. **Decision fatigue** — scanning 200 items to find what to do next is exhausting. Brain shuts down.
4. **No accountability loop** — no system asks "did you do this?" or "is this still relevant?"
5. **Wrong tool** — ClickUp is built for teams with project managers. Solo CEO needs a personal command centre, not a project management suite.

**Migration strategy**:
- Export ClickUp data (CSV/JSON)
- AI categorises each item: active task vs someday/maybe vs dead (obsolete, already done, no longer relevant)
- Active tasks get imported into Life OS Todos with proper categories, priorities, due dates
- Someday/maybe items go into a separate "Backlog" or "Ideas" sheet — reviewed monthly
- Dead items get archived or deleted
- ClickUp gets retired (or kept for team-specific project tracking only)

**The 200-item solution** (applies to both ClickUp and compliance):
- Items live in the system but are NOT all visible at once
- AI surfaces only what matters TODAY (3-5 focus items)
- Weekly review surfaces what matters THIS WEEK
- Monthly review catches everything else
- "Stale item" alerts force decisions on forgotten items
- The human never has to scroll a 200-item list again

### 4. Voice & Image Capture
**Context**: Tijmen is often driving or at a fuel pump — can't type. Needs hands-free and camera-based input.

**Voice capture**:
- Button in Universal Capture that uses browser `SpeechRecognition` API (Web Speech API)
- Tap mic → speak → voice-to-text fills the capture textarea → then Process Everything as normal
- Works on Chrome mobile (Android + iOS Safari 14.5+)
- Fallback: if SpeechRecognition unavailable, show "not supported" toast
- No external API needed — browser handles speech-to-text natively

**Image capture (fuel slips, odometer, receipts)**:
- Camera button in Universal Capture that opens phone camera or file picker
- Image is sent to Claude Vision API (claude-sonnet with image support) for OCR/extraction
- **Fuel slip photo** → AI extracts: litres, cost per litre, total, station name, date
- **Odometer photo** → AI extracts: reading, and if licence plate visible, auto-matches to GQ or GU Patrol
- **Receipt photo** → AI extracts line items, total, store — routes to relevant module
- **Till slip from shopping** → updates pantry inventory (future meal planning feature)
- Images are NOT stored (privacy) — only the extracted data is saved
- Uses Claude API with `type: "image"` content block in the messages array
- Max image size: resize to 1024px before sending to keep API costs low

**Implementation notes**:
- `navigator.mediaDevices.getUserMedia` or `<input type="file" accept="image/*" capture="environment">` for camera access
- Convert image to base64, send to Claude with extraction prompt
- Parse JSON response same as text capture → buildPreview → Save All

### 5. Vehicle Module Corrections
**Current issues to fix**:
- Review and correct GQ_Patrol and GU_Patrol data structure
- Verify fuel consumption calculations (km/L)
- Service/repair log may need additional fields (workshop, invoice, warranty)
- Odometer tracking and trip logging
- Service interval reminders (next service due at X km or Y date)

### 6. Smart Task Management (Productivity Science)
**Problem**: 100+ tasks, limited hours in a day. Items get lost, nothing feels front-of-mind, overwhelm leads to paralysis.

**Principles to implement** (based on GTD, Eisenhower, time-boxing, cognitive load research):

- **Daily Focus List** — each morning (or night before), AI selects the 3-5 tasks that matter most today based on: urgency, due date, dependencies, energy level, available time. Everything else is "backlog" — visible but not screaming at you.
- **Eisenhower auto-sort** — AI categorizes tasks into: Do Now (urgent+important), Schedule (important, not urgent), Delegate (urgent, not important), Eliminate (neither). Surface only "Do Now" and "Schedule" on the dashboard.
- **Weekly Review prompt** — every Sunday, AI walks you through: What got done? What's overdue? What should be dropped/delegated? What's the #1 priority this week? Generates a weekly plan.
- **Task aging & decay** — tasks untouched for 14+ days get flagged: "Still relevant?" Force a decision: reschedule, delegate, or delete. Prevents the 100-item graveyard.
- **Context batching** — group tasks by context (calls, emails, factory, office, home) so you can batch similar work. "I have 30 min and a phone" → show all call tasks.
- **Energy matching** — tag tasks by energy required (high/medium/low). Morning = high energy tasks. Post-lunch = low energy admin. AI suggests based on time of day.
- **Progress momentum** — show streak/completion stats. "You completed 4/5 focus tasks today." Dopamine feedback loop.
- **"What should I do next?"** button — AI considers: time available, energy level (based on time of day), pending deadlines, context. Returns the single best next action.

### 7. Dashboard Redesign
**Current**: Basic snapshot with urgent count, open count, time logged, journal status.

**Vision**: A real command centre:
- **Today's Focus** — AI-curated 3-5 tasks (not the full list)
- **Time accountability** — hours logged vs hours available, category split
- **Upcoming deadlines** — tasks due this week, colour-coded by urgency
- **Waiting-on list** — tasks in "waiting" status with who you're waiting on and how long
- **Quick wins** — tasks estimated <15min that you can knock out between meetings
- **Weekly momentum** — completion rate trend, streak counter
- **Calendar preview** — next 3 events today

### 8. Spiritual Tracker (New Module)
**Context**: Tijmen encounters Bible verses, words, and prophecies that resonate and wants to document and track them over time.

**Vision**:
- **Verse log** — save a verse with reference (e.g. Psalm 23:1), date encountered, context (sermon, devotion, conversation, spontaneous)
- **Prophecies & words received** — date, who gave it, what was said, personal notes/interpretation
- **Tags** — theme tags (faith, provision, guidance, healing, calling, family, business) for cross-referencing
- **Reflection notes** — revisit entries and add how they played out or deepened over time
- **AI connection** — "Show me verses about provision" or "What themes keep recurring in my spiritual journal?"
- **Daily verse surfacing** — optionally show a past entry on the dashboard as a reminder

**Sheet**: `Spiritual` — columns: id, date, type (verse|word|prophecy|reflection), reference, body, source, tags, reflection, createdAt

### 9. Philosophy & Quotes Tracker (New Module)
**Context**: Tijmen collects quotes, philosophical insights, and interesting life observations.

**Vision**:
- **Quote capture** — quote text, author/source, date found, personal reflection on why it resonates
- **Book tracker** — title, author, format (Audible/physical/Kindle), status (reading/finished/abandoned), start/finish dates, rating, key takeaways
- **Reading log** — track what's being read/listened to, notes per chapter or section
- **Tags** — stoicism, business, leadership, relationships, mindset, etc.
- **AI insights** — "What themes keep appearing in my reading?" or surface a random past quote for reflection
- **Dashboard widget** — "Currently reading: [book]" + random quote of the day

**Sheets**: `Quotes` (id, quote, author, source, tags, reflection, createdAt), `Books` (id, title, author, format, status, startDate, endDate, rating, takeaways, tags)

### 10. AI Usage & Cost Tracking
**Context**: Tijmen is heavily invested in AI across multiple platforms and wants visibility into spend and usage patterns.

**Automatic (Life OS API)**:
- Modify `claude()` function to capture `usage.input_tokens` and `usage.output_tokens` from every API response
- Store per-call data: date, tokens_in, tokens_out, cost_usd, action (capture/bulk_parse/breakdown)
- Pricing reference: Sonnet input $3/MTok, output $15/MTok
- Dashboard widget: today's calls, this week's cost, running total, daily trend

**Manual (monthly AI budget)**:
- Simple subscription tracker: Claude Pro (~$20), Claude API (variable), Copilot ($10), etc.
- Monthly total AI spend with trend over time
- Alert if API spend approaches a user-set threshold

**Limitation**: No API exists to pull usage from Claude.ai subscription, Claude Code, or third-party integrations. Only Life OS API calls can be tracked automatically.

**Sheet**: `AIUsage` (id, date, action, tokens_in, tokens_out, cost_usd, model)

### 11. Decision Tracker
**Context**: Tijmen makes significant business and personal decisions regularly. Tracking them helps with accountability, learning from outcomes, and building a personal decision-making playbook.

**Vision**:
- **Decision log** — what was decided, date, context, options considered, reasoning, expected outcome
- **Outcome tracking** — revisit decisions after 30/90 days: what actually happened? Was it the right call?
- **AI patterns** — "What decisions have you made about staffing?" or "Show me decisions where the outcome differed from expectation"
- **Decision frameworks** — tag by method used (gut feel, data-driven, advice-based, Munger inversion, cost-benefit)
- **Linked to tasks** — decisions often generate tasks; link them so you can trace why something was started
- **Dashboard widget** — "Decisions pending review" (outcomes not yet recorded)

**Sheet**: `Decisions` (id, date, title, context, options, decision, reasoning, framework, expectedOutcome, actualOutcome, reviewDate, status, linkedTasks, tags)

### 12. Known Bugs / Tech Debt
- CORS on POST: works with `text/plain` workaround; monitor for regression
- Service worker cache: must bump version in `sw.js` on every deploy; users need hard refresh
- Duplicate items: double-clicking Save All can create duplicates (disable button during save)
- Time blocks from capture don't appear if CORS fails (saved to localStorage, lost on refresh when Sheets overwrites)
- Journal duplicate entries from double-click
