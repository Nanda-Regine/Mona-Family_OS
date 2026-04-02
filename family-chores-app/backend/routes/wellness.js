'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');
const { calculateStressLevel, getWellnessRecommendation } = require('../utils/wellnessEngine');
const { generateWellnessSuggestions } = require('../utils/openaiService');
const { aiRateLimit } = require('../middleware/rateLimit');

// GET /wellness/gratitude - get gratitude log
router.get('/gratitude', (req, res) => {
  try {
    const state = loadState();
    const { userId, limit = 20 } = req.query;
    let entries = state.wellness?.gratitudeLog || [];
    if (userId) entries = entries.filter((e) => e.userId === userId);
    entries = entries.slice(-parseInt(limit)).reverse();
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /wellness/gratitude - add gratitude entry
router.post('/gratitude', async (req, res) => {
  try {
    const state = loadState();
    const { userId, entries, mood } = req.body;
    if (!userId || !entries) return res.status(400).json({ error: 'userId and entries are required' });

    const entry = {
      id: uuidv4(),
      userId,
      entries: Array.isArray(entries) ? entries : [entries],
      mood: mood || null,
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.wellness) state.wellness = {};
    if (!state.wellness.gratitudeLog) state.wellness.gratitudeLog = [];
    state.wellness.gratitudeLog.push(entry);

    await saveState(state);
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /wellness/gratitude/:id
router.delete('/gratitude/:id', async (req, res) => {
  try {
    const state = loadState();
    const log = state.wellness?.gratitudeLog || [];
    const idx = log.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Entry not found' });

    const deleted = log.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /wellness/mood - get mood history
router.get('/mood', (req, res) => {
  try {
    const state = loadState();
    const { userId, days = 7 } = req.query;
    let entries = state.wellness?.moodTracker || [];
    if (userId) entries = entries.filter((e) => e.userId === userId);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    entries = entries.filter((e) => new Date(e.date) >= cutoff);

    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /wellness/mood - log mood entry
router.post('/mood', async (req, res) => {
  try {
    const state = loadState();
    const { userId, mood, moodScore, notes, activities } = req.body;
    if (!userId || mood === undefined) return res.status(400).json({ error: 'userId and mood are required' });

    const entry = {
      id: uuidv4(),
      userId,
      mood,
      moodScore: moodScore || 5,
      notes: notes || '',
      activities: activities || [],
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.wellness) state.wellness = {};
    if (!state.wellness.moodTracker) state.wellness.moodTracker = [];
    state.wellness.moodTracker.push(entry);

    await saveState(state);
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /wellness/meditation - get meditation reminders
router.get('/meditation', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;
    let reminders = state.wellness?.meditationReminders || [];
    if (userId) reminders = reminders.filter((r) => r.userId === userId);
    res.json({ success: true, reminders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /wellness/meditation - add meditation reminder
router.post('/meditation', async (req, res) => {
  try {
    const state = loadState();
    const { userId, time, days, duration } = req.body;
    if (!userId || !time) return res.status(400).json({ error: 'userId and time are required' });

    const reminder = {
      id: uuidv4(),
      userId,
      time,
      days: days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      duration: duration || 10,
      active: true,
      createdAt: new Date().toISOString()
    };

    if (!state.wellness) state.wellness = {};
    if (!state.wellness.meditationReminders) state.wellness.meditationReminders = [];
    state.wellness.meditationReminders.push(reminder);

    await saveState(state);
    res.status(201).json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /wellness/stress/:userId - get stress check
router.get('/stress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const stressLevel = calculateStressLevel(userId, req.query);
    const recommendation = getWellnessRecommendation(stressLevel);
    res.json({ success: true, userId, stressLevel, recommendation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /wellness/stress - log stress indicator
router.post('/stress', async (req, res) => {
  try {
    const state = loadState();
    const { userId, level, triggers, notes } = req.body;
    if (!userId || level === undefined) return res.status(400).json({ error: 'userId and level required' });

    const indicator = {
      id: uuidv4(),
      userId,
      level,
      triggers: triggers || [],
      notes: notes || '',
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.wellness) state.wellness = {};
    if (!state.wellness.stressIndicators) state.wellness.stressIndicators = [];
    state.wellness.stressIndicators.push(indicator);

    await saveState(state);

    const recommendation = getWellnessRecommendation(level);
    res.status(201).json({ success: true, indicator, recommendation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /wellness/suggestions - AI wellness suggestions
router.get('/suggestions', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;
    const stressLevel = calculateStressLevel(userId || 'family', {});
    const achievements = state.achievements?.slice(-5).map((a) => a.title).join(', ');

    const suggestions = await generateWellnessSuggestions(5, stressLevel, achievements);
    res.json({ success: true, suggestions });
  } catch (err) {
    console.error('Wellness suggestions error:', err);
    const stressLevel = 5;
    const recommendation = getWellnessRecommendation(stressLevel);
    res.json({ success: true, suggestions: recommendation, fallback: true });
  }
});

// GET /wellness/trends/:userId - mood trends
router.get('/trends/:userId', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));

    const moodEntries = (state.wellness?.moodTracker || [])
      .filter((e) => e.userId === userId && new Date(e.date) >= cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const gratitudeEntries = (state.wellness?.gratitudeLog || [])
      .filter((e) => e.userId === userId && new Date(e.date) >= cutoff)
      .length;

    const avgMood = moodEntries.length
      ? moodEntries.reduce((sum, e) => sum + (e.moodScore || 5), 0) / moodEntries.length
      : null;

    res.json({
      success: true,
      userId,
      trends: {
        moodEntries,
        avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        gratitudeCount: gratitudeEntries,
        period: `${days} days`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
