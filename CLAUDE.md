# LifeSync – Claude Instructions

## Service Worker Cache Version (IMPORTANT)

**Every time you commit any change to this repo, you must also update the `CACHE_NAME` in `sw.js`.**

The cache name must be updated so that users' browsers pick up the new files instead of serving stale cached versions.

Format: `lifesync-YYYYMMDD-HHMMSS` using the current UTC date/time.

Example:
```js
const CACHE_NAME = 'lifesync-20260629-143000';
```

Do this in the same commit as your other changes — never in a separate commit, and never skip it.

A GitHub Action also auto-bumps the cache on every push to `main` as a safety net, but Claude must do it inline so the bump ships with the change, not after.

## Project Overview

**LifeSync** is a two-person shared household dashboard PWA.

- Single-file app: `index.html` (all HTML, CSS, JS inline)
- `sw.js` — service worker (PWA caching + push notifications)
- `manifest.json` — PWA manifest
- Firebase Realtime Database for shared state (tasks, notes, links, calendar events)
- Google OAuth for sign-in + Google Calendar read access
- Open-Meteo for weather (no API key needed)
- Deployed via GitHub Pages at `kilfarn.github.io/LifeSync`

## User setup

- Two users share the dashboard: `p1` (blue) and `p2` (amber)
- First user to sign in gets `p1`, second gets `p2`
- Bin day: every Tuesday, alternating General Waste / Recycling

## Development branch

Always develop on: `main`
