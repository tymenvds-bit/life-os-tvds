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
- Gold accent colour (`#c9a84c`)

## Modules

| Tab | Sheet(s) | Description |
|-----|----------|-------------|
| Dashboard | — | Command centre: 3-column grid with Today's Board (pinnable AI-picked tasks), Schedule Today, Priority Tasks, Overdue list, Time accountability, Vehicle Services Due widget, Status (waiting/in-progress), Stale task alerts. Default landing tab. |
| Capture | — | AI-powered input: Universal Capture (standard/eod/whatsapp/fuel modes), Email Briefing, Quick Add Task, 📷 Scan Slip (Claude Vision OCR) |
| Tasks | Todos | Task manager with statuses (open/in-progress/waiting/done), progress logs, priorities, categories, due dates, overdue tracking, AI breakdown, "What should I do next?" AI button |
| Notes | Notes | Freeform notes with categories, tags, detail view with edit/delete |
| Time | Time | Time tracking with live timer, manual entry, AI bulk parse; duration-based blocks from capture; date navigation (◀/▶/Today); Screen Time-style stats (day/week/month with stacked category bars and breakdown) |
| Journal | Journal | Daily journal with mood tracking (1-5), sidebar list, detail view |
| Calendar | Google Calendar API | Live events from Google Calendar; create via capture or Quick Event |
| Vehicles | Vehicles, FuelLogs, ServiceLogs, ServiceReminders, VehicleExpenses, VehicleComparisons, VehicleChecks, VehicleTodos | Full fleet manager with 7 sub-tabs: Dashboard, Fuel, Services, Costs, Economics, Checks, Todos. See Vehicle Module section below. |
| Inventory | HomeInventory, PrimaStock | Combined tab with two sub-tabs: Home (household items) and Prima Stock (business inventory). Switching via `setInvTab()`. |

## Deployment

- **Frontend**: Push to `main` → GitHub Actions auto-deploys to GitHub Pages (also auto-bumps sw.js cache version using git SHA)
- **Backend**: `clasp push && clasp deploy -i "AKfycbx17_C_TeXc5uww26GivAnJffT6GPWzqjInJ_BWn0D5qZV0NlOkIxFn2yT_eO73v1HdAw" -d "description"` (requires `export PATH="/c/Program Files/nodejs:/c/Users/tymen/AppData/Roaming/npm:$PATH"` in terminal)
- **Live at**: https://tymenvds-bit.github.io/life-os-tvds/
- **clasp config**: `backend/.clasp.json` → Script ID `1GkDp58EbeexoyBZIO0eKNIzSQY_b2gv3GGDgi1ibrXSfhFNI2SkFeSjy`
- **API URL**: `https://script.google.com/macros/s/AKfycbx17_C_TeXc5uww26GivAnJffT6GPWzqjInJ_BWn0D5qZV0NlOkIxFn2yT_eO73v1HdAw/exec`
- **AI model**: `claude-sonnet-4-20250514` (used for both text and vision calls)

## Rules

- Keep the single-file structure (`index.html`). Do not split into multiple files.
- No frameworks (React, Vue, etc.). No build tools (Webpack, Vite, etc.).
- No npm dependencies. Everything is vanilla.
- All data persists to localStorage first, then syncs to Google Sheets.
- Escape all user input with `esc()` before rendering as HTML.
- Test changes by opening `index.html` directly in a browser or via GitHub Pages.
- **After every significant change:** update this file (CLAUDE.md) AND `DEVLOG.md` to reflect new modules, functions, API actions, or architecture changes. CLAUDE.md must always match the current state of the codebase. DEVLOG.md must capture the WHY — decisions made, bugs found, lessons learned.
- **After every session:** append a session summary to `DEVLOG.md` with: what was built, key decisions, bugs hit, lessons learned.
- **Keep the in-app HELP object** (in index.html) in sync with CLAUDE.md. When features change, update help text.
- **Deploy backend automatically:** run `clasp push && clasp deploy -i "AKfycbx17_C_TeXc5uww26GivAnJffT6GPWzqjInJ_BWn0D5qZV0NlOkIxFn2yT_eO73v1HdAw" -d "description"` after any api.gs change. Requires `export PATH="/c/Program Files/nodejs:/c/Users/tymen/AppData/Roaming/npm:$PATH"` in terminal.

