# Mona Family OS

> An AI-powered family management system — chores, wellness, meal planning, and celebrations in one place.

[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Railway-purple?logo=railway)](https://railway.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)

---

## Overview

Mona Family OS is a production-ready, offline-first family management app built for 5 people across multiple devices. It syncs automatically, works without internet, and uses AI to help with meal planning, budget optimization, and wellness.

**Built for the Mona family. Designed to grow with it.**

---

## Features

| Feature | Description |
|---------|-------------|
| **Task Management** | Daily routines, one-off tasks, recurring chores with drag-to-complete |
| **Cooking Rotation** | Auto-rotating schedule — Tabile and Nanda alternate cooking and dishes |
| **Missed Chore Alerts** | Prominent warnings for overdue tasks, auto-detected at day end |
| **AI Recipes** | Generate healthy recipes from your actual grocery list (OpenAI) |
| **Meal Planning** | 7-day meal plan focused on less starch, more vegetables |
| **Budget Optimization** | AI analyzes grocery spend and suggests savings |
| **Gratitude Log** | Daily gratitude journaling with mood tracking |
| **Mood Tracker** | 1–10 scale check-ins with 7-day trend charts |
| **Stress Detection** | System flags when someone is overwhelmed, suggests lighter week |
| **Box Breathing** | Guided breathing exercise built in — one tap to start |
| **Achievement Board** | Log family wins, react with emoji, leave comments |
| **Auto Milestones** | App detects 7-day streaks, perfect weeks, 30-day consistency |
| **School Integration** | Phawu's sports schedule, exam periods, academic events |
| **Parent Customizer** | Build routines, set schedules, adjust health goals — no code needed |
| **Accessibility Mode** | Large fonts (18px+), high contrast, large buttons for Mom |
| **Offline First** | All changes work without internet, auto-sync when back online |
| **Multi-device Sync** | 10-second polling across all family devices |

---

## Family Members & Access

| Member | Role | Customization | Notes |
|--------|------|--------------|-------|
| Mom | Parent | Full | High contrast + 18px font by default |
| Dad | Parent | Full | — |
| **Nanda** | **Customizer** | **Full** | **Eldest — co-manages family system** |
| Tabile | Adult | Personal settings only | Cooking rotation with Nanda |
| Phawu | Student | Personal settings only | Hudson Park HS, sports M–Th |

---

## Tech Stack

### Frontend
```
React 18          — UI framework
Tailwind CSS v3   — Utility-first styling
IndexedDB (idb)   — Offline storage
Axios             — HTTP client
react-icons       — Accessible icon set
```

### Backend
```
Node.js 18+       — Runtime
Express 4         — HTTP framework
OpenAI SDK v4     — AI integration (gpt-3.5-turbo)
UUID              — ID generation
express-rate-limit — Prevent API spam
```

### Infrastructure
```
Vercel    — Frontend (auto-deploy from GitHub)
Railway   — Backend (persistent disk for state.json)
GitHub    — Source control
```

---

## Project Structure

```
family-chores-app/
├── backend/
│   ├── middleware/       # Auth, error handling, rate limiting
│   ├── routes/           # One file per domain
│   │   ├── sync.js       # Core sync endpoint
│   │   ├── routines.js   # Tasks & routines CRUD
│   │   ├── groceries.js  # Grocery list management
│   │   ├── recipes.js    # AI recipe generation
│   │   ├── wellness.js   # Gratitude, mood, stress
│   │   ├── achievements.js # Family wins board
│   │   ├── analytics.js  # Performance & health tracking
│   │   └── customization.js # Parent settings
│   ├── utils/
│   │   ├── openaiService.js  # All AI functions
│   │   ├── stateManager.js   # JSON file persistence
│   │   ├── rotationEngine.js # Cooking/dishes rotation
│   │   ├── wellnessEngine.js # Stress detection
│   │   └── achievementCalculator.js # Auto-milestones
│   ├── data/
│   │   └── state.json    # Master family state (gitignored)
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/        # Top-level views (7 pages)
    │   ├── components/   # Reusable UI components
    │   ├── hooks/        # Data + state management
    │   └── utils/        # Pure functions
    └── public/
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- An OpenAI API key ([get one here](https://platform.openai.com))

### Backend

```bash
cd family-chores-app/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
# Server starts on http://localhost:3001
# Test: curl http://localhost:3001/health
```

### Frontend

```bash
cd family-chores-app/frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

```bash
npm start
# App opens at http://localhost:3000
```

---

## Deployment

### Backend → Railway

1. Sign in at [railway.app](https://railway.app) with GitHub
2. New Project → Deploy from GitHub → select this repo
3. Set root directory: `family-chores-app/backend`
4. Add environment variables (OPENAI_API_KEY etc.)
5. Railway auto-detects Node.js and deploys

### Frontend → Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub
2. Add New Project → Import this repo
3. Framework: Create React App
4. Root Directory: `family-chores-app/frontend`
5. Add `REACT_APP_BACKEND_URL` pointing to your Railway URL
6. Deploy — auto-redeploys on every push to `main`

Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## API Reference

Full API docs: [docs/API.md](docs/API.md)

Key endpoints:

```
POST /sync                    — Sync client changes with server
GET  /health                  — Health check
GET  /daily?date=YYYY-MM-DD   — Get today's tasks
POST /recipes/generate        — Generate AI recipes
POST /wellness/mood           — Log mood check-in
POST /achievements/log        — Log family achievement
GET  /analytics/family        — Family performance overview
```

---

## Offline Behaviour

The app is fully functional without internet:

1. All reads/writes go to **IndexedDB** first (instant)
2. Changes are queued in `pendingChanges`
3. When online: changes are synced to backend
4. Conflict resolution: **last-write-wins** by timestamp
5. Sync indicator in header shows current status

---

## Accessibility

Built specifically for Mom's needs (poor eyesight):

- **Font size**: 18px minimum (configurable per user)
- **Contrast**: High contrast mode — pure black on white
- **Buttons**: Minimum 50px height, 44px touch targets
- **Layout**: Mobile-first, no hover-only interactions
- **Language**: Plain English, no technical jargon
- **Voice**: Web Speech API integration for feedback

To change accessibility settings: open the app → Menu → Manage → Accessibility

---

## AI Features

All AI features use OpenAI's `gpt-3.5-turbo` model:

| Feature | Endpoint | Cost estimate |
|---------|----------|---------------|
| Recipe generation | `POST /recipes/generate` | ~$0.002/request |
| Meal planning | `POST /recipes/generate` (type: mealplan) | ~$0.004/request |
| Budget optimization | `GET /nutrition/analysis` | ~$0.003/request |
| Wellness suggestions | `POST /wellness/suggestions` | ~$0.001/request |
| Weekly family report | `POST /analytics/weekly-report` | ~$0.005/request |

Rate limited to 10 requests/minute to control costs. Estimated monthly cost with normal family usage: **< $3/month**.

---

## Build Journey

How this app was designed and built: [docs/BUILD_JOURNEY.md](docs/BUILD_JOURNEY.md)

---

## Roadmap

- [ ] Push notifications (service worker)
- [ ] Voice input for Mom
- [ ] Phawu study guide generator (AI)
- [ ] School calendar auto-import
- [ ] Family photo/memory board
- [ ] Budget tracker with spending history
- [ ] Export data to CSV

---

## Contributing

This is a private family app. To make changes:

1. Clone the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally (backend + frontend both running)
5. Push and create a PR

**Nanda, Mom, and Dad** have full access to modify routines, schedules, and family settings directly in the app — no code needed.

---

## License

Private — Mona Family use only.

---

*Built with ❤️ for the Mona family — April 2026*
