'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');

// GET /custom-items/:userId - get custom items for a user
router.get('/:userId', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.params;
    const user = state.users[userId];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const customItems = user.customItems || [];
    res.json({ success: true, customItems, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /custom-items - add custom item for a user
router.post('/', async (req, res) => {
  try {
    const state = loadState();
    const { userId, title, description, category, schedule, priority } = req.body;
    if (!userId || !title) return res.status(400).json({ error: 'userId and title are required' });

    const user = state.users[userId];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const item = {
      id: uuidv4(),
      userId,
      title,
      description: description || '',
      category: category || 'general',
      schedule: schedule || null,
      priority: priority || 'normal',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!user.customItems) user.customItems = [];
    user.customItems.push(item);

    await saveState(state);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /custom-items/:id - update custom item
router.put('/:id', async (req, res) => {
  try {
    const state = loadState();
    const { id } = req.params;

    let found = null;
    Object.keys(state.users).forEach((userId) => {
      const user = state.users[userId];
      if (!user.customItems) return;
      const idx = user.customItems.findIndex((i) => i.id === id);
      if (idx !== -1) {
        user.customItems[idx] = { ...user.customItems[idx], ...req.body, id, updatedAt: new Date().toISOString() };
        found = user.customItems[idx];
      }
    });

    if (!found) return res.status(404).json({ error: 'Custom item not found' });

    await saveState(state);
    res.json({ success: true, item: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /custom-items/:id - delete custom item
router.delete('/:id', async (req, res) => {
  try {
    const state = loadState();
    const { id } = req.params;

    let deleted = null;
    Object.keys(state.users).forEach((userId) => {
      const user = state.users[userId];
      if (!user.customItems) return;
      const idx = user.customItems.findIndex((i) => i.id === id);
      if (idx !== -1) {
        deleted = user.customItems.splice(idx, 1)[0];
      }
    });

    if (!deleted) return res.status(404).json({ error: 'Custom item not found' });

    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
