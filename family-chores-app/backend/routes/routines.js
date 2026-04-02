'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');
const { detectMissed } = require('../utils/missedChoreDetector');

// GET /routines - all routines
router.get('/', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;
    let routines = state.routines || [];
    if (userId) {
      routines = routines.filter(
        (r) => !r.assignedTo || r.assignedTo === userId || (Array.isArray(r.assignedTo) && r.assignedTo.includes(userId))
      );
    }
    res.json({ success: true, routines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /routines - create new routine
router.post('/', async (req, res) => {
  try {
    const state = loadState();
    const routine = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body
    };
    if (!routine.title) return res.status(400).json({ error: 'Routine title is required' });

    state.routines.push(routine);
    await saveState(state);
    res.status(201).json({ success: true, routine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /routines/:id - update routine
router.put('/:id', async (req, res) => {
  try {
    const state = loadState();
    const idx = state.routines.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Routine not found' });

    state.routines[idx] = {
      ...state.routines[idx],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    await saveState(state);
    res.json({ success: true, routine: state.routines[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /routines/:id - delete routine
router.delete('/:id', async (req, res) => {
  try {
    const state = loadState();
    const idx = state.routines.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Routine not found' });

    const deleted = state.routines.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /daily - get today's tasks with completion status
router.get('/daily', (req, res) => {
  try {
    const state = loadState();
    const { userId } = req.query;
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    let tasks = state.tasks || [];

    // Filter for today
    tasks = tasks.filter((t) => {
      if (t.dueDate) {
        const due = new Date(t.dueDate);
        return due.toDateString() === today.toDateString();
      }
      if (t.recurrence && t.days && Array.isArray(t.days)) {
        return t.days.includes(todayName);
      }
      return false;
    });

    if (userId) {
      tasks = tasks.filter((t) => !t.assignedTo || t.assignedTo === userId);
    }

    const missed = detectMissed(state.tasks || [], userId || null);

    res.json({
      success: true,
      tasks,
      missed,
      today: today.toISOString(),
      dayName: todayName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /task/:id/complete - mark task as complete
router.post('/task/:id/complete', async (req, res) => {
  try {
    const state = loadState();
    const idx = state.tasks.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });

    state.tasks[idx] = {
      ...state.tasks[idx],
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedBy: req.body.completedBy || state.tasks[idx].assignedTo
    };

    await saveState(state);
    res.json({ success: true, task: state.tasks[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /task/quick-add - quickly add a task
router.post('/task/quick-add', async (req, res) => {
  try {
    const state = loadState();
    const { title, assignedTo, dueDate, category } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const task = {
      id: uuidv4(),
      title,
      assignedTo: assignedTo || null,
      dueDate: dueDate || new Date().toISOString(),
      category: category || 'general',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.tasks) state.tasks = [];
    state.tasks.push(task);
    await saveState(state);
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks - all tasks
router.get('/tasks', (req, res) => {
  try {
    const state = loadState();
    const { userId, completed } = req.query;
    let tasks = state.tasks || [];

    if (userId) tasks = tasks.filter((t) => t.assignedTo === userId);
    if (completed !== undefined) tasks = tasks.filter((t) => t.completed === (completed === 'true'));

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /task/:id
router.delete('/task/:id', async (req, res) => {
  try {
    const state = loadState();
    const idx = state.tasks.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });

    const deleted = state.tasks.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
