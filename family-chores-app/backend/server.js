'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');
const { generalRateLimit } = require('./middleware/rateLimit');

// Routes
const healthRouter = require('./routes/health');
const syncRouter = require('./routes/sync');
const routinesRouter = require('./routes/routines');
const groceriesRouter = require('./routes/groceries');
const recipesRouter = require('./routes/recipes');
const wellnessRouter = require('./routes/wellness');
const achievementsRouter = require('./routes/achievements');
const analyticsRouter = require('./routes/analytics');
const customItemsRouter = require('./routes/customItems');
const familyInstructionsRouter = require('./routes/familyInstructions');
const customizationRouter = require('./routes/customization');

// Utils
const { getRotation, advanceRotation } = require('./utils/rotationEngine');
const { loadState } = require('./utils/stateManager');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://mona-family-os.vercel.app',
  /\.vercel\.app$/,
  /\.railway\.app$/,
  /\.render\.com$/
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow non-browser requests
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID']
  })
);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
app.use(generalRateLimit);

// ─── REQUEST LOGGING ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/sync', syncRouter);
app.use('/routines', routinesRouter);
app.use('/groceries', groceriesRouter);
app.use('/recipes', recipesRouter);
app.use('/wellness', wellnessRouter);
app.use('/achievements', achievementsRouter);
app.use('/analytics', analyticsRouter);
app.use('/custom-items', customItemsRouter);
app.use('/instructions', familyInstructionsRouter);
app.use('/customization', customizationRouter);

// ─── ROTATION ENDPOINTS ────────────────────────────────────────────────────────
app.get('/rotation', (req, res) => {
  try {
    const rotation = getRotation();
    res.json({ success: true, rotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rotation/advance', async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || !['cooking', 'dishes'].includes(type)) {
      return res.status(400).json({ error: 'type must be "cooking" or "dishes"' });
    }
    const rotation = await advanceRotation(type);
    res.json({ success: true, rotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STUDY GUIDE ENDPOINT ─────────────────────────────────────────────────────
app.post('/study/generate', require('./middleware/rateLimit').aiRateLimit, async (req, res) => {
  try {
    const { subject, examDate, studyHistory, userId } = req.body;
    if (!subject) return res.status(400).json({ error: 'subject is required' });

    const { generateStudyGuide } = require('./utils/openaiService');
    const guide = await generateStudyGuide(subject, examDate, studyHistory);
    res.json({ success: true, guide });
  } catch (err) {
    console.error('Study guide error:', err);
    res.status(503).json({
      error: 'Study guide generation failed',
      message: 'Could not generate study guide. Please try again later.'
    });
  }
});

// ─── ROOT ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Mona Family OS API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/health',
      '/sync',
      '/routines',
      '/groceries',
      '/recipes',
      '/wellness',
      '/achievements',
      '/analytics',
      '/rotation',
      '/customization'
    ]
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 Mona Family OS API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? 'configured' : 'NOT configured'}\n`);

  // Pre-load state on startup
  try {
    const state = loadState();
    console.log(`   Users: ${Object.keys(state.users || {}).join(', ')}`);
    console.log(`   Tasks: ${(state.tasks || []).length}`);
    console.log(`   Routines: ${(state.routines || []).length}\n`);
  } catch (e) {
    console.error('   Warning: Could not pre-load state:', e.message);
  }
});

module.exports = app;