## Deployment & Persistence Checklist

**CRITICAL: Every change that adds/modifies Google Sheets schemas requires ALL steps:**

1. **Push to GitHub** → `git add . && git commit && git push` → GitHub Actions deploys frontend + auto-bumps sw.js
2. **Deploy backend** → run `clasp push && clasp deploy -i "AKfycbx17..." -d "description"` from `backend/` directory
3. **Hard refresh** → `Ctrl+Shift+R` (PC) / `Cmd+Shift+R` (Mac)

**If step 2 is skipped:** Frontend health check will toast: "⚠️ Backend outdated — missing: [sheets]. Redeploy api.gs!" GitHub Actions also shows a warning annotation when api.gs is modified.

**Persistence test after every deploy:**
1. Add a test item (expense, fuel log, todo, etc.)
2. Hard refresh the page
3. ✅ Item should still be there
4. Check browser console for `✅ apiPost` or `⚠️ Sync failed` messages
5. Can also verify via API: `curl "API_URL?action=read&sheet=SheetName"`

**Automated safeguards:**
- `sw.js` version auto-bumped by GitHub Actions (git SHA) — no manual bumps needed
- `checkBackendHealth()` runs on startup — pings backend, compares `schemaKeys` against `EXPECTED_SHEETS`, toasts warning if mismatch
- GitHub Actions warns when `backend/api.gs` changes detected in push

## Continuous Improvement

- **Workflow optimisation**: Continuously evaluate if development, deployment, and data workflows can be improved. If a manual step is repeated more than twice, automate it.
- **App workflow optimisation**: Continuously evaluate if the user's daily workflow in the app can be streamlined. Reduce clicks, surface important data proactively, eliminate friction.
- **After every session**: Review what went well, what caused friction, and whether CLAUDE.md and DEVLOG.md need updating.
- **Documentation audit**: On every feature change, verify: (1) CLAUDE.md reflects the current state, (2) DEVLOG.md captures the decision/lesson, (3) In-app HELP object is accurate, (4) No redundant/dead features remain.
- **Help system**: In-app `?` button shows context-sensitive help per tab. Content defined in the `HELP` object in index.html. Must stay in sync with CLAUDE.md.

## Capacity Monitoring

**CHECK EVERY SESSION — update the numbers below and plan ahead when approaching limits.**

| Resource | Current (Mar 2026) | Warning | Hard Limit | Action at Warning |
|----------|-------------------|---------|------------|-------------------|
| `index.html` lines | ~5,000 | 7,000 | 10,000 | Split into modules: `app.js` (core), `vehicles.js`, `dashboard.js` — still vanilla, separate `<script>` tags |
| `index.html` size (KB) | ~320 KB | 800 KB | 5 MB | Same split strategy. Minify stable code. |
| Google Sheets (total) | 22 | 40 | 200 (per spreadsheet) | Group related sheets. Consider a second spreadsheet for archive data. |
| Rows per sheet (largest) | ~100 (FuelLogs) | 5,000 | 10,000,000 | Archive old data to a yearly sheet (e.g. FuelLogs_2025). |
| localStorage usage | ~50 KB | 3 MB | 5-10 MB | Prune stale cache. Only cache recent 30 days of time/fuel data. |
| Apps Script daily execution | ~30 calls/day | 10,000 | 20,000 | Batch reads. Cache aggressively. |
| AI context (editing ability) | ~5,000 lines | 7,000 lines | ~10,000 lines | Split files. Use agents for isolated edits. |
| Service worker cache | ~10 assets | 50 assets | Browser-dependent | Only cache critical assets. |

