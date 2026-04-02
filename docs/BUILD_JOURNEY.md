# Build Journey — Mona Family OS

> A record of how this app was designed, built, and what decisions were made along the way.

---

## Origin

This app started from a single prompt — a vision for a system that would make family life more organized, healthier, and more connected. The Mona family had a clear picture of what they needed: real-time chore tracking across 5 people, AI-powered meal planning focused on less starch and more vegetables, mental wellness tools, and an accessibility layer built specifically for Mom's needs.

The challenge was building something complex enough to handle all of that, while keeping it simple enough that everyone from Phawu (13) to Mom could use it on their phone without any technical knowledge.

---

## Architecture Decisions

### Why No External Database?

The spec called for lightweight, offline-first operation. A cloud database (PostgreSQL, MongoDB) would have introduced:
- Latency for every read/write
- Authentication complexity
- Monthly cost
- Harder local development

Instead, we went with:
- **IndexedDB** on the client (100% offline, instant reads)
- **JSON file** on the server (`state.json`) for persistence
- **Polling sync** every 10 seconds for eventual consistency

This is the same pattern used by many successful family/personal apps. It scales to 5 devices easily, and if the backend is down, the app still works completely offline.

### Why gpt-3.5-turbo?

Budget. `gpt-3.5-turbo` is ~20x cheaper than `gpt-4` with 90% of the quality for the tasks we need:
- Recipe generation
- Meal planning
- Budget optimization
- Wellness suggestions
- Weekly family reports

Rate limiting is enforced server-side (10 req/min per IP) to prevent runaway costs.

### Why React 18 + Tailwind (not Next.js)?

The app is purely client-side rendered — no SEO requirements, no server-side rendering needed. Create React App with Tailwind is:
- Simpler mental model
- Faster to build
- Easier to deploy to Vercel as a static site
- No framework-specific abstractions to learn

If the app ever needs SEO or server components (unlikely for a family tool), migrating to Next.js is straightforward.

### Why Express (not Fastify/Hono)?

Familiarity and ecosystem. Express has the largest library of tutorials and middleware. For a family app that will be maintained by non-professional developers, Express is the lowest friction choice.

---

## Feature Build Order

### Phase 1 — Foundation
Built first because nothing else works without it:
1. `state.json` data model — defines the shape of all data
2. `stateManager.js` — load/save with error recovery
3. `server.js` — Express app, CORS, middleware
4. `/sync` endpoint — the heart of multi-device sync
5. `useIndexedDB.js` — client-side storage hook
6. `useSyncManager.js` — 10-second polling

### Phase 2 — Core Features
The daily-use features that justify the app existing:
1. Routines + task completion
2. Rotation logic (Tabile ↔ Nanda cooking/dishes)
3. Missed chore detection
4. User cards with accessibility modes

### Phase 3 — AI & Food
The features that make it genuinely useful:
1. OpenAI service (all AI functions consolidated)
2. Recipe generation from grocery items
3. Meal planning (7-day, health-focused)
4. Budget optimization

### Phase 4 — Wellness & Achievements
The features that make it a family OS, not just a chore tracker:
1. Gratitude log
2. Mood tracker with trend analysis
3. Box breathing exercise
4. Stress overflow detection
5. Achievement board with reactions and comments
6. Auto-milestone detection (streaks, perfect weeks)

### Phase 5 — Customization
What makes it adaptable to your family:
1. Parent control center (Mom, Dad, Nanda)
2. Visual routine builder
3. School calendar integration (Phawu)
4. Accessibility panel (font size, contrast)

---

## Key Design Choices

### Accessibility-First for Mom

Mom's settings were built in from day 1, not added at the end:
- `fontSize: "18px"` (vs 16px default)
- `contrast: "high"` — pure black on white
- `largeButtons: true` — 50px min-height
- `simplifyUI: true` — hides advanced features

The `AccessibilityContext` is a React Context that wraps the entire app, so every component can read the current user's accessibility preferences without prop drilling.

