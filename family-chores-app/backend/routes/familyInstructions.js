'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');

// GET /instructions - get all family instructions
router.get('/', (req, res) => {
  try {
    const state = loadState();
    const { authorId, targetId, type } = req.query;
    let instructions = state.familyInstructions || [];

    if (authorId) instructions = instructions.filter((i) => i.authorId === authorId);
    if (targetId) instructions = instructions.filter(
      (i) => !i.targetId || i.targetId === targetId || i.targetId === 'all'
    );
    if (type) instructions = instructions.filter((i) => i.type === type);

    instructions = instructions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, instructions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /instructions - create new instruction
router.post('/', async (req, res) => {
  try {
    const state = loadState();
    const { authorId, targetId, title, content, type, priority, recurring, days } = req.body;

    if (!authorId || !title || !content) {
      return res.status(400).json({ error: 'authorId, title, and content are required' });
    }

    // Check author is a parent or adult
    const author = state.users[authorId];
    if (!author) return res.status(404).json({ error: 'Author not found' });
    if (!['parent', 'adult'].includes(author.role)) {
      return res.status(403).json({ error: 'Only parents and adults can create instructions' });
    }

    const instruction = {
      id: uuidv4(),
      authorId,
      targetId: targetId || 'all',
      title,
      content,
      type: type || 'general',
      priority: priority || 'normal',
      recurring: recurring || false,
      days: days || [],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.familyInstructions) state.familyInstructions = [];
    state.familyInstructions.push(instruction);

    await saveState(state);
    res.status(201).json({ success: true, instruction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /instructions/:id - update instruction
router.put('/:id', async (req, res) => {
  try {
    const state = loadState();
    const instructions = state.familyInstructions || [];
    const idx = instructions.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Instruction not found' });

    instructions[idx] = {
      ...instructions[idx],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };

    await saveState(state);
    res.json({ success: true, instruction: instructions[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /instructions/:id - delete instruction
router.delete('/:id', async (req, res) => {
  try {
    const state = loadState();
    const instructions = state.familyInstructions || [];
    const idx = instructions.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Instruction not found' });

    const deleted = instructions.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