**Split strategy when we hit 7,000 lines:**
1. Extract vehicle module JS → `vehicles.js` (~2,500 lines)
2. Extract dashboard JS → `dashboard.js` (~500 lines)
3. Keep core (API, utils, capture, tasks, notes, time, journal, calendar, inventory) in `index.html`
4. Load via `<script src="vehicles.js"></script>` etc. — no build step needed
5. Service worker caches the new files
6. All functions remain global — no module system needed

**How to check current size:**
```bash
wc -l index.html  # Lines
wc -c index.html  # Bytes
```

## Project Files

| File | Purpose | Update frequency |
|------|---------|-----------------|
| `CLAUDE.md` | Source of truth for current app state, architecture, functions, schemas | Every feature change |
| `DEVLOG.md` | Development journal — decisions, bugs, lessons, session summaries | Every session |
| `index.html` | All frontend code (single-file PWA) | Every code change |
| `backend/api.gs` | Google Apps Script backend — API actions, schemas | When schemas/API change |
| `sw.js` | Service worker — auto-versioned by GitHub Actions | Auto (no manual edits) |
| `.github/workflows/deploy.yml` | CI/CD — deploys to GitHub Pages, bumps SW version, warns on api.gs changes | Rarely |
| `backend/.clasp.json` | clasp config linking to Apps Script project | Never (set once) |

## Key Functions

**Core / API:**
- `apiFetch(sheet)` / `apiPost(action, sheet, data)` — Google Sheets API calls (with localStorage cache + error toasts)
- `calFetch(days)` / `calCreate(ev)` — Google Calendar API (via Apps Script)
- `claude(prompt, system, max)` — Claude API call (model: `claude-sonnet-4-20250514`)
- `claudeVision(base64, mediaType, prompt, system, max)` — Claude Vision API (image + text)
- `loadAll()` — fetches 16 sheets from API + normalizes dates; loads calendar events
- `renderAll()` calls: `renderTodos()`, `renderNotes()`, `renderJournalSidebar()`, `renderTimeLog()`, `renderCalendar()`, `renderInventory()`, `renderVehicles()`, `renderDashboard()`, `updateStats()`
- `checkBackendHealth()` — pings backend, compares schema keys, toasts warning if api.gs is outdated
- `initApp()` — app initialization: theme, loadAll, renderAll, service worker, notifications, health check

**Capture & AI:**
- `capture(mode)` — AI-powered natural language capture (modes: `standard`, `eod`, `whatsapp`, `fuel`)
- `buildPreview(parsed)` / `collectPreviewEdits()` / `removePreviewItem(section, index)` — preview system
- `commitCapture()` — saves all captured items; routes to task_updates, todos, notes, time, journal, fuel, calendar
- `emailFetch(max)` / `emailBriefing()` / `emailToTask(title)` — email triage system
- `quickAdd()` — quick task add from Capture tab
- `aiNextTask()` — "What should I do next?" AI recommendation

**Dashboard:**
- `renderDashboard()` — 3-column grid: Today's Board, Schedule, Priority Tasks, Overdue, Time, Vehicle Services Due, Status, Stale
- `loadTodayBoard()` / `commitToday(id)` / `uncommitToday(id)` / `isOnBoard(id)` / `boardToggle(id)` — Today's Board management (persists to Sheets via `TodayBoard` localStorage key)
- `dashToggle(id)` — toggle task done from dashboard
- `renderSuggestions()` — AI suggestions panel

**Tasks:**
- `cycleStatus(id)` / `setTaskStatus(id, status)` / `toggleTodo(id)` — task status management
- `addProgress(id)` — add timestamped progress note
- `getStatus(t)` / `isOverdue(t)` / `isStale(t)` — status helpers
- `deleteTodo(id)` / `expandTodo(id)` / `updateDue(id, newDue)` — task CRUD