### Nanda as Eldest Customizer

Nanda has been granted the `customizer` role — equivalent to parental access for the management dashboard. This was added as a deliberate design choice: as the eldest family member, Nanda co-manages the family system. This is enforced in:
- `constants.js` — `CUSTOMIZERS = ['mom', 'dad', 'nanda']`
- `state.json` — `nanda.role = 'customizer'`
- `ParentDashboard.jsx` — checks `CAN_CUSTOMIZE(userId)`
- Backend `customization.js` — open by design (trust-based family system)

### Offline-First Sync

The sync flow:
```
1. User makes change → saved to IndexedDB immediately (optimistic)
2. Change queued in pendingChanges array
3. Every 10s: POST /sync { deviceId, lastSync, changes[] }
4. Server merges with state.json (last-write-wins by timestamp)
5. Server returns delta since lastSync
6. Client applies delta to IndexedDB
7. UI updates
```

If the device is offline, changes sit in the queue until connectivity returns. No data is ever lost.

### Health Focus

Every food-related feature has the family's health goal baked in: **"less starch, more vegetables"**. This appears in:
- OpenAI recipe prompts
- Meal plan generation
- Grocery item health scores (`starchLevel`, `healthScore`)
- Nutrition tracking (starch is tracked and warned)
- Budget optimization (encourages whole foods)

---

## Folder Structure Rationale

```
backend/
  routes/       — One file per domain (groceries, wellness, achievements...)
  utils/        — Business logic separate from HTTP layer
  middleware/   — Cross-cutting concerns (auth, error handling, rate limit)
  data/         — state.json lives here

frontend/
  pages/        — Top-level views (one per nav item)
  components/   — Reusable UI pieces
  hooks/        — Data fetching + state management
  utils/        — Pure functions (no React)
  styles/       — Global CSS + accessibility overrides
```

The rule: pages compose components, components use hooks, hooks use utils. No component imports from pages. No circular dependencies.

---

## What We Didn't Build (and Why)

| Feature | Why skipped |
|---------|-------------|
| User authentication/passwords | Trust-based family system. Device = identity. |
| Push notifications | Requires service worker + notification permissions. Can be added later. |
| Image uploads | Out of scope. Adds storage complexity. |
| Chat/messaging | Achievements board serves as async communication. |
| Drag-and-drop reordering | Adds JS bundle weight. Touch-friendly tap interactions are better for Mom. |
| Real-time WebSockets | 10-second polling is simpler, works offline, handles reconnection automatically. |

---

## Known Limitations & Future Work

1. **state.json is single-file**: Works for a family of 5. Would need sharding for 50+ users.
2. **No conflict resolution for simultaneous edits**: Last-write-wins is simple but could cause issues if two people mark the same task complete at the same second.
3. **OpenAI costs**: Monitor usage monthly. With rate limiting at 10/min, worst case is ~$5/month.
4. **School calendar**: Phawu's term dates are stored but not auto-populated. Parent needs to enter these each term.
5. **Voice input**: Mentioned in spec, not yet implemented. Web Speech API works on most modern mobile browsers.

---

## Deployment Notes

- **Frontend** → Vercel (zero-config, auto-deploys on push to `main`)
- **Backend** → Railway (free tier, auto-detects Node.js, runs `npm start`)
- **Environment** → `.env.example` files in both `backend/` and `frontend/`
- **State persistence** → `state.json` is gitignored. Backend needs a persistent disk (Railway provides this by default)

---

## Tools Used

- **Claude Code** — Full-stack code generation and architecture
- **React 18** — UI framework
- **Tailwind CSS v3** — Styling
- **Express 4** — Backend framework
- **OpenAI SDK v4** — AI integration
- **IndexedDB / idb** — Offline storage
- **Vercel** — Frontend hosting
- **Railway** — Backend hosting

---

*Built April 2026 for the Mona family.*
