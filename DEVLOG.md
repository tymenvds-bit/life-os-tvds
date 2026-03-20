# Life OS TvdS — Development Log

A chronological record of the development journey, decisions made, and lessons learned.

---

## Phase 0: Foundation (Early March 2026)

**What was built:** Basic single-file PWA with Google Sheets backend via Apps Script. Service worker for offline caching. GitHub Pages deployment via GitHub Actions.

**Key decisions:**
- **Single-file architecture** — all HTML/CSS/JS in `index.html`. No frameworks, no build step. Deliberately chosen for simplicity and portability.
- **Google Sheets as database** — free, always accessible, universally readable. Data is never locked in. Any future app can connect to the same Sheets.
- **Apps Script as API** — free hosting, direct Sheets/Gmail/Calendar access. No server to maintain.
- **Claude API from browser** — direct Anthropic API calls using user's API key. No proxy needed.

**Commits:** 1fc25f4 → 931079e (12 commits)

---

## Phase 1: Core Modules (Mid-March 2026)

**What was built:** Capture (AI-powered natural language input), Tasks (with statuses, priorities, progress logs), Notes, Time tracking (with stats), Journal (with mood), Calendar (Google Calendar integration).

**Key features:**
- Universal Capture with AI parsing — type anything, AI routes to the right module
- Task statuses: open → in-progress → waiting → done
- Time tracking with Screen Time-style visualisation
- Auto light/dark theme based on Pretoria sunrise/sunset times

**Lessons learned:**
- CORS with Apps Script is tricky — had to use `text/plain` Content-Type workaround
- Timezone handling causes bugs — dates shift when parsed differently. Fixed with `normalizeDate()`.
- Service worker cache must be versioned or users get stale app forever.

**Commits:** c5bd192 → 8b21bd3 (8 commits)

---

## Phase 2: Dashboard & Smart Tasks (Mid-March 2026)

**What was built:** AI-powered dashboard with Today's Board, Focus list, "What should I do next?" AI button, stale task detection, email briefing from Gmail.

**Key decisions:**
- **Today's Board** — user pins tasks for the day. AI suggests 3-5 focus tasks. Items not completed become context for next day.
- **Stale task alerts** — tasks untouched 14+ days get flagged. Forces decision: do, delegate, or delete.
- **Email briefing** — fetches unread Gmail via Apps Script, AI summarises and suggests tasks.

**The persistence bug saga:**
This was the most frustrating multi-session bug. Tasks toggled done would revert after hard refresh. Root causes found over multiple sessions:
1. `apiFetch` didn't cache Sheets data to localStorage — fixed
2. `apiPost` errors were silent (console.warn only) — added toast notifications
3. Sheet name casing mismatch: code used `'todos'` but Sheets tab was `'Todos'` — fixed
4. Browser caching stale GET responses — added cache-busting params
5. **Ultimately: the backend wasn't redeployed** after schema changes. This was the real root cause most of the time.

**Lesson: The deployment pipeline was the bottleneck, not the code.**

**Commits:** 3020e92 → 0b1d02d (15 commits)

---

## Phase 3: Vehicle Fleet Manager (March 18-19, 2026)

**What was built:** Complete vehicle management system with 7 sub-tabs.

**Decision: Build within Life OS, not standalone.**
An earlier spec (`PATROL_FLEET_MANAGER_SPEC.md`) proposed a standalone Next.js + Supabase app. Decided against it because:
- Life OS exists to consolidate everything — a separate app defeats the purpose
- Google Sheets handles the data model fine
- Claude Vision OCR works the same regardless of stack
- No new infrastructure needed

**What was built (Phase 1-4 of vehicle module):**
- Vehicle CRUD with full form
- Fuel logging with auto km/L calculation + Fuelly CSV import
- Service logging with Service Day checklist system
- Service reminders with km + date urgency (red/amber/green), auto-advance, calendar sync
- VehicleExpenses with 9 categories, recurring costs (monthly/quarterly/annual)
- VehicleChecks (battery SOH/voltage, tyre tread depth) with trend charts
- VehicleTodos (per-vehicle checklists with categories, part numbers)
- Claude Vision OCR for receipts and odometer photos
- 10-year replacement economics calculator (deterministic math, not AI guesses)
- AI-suggested comparison vehicles
- CSV export of all vehicle data
- Push notifications for overdue services
- Dashboard widget showing service reminders across all vehicles

**Key technical decisions:**
- **Service Day auto-save** — saves to localStorage every 500ms. Resume after closing modal, page refresh, or browser restart. Critical for 6-hour service jobs.
- **Deterministic economics calculator** — initially asked AI to calculate numbers. Audit revealed AI was making arithmetic errors. Rewrote to calculate everything in JS code, only ask AI for recommendation text.
- **Per-item costing on Service Day** — each checklist item has its own cost field. Running total auto-sums. Override total available for dumping an invoice amount.
- **Vehicle life: whichever comes first** — tracks both km and age, expires on whichever limit is reached first (like a warranty).

**Commits:** 86669f5 → 65b8a5e (30+ commits)

---

## Phase 4: Workflow Automation (March 19, 2026)

**What was built:** Automated deployment pipeline, removing manual bottlenecks.

**The problem:** Every session, the user reported data not persisting. Every time, the root cause was: backend api.gs wasn't redeployed after schema changes. The user had to manually open Apps Script editor, paste code, create new version, deploy. This was forgotten 80% of the time.