**Vehicle Module (full fleet manager):**
- `getVehicle(id)` / `getVehicleFuel(vid)` / `getVehicleServices(vid)` / `getVehicleReminders(vid)` / `getVehicleExpenses(vid)` / `getVehicleComparisons(vid)` / `getVehicleChecks(vid,type)` / `getVehicleTodos(vid)` — data getters
- `selectVehicle(id)` / `setVehSub(sub, btn)` — UI navigation (7 sub-tabs)
- `openVehicleForm(editId)` / `saveVehicle(editId)` / `deleteVehicle(id)` — vehicle CRUD
- `addFuelLog()` / `delFuelLog(id)` — fuel entry with auto km/L, cost/km, distance calc
- `addServiceLog()` / `delServiceLog(id)` — service log CRUD
- `addServiceReminder()` / `delReminder(id)` / `completeReminder(remId)` — reminders with auto-advance
- `checkServiceReminders(vid)` — returns reminders with urgency (red/amber/green), km/days remaining
- `syncReminderToCalendar(remId)` — creates Google Calendar event for reminder due date
- `addExpense()` / `editExpense(id)` / `updateExpense()` / `cancelEditExpense()` / `delExpense(id)` — expense CRUD with recurring support
- `addVehicleCheck(type)` / `delVehicleCheck(id)` — battery SOH/voltage, tyre tread depth logging
- `addVehicleTodo()` / `toggleVehicleTodo(id)` / `delVehicleTodo(id)` — per-vehicle checklists
- `calcVehicleStats(vid)` — comprehensive TCO: avgKmL, costPerKm, annualCost, expense breakdown by category
- `calcRecurringCosts(vid)` — expands recurring expenses (monthly/quarterly/annual) to actual period totals
- `getMaintenanceTrend(vid)` — linear regression on historical maintenance for future projection
- `runReplacementAnalysis(vehicleId)` — AI-driven 10-year TCO keep vs replace analysis
- `aiSuggestComparisons()` — AI generates 3 comparison vehicles (comparable, practical, economical)
- `exportVehicleData(vid)` — CSV export of all vehicle data
- `importFuellyCSV()` / `importServicesCSV()` — bulk CSV import
- `scanReceipt()` / `scanOdometer()` / `openReceiptScanner()` / `openOdoScanner()` — Claude Vision OCR
- `renderVehicleDash()` / `renderFuelSub()` / `renderServicesSub()` / `renderCostsSub()` / `renderEconomicsSub()` / `renderChecksSub()` / `renderVehicleTodosSub()` — sub-tab renderers
- `renderEconomicsReport(res, keepName, stats)` — multi-vehicle comparison chart + year-by-year table
- `formatR(n)` / `formatRd(n)` — ZAR currency formatting

**Notifications:**
- `checkServiceNotifications()` — browser push notification for overdue vehicle services (once per day)

**Utilities:**
- `esc(s)` — HTML-escape (XSS prevention)
- `uid()` — generate unique IDs
- `toast(msg, duration)` — show notification
- `normalizeDate(d)` — convert any date format to YYYY-MM-DD
- `niso()` — current ISO timestamp
- `fmtDate(d)` / `fmtTime(d)` / `fmtDur(m)` — date/time formatters
- `applyTheme()` / `isDaylight()` — auto light/dark theme (Pretoria sunrise/sunset)
- `switchTab(tab)` — tab switching with lazy init
- `setSyncBadge(state)` — sync status badge (synced/pending/offline)

## Backend API Actions (api.gs)

| Action | Method | Description |
|--------|--------|-------------|
| `read` | GET | Read rows from a sheet |
| `ping` | GET | Health check — returns `{ok, timestamp, schemaKeys}` for frontend version checking |
| `calendar` | GET | List Google Calendar events (`?days=14`) |
| `emails` | GET | List unread Gmail messages (`?max=50`). Uses `GmailApp.search('is:unread in:inbox')`. Returns threadId, from, subject, snippet, date, labels, messageCount. |
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

