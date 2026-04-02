# API Reference

Base URL: `http://localhost:3001` (dev) or your Railway URL (prod)

## Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/sync` | Main sync endpoint |
| GET | `/sync/state` | Get full server state |

## Routines & Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routines` | Get all routines |
| POST | `/routines` | Create routine |
| PUT | `/routines/:id` | Update routine |
| DELETE | `/routines/:id` | Delete routine |
| GET | `/daily?date=YYYY-MM-DD` | Get today's tasks |
| POST | `/task/:id/complete` | Mark task complete |
| POST | `/task/quick-add` | Add one-off task |

## Grocery & Recipes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groceries` | Get grocery list |
| POST | `/groceries/items` | Add item |
| PUT | `/groceries/items/:id` | Update item |
| DELETE | `/groceries/items/:id` | Delete item |
| POST | `/recipes/generate` | Generate AI recipes |
| GET | `/recipes/cached` | Get cached recipes |
| GET | `/nutrition/analysis` | Budget analysis |
| POST | `/mealplan` | Save meal plan |

## Wellness

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wellness/gratitude` | Log gratitude |
| GET | `/wellness/gratitude/:userId` | Get gratitude entries |
| POST | `/wellness/mood` | Log mood check-in |
| GET | `/wellness/mood-trends/:userId` | Get 7-day mood trends |
| POST | `/wellness/meditation-reminder` | Create reminder |
| GET | `/wellness/stress-check/:userId` | Check stress level |
| POST | `/wellness/suggestions` | AI wellness suggestions |

## Achievements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/achievements/log` | Log achievement |
| GET | `/achievements` | All family achievements |
| GET | `/achievements/:userId` | User achievements |
| POST | `/achievements/:id/react` | React to achievement |
| POST | `/achievements/:id/comment` | Comment on achievement |
| GET | `/achievements/milestones` | Auto-detected milestones |

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/family` | Family overview |
| GET | `/analytics/budget` | Budget analysis |
| GET | `/analytics/health` | Health/nutrition trends |
| GET | `/analytics/wellness` | Wellness trends |
| POST | `/analytics/weekly-report` | AI weekly report |

## Customization

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customization/schedule` | Get schedule |
| POST | `/customization/schedule` | Update schedule |
| GET | `/customization/accessibility` | Get accessibility settings |
| POST | `/customization/accessibility` | Update accessibility |
| PUT | `/user/:id/preferences` | Update user preferences |

## Access Control

- **Full customization**: Mom, Dad, Nanda (eldest)
- **Tasks + wellness**: Tabile
- **Tasks + wellness + school**: Phawu
