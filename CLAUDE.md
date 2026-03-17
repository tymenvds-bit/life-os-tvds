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

**Sheet**: Expand `HomeInventory` or add `Pantry`, `Recipes`, `MealPlan` sheets.

### 2. Vehicle Module Corrections
**Current issues to fix**:
- Review and correct GQ_Patrol and GU_Patrol data structure
- Verify fuel consumption calculations (km/L)
- Service/repair log may need additional fields (workshop, invoice, warranty)
- Odometer tracking and trip logging
- Service interval reminders (next service due at X km or Y date)

### 3. Smart Task Management (Productivity Science)
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

### 4. Dashboard Redesign
**Current**: Basic snapshot with urgent count, open count, time logged, journal status.

**Vision**: A real command centre:
- **Today's Focus** — AI-curated 3-5 tasks (not the full list)
- **Time accountability** — hours logged vs hours available, category split
- **Upcoming deadlines** — tasks due this week, colour-coded by urgency
- **Waiting-on list** — tasks in "waiting" status with who you're waiting on and how long
- **Quick wins** — tasks estimated <15min that you can knock out between meetings
- **Weekly momentum** — completion rate trend, streak counter
- **Calendar preview** — next 3 events today

### 5. Known Bugs / Tech Debt
- CORS on POST: works with `text/plain` workaround; monitor for regression
- Service worker cache: must bump version in `sw.js` on every deploy; users need hard refresh
- Duplicate items: double-clicking Save All can create duplicates (disable button during save)
- Time blocks from capture don't appear if CORS fails (saved to localStorage, lost on refresh when Sheets overwrites)
- Journal duplicate entries from double-click
