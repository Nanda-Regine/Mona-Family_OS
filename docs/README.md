# Mona Family OS

A production-ready, AI-powered family chores management system built for the Mona family.

## Features

- **Real-time multi-device sync** — offline-first with 10-second polling
- **AI integration** — recipes, meal plans, budget optimization, wellness tips via OpenAI
- **Mental wellness** — gratitude log, mood tracker, breathing exercises, stress detection
- **Achievement system** — celebrate family wins, reactions, comments
- **Parent customization** — full control panel (Mom, Dad, and Nanda)
- **Accessibility-first** — large fonts, high contrast mode for Mom
- **School integration** — Phawu's sports schedule, exam periods, academic events
- **Grocery management** — health scores, starch tracking, AI recipe generation
- **Healthy eating focus** — less starch, more vegetables

## Family Members

| Member | Role | Access Level |
|--------|------|-------------|
| Mom | Parent | Full customization + accessibility |
| Dad | Parent | Full customization |
| **Nanda** | **Customizer (Eldest)** | **Full customization** |
| Tabile | Adult | Tasks + wellness |
| Phawu | Student | Tasks + school + wellness |

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + IndexedDB (offline)
- **Backend**: Node.js + Express + OpenAI API
- **Storage**: IndexedDB (client) + JSON file (server)
- **Deploy**: Vercel (frontend) + Railway/Render (backend)

## Quick Start

### Backend
```bash
cd family-chores-app/backend
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

### Frontend
```bash
cd family-chores-app/frontend
npm install
cp .env.example .env
# Set REACT_APP_BACKEND_URL=http://localhost:3001
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

## API

See [API.md](./API.md) for all API endpoints.