**All Google Sheets (16 active):**
Todos, Notes, Time, Journal, Vehicles, FuelLogs, ServiceLogs, ServiceReminders, VehicleExpenses, VehicleComparisons, VehicleChecks, VehicleTodos, HomeInventory, PrimaStock + legacy: GQ_Patrol, GU_Patrol (vestigial, still loaded but not actively used)

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
- **Pantry tracker** — categorise inventory into pantry staples, spices, fridge, freezer, fresh produce. Track quantities and expiry dates.
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

### 5. Vehicle Fleet Manager (Full Rebuild)
**Context**: Vehicle data is fragmented across Fuelly (fuel logs), Excel (maintenance/cost tracking), Apple Notes (to-do checklists), and phone photos (receipts, odo readings, battery tests). No single source of truth. The fleet covers 6+ personal vehicles with future expansion to Prima Joinery fleet (~8 vehicles + trailers).

**Decision: Build within Life OS** (not standalone app). Reasons:
- Life OS exists to consolidate everything into one place — a separate app defeats the purpose
- Google Sheets backend handles the data model fine (flatten relational tables into sheets)
- Claude Vision OCR works the same regardless of stack — just an API call from the browser
- Life OS already has capture flow, API layer, service worker, theme system
- No new infrastructure needed (no Supabase, no Vercel, no separate auth)
- The standalone spec (PATROL_FLEET_MANAGER_SPEC.md) has excellent data modelling and Claude Vision prompts — adopted as reference

**Previous reference docs** (in Downloads, for data/prompts only):
- `PATROL_FLEET_MANAGER_SPEC.md` — 420-line standalone spec (Next.js + Supabase), contains detailed PostgreSQL schema, Claude Vision OCR prompts, service reminder defaults, seed data, MoSCoW features
- `PatrolFleetManager.jsx` — 549-line React prototype with dashboard, fuel history, service reminders, cost breakdown, receipt scanning flow mockup
- `Red Patrol.xlsx` — existing Excel tracker with R163,819 total spend, 85 rows × 97 columns, parts inventory with Nissan part numbers

**Vehicles to support**:
| Name | Year | Engine | Reg | Purchase ODO | Purchase Price |
|------|------|--------|-----|-------------|----------------|
| Red GQ TB42 | 1993 | TB42 4.2L Petrol | CFV 428 GP | 178,400 | R120,000 |
| GQ TD42T | 1997 | TD42T Turbo Diesel | — | — | — |
| Datsun Safari | — | — | — | — | — |
| KTM 500 XC-W | 2014 | 510cc Single | — | — | — |
| Chev Bakkie | — | — | — | — | — |
| Sym Orbit 2 (Elizabeth) | — | — | — | — | — |

**Red GQ TB42 existing data summary**:
- Current ODO: 209,570 (14 Mar 2026 service)
- Fuel: 66 entries via Fuelly, 6,021L total, R131,462 fuel cost, avg 5.2 km/L
- Maintenance: R92,019 (Excel), TCO: R334,971, R/km: R12.68
- Insurance: R13,757 total, Licence: R3,790 total
- Battery (17 Aug 2025): SOH 58%, SOC 11%, 12.07V — needs replacement
- Tyres (17 Aug 2025): LF 8.8mm, RF 9.5mm, LR 7.7mm, RR 8.0mm
- ~20 open to-do items, ~50+ completed since purchase

**Google Sheets data model** (one sheet per data type):

`Vehicles` — id, name, make, model, variant, year, engine, fuelType, regNumber, vin, purchaseDate, purchaseOdo, purchasePrice, tankCapacityL, currentOdo, isActive, category (personal/family/fleet), notes, createdAt, expectedLifeKm, expectedLifeYears, annualKmEstimate

`FuelLogs` — id, vehicleId, date, odometer, litres, totalCost, pricePerL, kmPerL (calc), costPerKm (calc), distanceKm (calc), fuelType, station, cityPct, isFullTank, isMissed, paymentMethod, notes, createdAt

`ServiceLogs` — id, vehicleId, date, odometer, totalCost, description, serviceType (routine/repair/inspection/bodywork), provider, parts, notes, createdAt

