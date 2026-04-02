'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');
const { checkAllMilestones } = require('../utils/achievementCalculator');

// GET /achievements - get all achievements
router.get('/', (req, res) => {
  try {
    const state = loadState();
    const { userId, category, limit = 50 } = req.query;
    let achievements = state.achievements || [];

    if (userId) achievements = achievements.filter((a) => a.userId === userId);
    if (category) achievements = achievements.filter((a) => a.category === category);

    achievements = achievements
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({ success: true, achievements, total: (state.achievements || []).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /achievements - log new achievement
router.post('/', async (req, res) => {
  try {
    const state = loadState();
    const { userId, title, description, category, emoji } = req.body;
    if (!userId || !title) return res.status(400).json({ error: 'userId and title are required' });

    const achievement = {
      id: uuidv4(),
      userId,
      title,
      description: description || '',
      category: category || 'personal',
      emoji: emoji || '🏆',
      reactions: {},
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.achievements) state.achievements = [];
    state.achievements.push(achievement);

    // Check for new milestones after logging
    const milestones = checkAllMilestones(userId);

    await saveState(state);
    res.status(201).json({ success: true, achievement, milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /achievements/:id/react - react to achievement
router.post('/:id/react', async (req, res) => {
  try {
    const state = loadState();
    const { userId, reaction } = req.body;
    if (!userId || !reaction) return res.status(400).json({ error: 'userId and reaction are required' });

    const achievement = state.achievements?.find((a) => a.id === req.params.id);
    if (!achievement) return res.status(404).json({ error: 'Achievement not found' });

    if (!achievement.reactions) achievement.reactions = {};
    if (!achievement.reactions[reaction]) achievement.reactions[reaction] = [];

    const userIdx = achievement.reactions[reaction].indexOf(userId);
    if (userIdx === -1) {
      achievement.reactions[reaction].push(userId);
    } else {
      achievement.reactions[reaction].splice(userIdx, 1);
      if (achievement.reactions[reaction].length === 0) {
        delete achievement.reactions[reaction];
      }
    }

    achievement.updatedAt = new Date().toISOString();
    await saveState(state);
    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /achievements/:id/comment - comment on achievement
router.post('/:id/comment', async (req, res) => {
  try {
    const state = loadState();
    const { userId, text } = req.body;
    if (!userId || !text) return res.status(400).json({ error: 'userId and text are required' });

    const achievement = state.achievements?.find((a) => a.id === req.params.id);
    if (!achievement) return res.status(404).json({ error: 'Achievement not found' });

    const comment = {
      id: uuidv4(),
      userId,
      text,
      createdAt: new Date().toISOString()
    };

    if (!achievement.comments) achievement.comments = [];
    achievement.comments.push(comment);
    achievement.updatedAt = new Date().toISOString();

    await saveState(state);
    res.status(201).json({ success: true, comment, achievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /achievements/milestones - check milestones for a user
router.get('/milestones', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const milestones = checkAllMilestones(userId);
    res.json({ success: true, milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /achievements/:id
router.delete('/:id', async (req, res) => {
  try {
    const state = loadState();
    const idx = state.achievements?.findIndex((a) => a.id === req.params.id);
    if (idx === -1 || idx === undefined) return res.status(404).json({ error: 'Achievement not found' });

    const deleted = state.achievements.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
