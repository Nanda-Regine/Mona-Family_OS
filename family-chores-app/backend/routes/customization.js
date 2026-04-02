'use strict';

const express = require('express');
const router = express.Router();
const { loadState, saveState, updateUser } = require('../utils/stateManager');

// GET /customization/schedule - get schedule customization
router.get('/schedule', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;

    if (userId) {
      const user = state.users[userId];
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ success: true, schedule: user.customSchedule || {} });
    }

    // Return all users' schedules
    const schedules = {};
    Object.keys(state.users).forEach((id) => {
      schedules[id] = state.users[id].customSchedule || {};
    });
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customization/schedule - update schedule
router.post('/schedule', async (req, res) => {
  try {
    const { userId, ...scheduleData } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const updated = await updateUser(userId, {
      customSchedule: scheduleData,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, schedule: updated.customSchedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /customization/accessibility - get accessibility settings
router.get('/accessibility', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;

    if (userId) {
      const user = state.users[userId];
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ success: true, accessibility: user.accessibility || {} });
    }

    const allAccessibility = {};
    Object.keys(state.users).forEach((id) => {
      allAccessibility[id] = state.users[id].accessibility || {};
    });
    res.json({ success: true, accessibility: allAccessibility });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customization/accessibility - update accessibility settings
router.post('/accessibility', async (req, res) => {
  try {
    const { userId, ...accessibilityData } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const updated = await updateUser(userId, {
      accessibility: accessibilityData,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, accessibility: updated.accessibility });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /user/:id/preferences - update user preferences
router.put('/user/:id/preferences', async (req, res) => {
  try {
    const state = loadState();
    const { id } = req.params;
    const user = state.users[id];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await updateUser(id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /customization/rotation - get rotation rules
router.get('/rotation', (req, res) => {
  try {
    const state = loadState();
    res.json({ success: true, rotationSchedule: state.rotationSchedule || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customization/rotation - update rotation rules
router.post('/rotation', async (req, res) => {
  try {
    const state = loadState();
    const { cooking, dishes } = req.body;

    if (!state.rotationSchedule) state.rotationSchedule = {};
    if (cooking) state.rotationSchedule.cooking = { ...state.rotationSchedule.cooking, ...cooking };
    if (dishes) state.rotationSchedule.dishes = { ...state.rotationSchedule.dishes, ...dishes };

    await saveState(state);
    res.json({ success: true, rotationSchedule: state.rotationSchedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - get all users
router.get('/users', (req, res) => {
  try {
    const state = loadState();
    res.json({ success: true, users: state.users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id - get single user
router.get('/users/:id', (req, res) => {
  try {
    const state = loadState();
    const user = state.users[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
