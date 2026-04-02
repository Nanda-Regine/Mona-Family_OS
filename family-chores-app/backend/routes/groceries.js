'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');

// GET /groceries - get full grocery list
router.get('/', (req, res) => {
  try {
    const state = loadState();
    const { category } = req.query;
    let items = state.groceryList?.items || [];
    if (category) items = items.filter((i) => i.category === category);
    res.json({ success: true, items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /groceries - add item to grocery list
router.post('/', async (req, res) => {
  try {
    const state = loadState();
    const { name, category, quantity, unit, notes, priority } = req.body;
    if (!name) return res.status(400).json({ error: 'Item name is required' });

    const item = {
      id: uuidv4(),
      name,
      category: category || 'other',
      quantity: quantity || 1,
      unit: unit || '',
      notes: notes || '',
      priority: priority || 'normal',
      checked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.groceryList) state.groceryList = { items: [] };
    state.groceryList.items.push(item);
    await saveState(state);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /groceries/:id - update grocery item
router.put('/:id', async (req, res) => {
  try {
    const state = loadState();
    const items = state.groceryList?.items || [];
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });

    items[idx] = { ...items[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    await saveState(state);
    res.json({ success: true, item: items[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /groceries/:id - remove item
router.delete('/:id', async (req, res) => {
  try {
    const state = loadState();
    if (!state.groceryList?.items) return res.status(404).json({ error: 'Item not found' });

    const idx = state.groceryList.items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });

    const deleted = state.groceryList.items.splice(idx, 1)[0];
    await saveState(state);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /groceries/:id/check - toggle checked status
router.post('/:id/check', async (req, res) => {
  try {
    const state = loadState();
    const items = state.groceryList?.items || [];
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });

    items[idx].checked = !items[idx].checked;
    items[idx].updatedAt = new Date().toISOString();
    await saveState(state);
    res.json({ success: true, item: items[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /groceries/bulk - add multiple items at once
router.post('/bulk', async (req, res) => {
  try {
    const state = loadState();
    const { items: newItems } = req.body;
    if (!Array.isArray(newItems)) return res.status(400).json({ error: 'Items must be an array' });

    if (!state.groceryList) state.groceryList = { items: [] };
    const added = newItems.map((item) => ({
      id: uuidv4(),
      name: item.name,
      category: item.category || 'other',
      quantity: item.quantity || 1,
      unit: item.unit || '',
      notes: item.notes || '',
      priority: item.priority || 'normal',
      checked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    state.groceryList.items.push(...added);
    await saveState(state);
    res.status(201).json({ success: true, added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /groceries/clear/checked - clear all checked items
router.delete('/clear/checked', async (req, res) => {
  try {
    const state = loadState();
    if (!state.groceryList?.items) return res.json({ success: true, cleared: 0 });

    const before = state.groceryList.items.length;
    state.groceryList.items = state.groceryList.items.filter((i) => !i.checked);
    const cleared = before - state.groceryList.items.length;

    await saveState(state);
    res.json({ success: true, cleared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