`ServiceReminders` — id, vehicleId, name, intervalKm, intervalMonths, lastServiceDate, lastServiceOdo, nextDueDate, nextDueOdo, isActive, createdAt

`VehicleExpenses` — id, vehicleId, date, category (insurance/licence/tracker/tyres/co-payment/parts/accessories/tolls/other), description, amount, frequency (once/monthly/quarterly/annual), endDate, supplier, notes, createdAt

`VehicleComparisons` — id, vehicleId, comparisonName, targetVehicle, purchasePrice, financeRate, financeTerm, expectedKmPerL, expectedMaintenancePerKm, insuranceAnnual, licenceAnnual, projectedKmPerYear, assumptions, results (JSON), lastRunDate, createdAt

`VehicleChecks` — id, vehicleId, date, odometer, checkType (battery/tyres/brakes/general), data (JSON string), notes, createdAt

`VehicleTodos` — id, vehicleId, category (maintenance/nice-to-have/in-car/sound/cosmetic), description, partNumber, isDone, completedDate, notes, sortOrder, createdAt

**Claude Vision OCR prompts** (from standalone spec, adapted):

Receipt scan:
```
You are a South African fuel receipt scanner. Extract ONLY valid JSON:
{"date":"YYYY-MM-DD","time":"HH:MM","station_name":"string","fuel_type":"string","litres":number,"price_per_litre":number,"total_cost":number,"payment_method":"string","confidence":"high/medium/low"}
Notes: Amounts in ZAR (R). Common stations: Engen, Shell, BP, Caltex, Total, Sasol. Fuel types: Unleaded 93/95, Diesel 50ppm/500ppm. Price/L typically R20-R28 (2024-2026). Use null for unknown fields.
```

Odometer scan:
```
Read the odometer from this vehicle dashboard photo. Return ONLY valid JSON:
{"odometer":number,"confidence":"high/medium/low"}
Odometer shows kilometres. Typically 6 digits.
```

**Service reminder defaults (TB42)**:
| Item | Interval km | Interval months | Last Done ODO |
|------|-------------|-----------------|---------------|
| Engine Oil + Filter | 7,500 | 6 | 209,570 |
| Air Filter | 7,500 | 6 | 209,570 |
| Fuel Filter | 7,500 | 6 | 209,570 |
| Spark Plugs | 15,000 | 12 | 209,570 |
| Tyre Rotation | 10,000 | — | 209,570 |
| Brake Fluid | 30,000 | 24 | ~199,246 |
| Gearbox Oil | 40,000 | — | ~178,500 |
| Transfer Case Oil | 40,000 | — | ~178,500 |
| Diff Oil | 40,000 | — | ~178,500 |
| Wheel Bearings | 50,000 | — | ~199,246 |

**UI design** (within Life OS Vehicles tab):
- Vehicle selector dropdown at top of tab
- Sub-navigation: Dashboard | Fuel | Services | Costs | Economics | Checks | Todos
- Dashboard: stat cards (avg km/L, last km/L, best km/L, fill-ups), efficiency trend chart (SVG polyline), service reminders with urgency badges (red <1000km, amber <3000km, green), recent activity feed
- Fuel: history list with km/L colour coding, cost per fill chart, photo scan button (camera → Claude Vision → confirm → save)
- Services: upcoming reminders + history list with provider/cost
- Costs: TCO summary, cost/km, breakdown bars (purchase/fuel/maintenance/insurance/licence)
- Checks: battery SOH/voltage history, tyre tread depth log
- Todos: per-vehicle checklist with categories, done/not-done toggle
- Fuel capture mode in Universal Capture: photo slip + odo + reg → auto-populate

