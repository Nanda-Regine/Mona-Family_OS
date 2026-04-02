'use strict';

const express = require('express');
const router = express.Router();
const { loadState } = require('../utils/stateManager');
const { generateFamilyReport } = require('../utils/openaiService');
const { aiRateLimit } = require('../middleware/rateLimit');

// GET /analytics/family - family performance overview
router.get('/family', (req, res) => {
  try {
    const state = loadState();
    const { days = 7 } = req.query;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));

    const tasks = state.tasks || [];
    const recentTasks = tasks.filter((t) => !t.dueDate || new Date(t.dueDate) >= cutoff);

    const stats = {
      totalTasks: recentTasks.length,
      completedTasks: recentTasks.filter((t) => t.completed).length,
      missedTasks: recentTasks.filter(
        (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
      completionRate: recentTasks.length
        ? Math.round((recentTasks.filter((t) => t.completed).length / recentTasks.length) * 100)
        : 0
    };

    // Per user stats
    const userStats = {};
    Object.keys(state.users || {}).forEach((userId) => {
      const userTasks = recentTasks.filter((t) => t.assignedTo === userId);
      userStats[userId] = {
        name: state.users[userId].name,
        total: userTasks.length,
        completed: userTasks.filter((t) => t.completed).length,
        missed: userTasks.filter(
          (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
        ).length,
        rate: userTasks.length
          ? Math.round((userTasks.filter((t) => t.completed).length / userTasks.length) * 100)
          : 0
      };
    });

    res.json({
      success: true,
      period: `${days} days`,
      familyStats: stats,
      userStats,
      achievements: (state.achievements || []).filter((a) => new Date(a.createdAt) >= cutoff).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/budget - grocery budget analysis
router.get('/budget', (req, res) => {
  try {
    const state = loadState();
    const items = state.groceryList?.items || [];

    const byCategory = {};
    items.forEach((item) => {
      const cat = item.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, items: [] };
      byCategory[cat].count++;
      byCategory[cat].items.push(item.name);
    });

    res.json({
      success: true,
      totalItems: items.length,
      checkedItems: items.filter((i) => i.checked).length,
      byCategory,
      uncheckedItems: items.filter((i) => !i.checked).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/health - health & nutrition analytics
router.get('/health', (req, res) => {
  try {
    const state = loadState();
    const { days = 7 } = req.query;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));

    const moodData = (state.wellness?.moodTracker || []).filter(
      (e) => new Date(e.date) >= cutoff
    );

    const avgMood = moodData.length
      ? (moodData.reduce((sum, e) => sum + (e.moodScore || 5), 0) / moodData.length).toFixed(1)
      : null;

    const gratitudeCount = (state.wellness?.gratitudeLog || []).filter(
      (e) => new Date(e.date) >= cutoff
    ).length;

    const mealCount = (state.mealPlans || []).filter(
      (m) => new Date(m.generatedAt) >= cutoff
    ).length;

    res.json({
      success: true,
      period: `${days} days`,
      avgMoodScore: avgMood,
      moodEntries: moodData.length,
      gratitudeEntries: gratitudeCount,
      mealPlansGenerated: mealCount,
      recipesGenerated: (state.recipes || []).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/wellness - wellness overview
router.get('/wellness', (req, res) => {
  try {
    const state = loadState();
    const wellness = state.wellness || {};

    const userWellness = {};
    Object.keys(state.users || {}).forEach((userId) => {
      const moods = (wellness.moodTracker || []).filter((e) => e.userId === userId);
      const gratitude = (wellness.gratitudeLog || []).filter((e) => e.userId === userId);
      const stress = (wellness.stressIndicators || []).filter((e) => e.userId === userId);

      userWellness[userId] = {
        name: state.users[userId].name,
        moodCount: moods.length,
        avgMood: moods.length
          ? Math.round(moods.reduce((s, e) => s + (e.moodScore || 5), 0) / moods.length * 10) / 10
          : null,
        gratitudeCount: gratitude.length,
        avgStress: stress.length
          ? Math.round(stress.reduce((s, e) => s + (e.level || 5), 0) / stress.length * 10) / 10
          : null
      };
    });

    res.json({ success: true, userWellness, meditationReminders: (wellness.meditationReminders || []).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /analytics/weekly-report - generate AI weekly report
router.post('/weekly-report', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const report = await generateFamilyReport(state);
    res.json({ success: true, report });
  } catch (err) {
    console.error('Weekly report error:', err);
    res.status(503).json({
      error: 'Report generation failed',
      message: 'Could not generate weekly report. Please try again later.'
    });
  }
});

module.exports = router;
