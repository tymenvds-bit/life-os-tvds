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
- Dark theme with gold accents (`#c9a84c`)

## Modules

| Tab | Sheet | Description |
|-----|-------|-------------|
| Todos | Todos | Task manager with priorities, categories, due dates, AI breakdown |
| Notes | Notes | Freeform notes with categories and tags |
| Time | Time | Time tracking with live timer |
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
- `capture(mode)` — AI-powered natural language capture; routes to todos, notes, time, journal, calendar, fuel
- `commitCapture(jsonStr)` — saves all captured items including calendar events
- `renderAll()` — re-renders all tabs
- `esc(s)` — HTML-escape strings (XSS prevention)
- `uid()` — generate unique IDs
- `toast(msg)` — show notification

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
