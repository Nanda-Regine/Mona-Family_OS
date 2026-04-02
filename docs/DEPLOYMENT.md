# Deployment Guide

## Backend — Railway (Recommended Free Tier)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Mona-Family_OS` and choose the `family-chores-app/backend` folder
4. Set environment variables in Railway dashboard:
   ```
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
5. Deploy. Railway will auto-detect Node.js and run `npm start`
6. Copy your Railway URL (e.g. `https://mona-family-os.railway.app`)

## Backend — Render (Alternative)

1. Go to [render.com](https://render.com), sign in with GitHub
2. New → Web Service → Connect `Mona-Family_OS` repo
3. Root Directory: `family-chores-app/backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Set the same environment variables as above

## Frontend — Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. "Add New" → "Project" → Import `Mona-Family_OS`
3. Set Framework Preset: **Create React App**
4. Root Directory: `family-chores-app/frontend`
5. Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://your-railway-url.railway.app
   ```
6. Deploy. Vercel auto-builds and deploys on every push.

## Post-Deployment

1. Visit your Vercel URL
2. Test `/health` on backend: `https://your-backend.railway.app/health`
3. Select a family member and test task completion
4. Test offline mode: open DevTools → Network → Offline, make changes, go back online
5. Test AI recipes: add groceries, click "AI Recipes"

## Environment Variables Reference

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_MODEL` | Model to use (default: gpt-3.5-turbo) | No |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | production or development | No |
| `FRONTEND_URL` | Your Vercel URL for CORS | Yes in prod |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_BACKEND_URL` | Your Railway/Render backend URL | Yes |