**Phase 1 — MVP** ✅ COMPLETE:
- [x] Create Google Sheets: Vehicles, FuelLogs, ServiceLogs, ServiceReminders
- [x] Vehicle CRUD (add/edit vehicles in modal form)
- [x] Rebuild Vehicles tab with vehicle selector + 7-tab sub-nav
- [x] Vehicle dashboard with stat cards, SVG efficiency chart, service reminders, activity feed, life bar
- [x] Manual fuel log entry with auto km/L, cost/km, distance calculation
- [x] Fuel history list with colour-coded km/L
- [x] Service log CRUD
- [x] Service reminder engine (km + date based, red/amber/green urgency, auto-advance via completeReminder)
- [x] Backend: all vehicle sheet schemas in api.gs with auto-create

**Phase 2 — Vision & Import**:
- [x] Claude Vision receipt OCR (photo → extract → confirm → save) — `scanReceipt()`, `openReceiptScanner()`
- [x] Claude Vision odometer OCR — `scanOdometer()`, `openOdoScanner()`
- [x] Camera/file picker integration (`<input type="file" accept="image/*" capture="environment">`) — `resizeImageToBase64()` resizes to 1024px
- [x] Fuelly CSV import — `importFuellyCSV()` with dynamic header parsing
- [ ] Excel import (Red Patrol expense/service data)
- [x] Fuel capture mode in Universal Capture — fixed GQ/GU hardcode → dynamic `DB.vehicles`, AI prompt gets vehicle list
- [x] `claudeVision(base64, mediaType, prompt, system, max)` — Vision API function
- [x] 📷 Scan Receipt + 📷 ODO buttons in `renderFuelSub()` form
- [x] 📷 Scan Slip button in Capture tab
- [x] 📥 Import CSV button in fuel form header

**Phase 3 — Extended tracking** ✅ COMPLETE:
- [x] VehicleExpenses sheet + expense CRUD with edit, recurring costs (monthly/quarterly/annual), endDate support
- [x] VehicleChecks sheet (battery SOH/voltage/SOC, tyre tread depth 4-corner) + check log UI with trend charts
- [x] VehicleTodos sheet + per-vehicle checklist with categories, part numbers, filter tabs
- [x] Efficiency trend chart (SVG polyline with axis labels, average line, tooltips)
- [x] Cost breakdown visualization (category bars with percentages, monthly spend chart, recurring costs summary)
- [x] TCO comparison between vehicles (Economics sub-tab with multi-vehicle chart)

**Phase 4 — Polish** (partially complete):
- [ ] Licence renewal tracking (can use ServiceReminders with intervalMonths=12, intervalKm=0)
- [x] Insurance tracking + premium history (VehicleExpenses with category='insurance', YoY breakdown in Costs tab)
- [ ] Parts inventory with Nissan part numbers (VehicleTodos has partNumber field — needs dedicated import from Excel)
- [x] Export vehicle data to CSV — `exportVehicleData(vid)` with 📥 button on dashboard
- [x] Dashboard widget: "🔧 Vehicle Services Due" shows red/amber reminders across all vehicles
- [x] Push notification for overdue services — `checkServiceNotifications()` fires browser notification once per day
- [x] Calendar sync for reminders — 📅 button on each reminder creates Google Calendar event
- [x] Service reminder auto-advance — ✅ Complete button recalculates next due date/ODO

**Phase 5 — Replacement Economics Calculator** ✅ COMPLETE:
AI-driven 10-year TCO projection comparing current vehicle vs multiple alternatives.

**Keep-current projection** (per vehicle):
- Fuel: known km/L × projected annual km × fuel price trend (SA CPI-linked, ~5% p.a.)
- Maintenance: escalating curve based on actual data. Use vehicle's real maintenance history to model increasing costs with age/km. TB42 baseline: R92k over 31k km = R2.97/km, trending up as components age.
- Insurance: decreasing with vehicle value decline (known premium history)
- Licence: flat-ish, adjusted for inflation
- Resale value at exit: for classic 4x4s like GQ, floor price ~R80-120k (appreciating market). For depreciating vehicles, standard SA depreciation curve.
- Finance: R0 if paid off