**The fix:**
1. **clasp CLI** — installed Google's Apps Script CLI tool. Now `clasp push && clasp deploy` from terminal.
2. **GitHub Actions SW versioning** — service worker cache version auto-injected from git SHA on every deploy. No more manual version bumps.
3. **Backend health check** — `checkBackendHealth()` pings the API on startup, compares `schemaKeys` against expected sheets, toasts a warning if backend is outdated.
4. **Direct API access** — can now read/write Google Sheets data via curl for debugging and data import.

**Lesson: If a manual step is forgotten more than twice, automate it. The deployment pipeline should have been automated in the first session.**

---

## Ongoing: Continuous Improvement Rules

Added to CLAUDE.md and enforced:
1. **After every significant change:** update CLAUDE.md to reflect new modules, functions, API actions.
2. **After every session:** review what went well, what caused friction, update docs.
3. **Workflow optimisation:** if a manual step is repeated more than twice, automate it.
4. **App workflow optimisation:** continuously evaluate if the user's daily workflow can be streamlined.
5. **Help system:** in-app `?` button with context-sensitive guides per tab. Must be updated when features change.
6. **Persistence test:** after every deploy, verify data survives a hard refresh.

---

## Session: March 20, 2026 — Full Ownership Tracking Complete

**What was built:**
- AI assistant (floating 🤖 button) — knows all app data, can route actions across the entire app
- App wishlist/dev notes modal — in-app feature request tracker, auto-seeded with roadmap from CLAUDE.md
- Capacity monitoring — auto-checks code size, localStorage usage, and sheet count on startup
- Tyre retirement + replacement flow — retire damaged tyres, replace with new ones in same position
- Committed, pushed, and deployed api.gs via clasp (v17) with all 22 sheet schemas

**Key decisions:**
- App wishlist stored in localStorage (not Sheets) — it's device-specific dev tooling, not user data
- Capacity check is console-only (warnings) — doesn't block the user, just surfaces info for the developer
- Seeded wishlist with 15 roadmap items from CLAUDE.md so user has visibility into planned features
- All 6 planned ownership features (specs, parts, tyres, mods, incidents, trips) confirmed built and deployed

**Lessons:**
- Session context can be lost mid-conversation — having a plan file (`robust-swinging-garden.md`) made it easy to resume
- Always deploy api.gs immediately after schema changes to avoid the persistence bug that frustrated the user multiple times
- The plan's implementation order was good but most items were already built by agents in the previous session — verification was the main task

**Commits this session:**
- `7176736` — Add AI assistant, app wishlist, capacity monitoring, tyre retirement
- (next) — Seed wishlist with roadmap, update CLAUDE.md + DEVLOG.md

---

## Session: March 20, 2026 (continued) — Engineering Fundamentals

**What was built:**
- UX improvements: delete confirmations on all 11 delete functions, forms moved above lists, datalist autocomplete, field-specific validation, last ODO helper text
- Error boundaries (`safeRender`) — render failures show error card with Retry button instead of blank screen
- localStorage quota warning — `checkStorageQuota()` toasts at >80% full, `LS.set` toasts on quota exceeded
- Button locking (`_locks`) — prevents double-click duplicate entries on addFuelLog, addServiceLog, addExpense, addTrip
- Input validation (`validate` object) — positive number checks, ODO-goes-forward warnings with confirm override, far-future date warnings
- System Health UI in Settings — progress bars for localStorage and Sheets count, backend status, last sync time
- CI quality checks — file size limit (500KB fail, 7,000 lines warn) and JS syntax check via `node --check`

**Key decisions:**
- Validation uses `confirm()` so user can override (correcting old data is a valid use case)
- System Health is in Settings modal, not cluttering the dashboard — it's developer info, not daily driver info
- CI checks are zero-dependency (node --check, wc, sed) — no npm/eslint needed
- No unit test framework added — CI syntax check catches the biggest class of deploy-breaking errors for a single-file vanilla app

**Lessons:**
- The engineering fundamentals assessment was overdue — error boundaries and input validation are table stakes that should've been in from Phase 1
- Button locking is critical for mobile users on slow connections where double-tap is natural
- The plan approach (7 phases, line budget, explicit "what NOT to do") kept scope tight and prevented over-engineering

---

## Architecture Snapshot (as of March 20, 2026)

| Component | Technology | Location |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS (single file) | `index.html` on GitHub Pages |
| Backend | Google Apps Script | `backend/api.gs` deployed via clasp (v17) |
| Database | Google Sheets (22 sheets) | Spreadsheet `17IXrGN11g8Fm8AjROr_W9_99xz1q_jqCdb8AQOFIX2s` |
| Calendar | Google Calendar API via Apps Script | Same Apps Script project |
| AI | Claude API (claude-sonnet-4-20250514) | Direct browser → Anthropic API |
| Deployment | GitHub Actions → Pages + clasp → Apps Script | `.github/workflows/deploy.yml` |
| Offline | Service Worker + localStorage | `sw.js` with auto-versioning |

**Total commits:** 85+
**Total lines of code:** ~5,330 in index.html (single file)
**Google Sheets:** 22 active sheets (20 active + 2 legacy)
**API actions:** 10 (read, ping, append, write, update, delete, upsert, calendar, cal_create, cal_delete, emails)
**Vehicle sub-tabs:** 9 (Dashboard, Fuel, Services, Costs, Economics, Checks, Todos, Parts, Trips)