**Replace-with-alternative projection**:
- User inputs: target vehicle, purchase price (or finance terms — SA prime rate + margin, term months), expected km/L, expected maintenance schedule
- Depreciation: new vehicle loses ~15-20% year 1, ~10%/year thereafter. Used vehicle depreciation varies.
- Finance cost: total interest over loan term (SA interest rates, currently ~11.75% prime)
- Insurance: higher on newer/more valuable vehicle
- Maintenance: lower initially (warranty 3-5 years), then escalating
- Resale value at year 10

**Crossover analysis**:
- Chart: two cumulative cost lines over 10 years (keep vs replace)
- Crossover point = when replacing becomes cheaper than keeping
- Factor in opportunity cost of capital (money spent on new vehicle could earn ~8-10% in SA money market)
- Annual summary table: Year 1-10 with running totals for both scenarios
- Net position: "Keeping the TB42 saves you R47,000 over 10 years" or "Replacing now saves R23,000 by year 6"

**AI enhancement**:
- Monthly auto-run using vehicle's real data (fuel logs, maintenance history, insurance records)
- Claude analyses the numbers and writes a plain-English recommendation in Tijmen's voice
- Surfaces on dashboard: "Vehicle Economics: TB42 is still R47k cheaper to keep over 10 years. Reassess when maintenance exceeds R4k/month."
- Alerts when crossover point is approaching: "TB42 maintenance costs are accelerating. Replacement becomes economical in ~14 months at current trajectory."
- Compares multiple alternatives simultaneously (e.g. TB42 vs new Hilux vs used Prado vs keep)

**SA-specific factors**:
- Interest rates (prime rate from SARB, updated periodically)
- Fuel price regulated by government (petrol vs diesel pricing)
- Import duties on vehicles (35%)
- Insurance market (SA-specific providers, premiums)
- Natis/eNatis licence fees
- Toll costs if applicable (e-toll, N-routes)

**Sheet**: `VehicleComparisons` — see schema above under "Google Sheets data model"

**Implemented functions**: All vehicle functions are listed in the Key Functions section above. The Economics sub-tab includes:
- `runReplacementAnalysis(vehicleId)` — sends vehicle data + comparison vehicles to Claude, returns 10-year projection
- `aiSuggestComparisons()` — AI generates 3 comparison vehicles (direct comparable, practical alternative, cheapest economical option)
- `renderEconomicsReport(res, keepName, stats)` — multi-line SVG chart (all alternatives with distinct colours), Y-axis grid, tooltips, colour legend, year-by-year table with "Cheapest" column
- `getMaintenanceTrend(vid)` — linear regression on historical maintenance spend to project future costs
- `addComparison()` / `delComparison(id)` / `editComparison(id)` — comparison vehicle CRUD

### 6. Smart Task Management (Productivity Science)
**Problem**: 100+ tasks, limited hours in a day. Items get lost, nothing feels front-of-mind, overwhelm leads to paralysis.

**Principles to implement** (based on GTD, Eisenhower, time-boxing, cognitive load research):

- **Daily Focus List** — each morning (or night before), AI selects the 3-5 tasks that matter most today based on: urgency, due date, dependencies, energy level, available time. Everything else is "backlog" — visible but not screaming at you.
- **Eisenhower auto-sort** — AI categorises tasks into: Do Now (urgent+important), Schedule (important, not urgent), Delegate (urgent, not important), Eliminate (neither). Surface only "Do Now" and "Schedule" on the dashboard.
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
- ~~Service worker cache: must bump version in `sw.js` on every deploy~~ — **FIXED**: GitHub Actions auto-injects git SHA on deploy
- Duplicate items: double-clicking Save All can create duplicates (disable button during save)
- Time blocks from capture don't appear if CORS fails (saved to localStorage, lost on refresh when Sheets overwrites)
- Journal duplicate entries from double-click
- Today's Board data stored in localStorage (per-device) — does NOT sync across devices via Sheets yet
- `calDelete(eventId)` — backend supports `cal_delete` action but no frontend function wraps it yet
- Legacy GQ_Patrol / GU_Patrol sheets still loaded in `loadAll()` — vestigial, should eventually be removed
