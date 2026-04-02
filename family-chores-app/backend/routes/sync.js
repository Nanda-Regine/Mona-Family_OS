'use strict';

const express = require('express');
const router = express.Router();
const { loadState, saveState } = require('../utils/stateManager');
const { resolveConflicts } = require('../utils/syncResolver');
const { syncRateLimit } = require('../middleware/rateLimit');

// POST /sync - merge client changes with server state, return updated state
router.post('/', syncRateLimit, async (req, res) => {
  try {
    const { deviceId, lastSync, changes } = req.body;

    const serverState = loadState();

    // If no changes, just return current server state
    if (!changes || Object.keys(changes).length === 0) {
      return res.json({
        success: true,
        state: serverState,
        serverTime: new Date().toISOString(),
        message: 'No changes to merge'
      });
    }

    // Resolve conflicts between server and client
    const mergedState = resolveConflicts(serverState, changes);

    // Save merged state
    await saveState(mergedState);

    // Calculate delta (what changed on server vs what client knew)
    let delta = null;
    if (lastSync) {
      const lastSyncTime = new Date(lastSync).getTime();
      delta = {
        tasks: mergedState.tasks.filter(
          (t) => !t.updatedAt || new Date(t.updatedAt).getTime() > lastSyncTime
        ),
        routines: mergedState.routines.filter(
          (r) => !r.updatedAt || new Date(r.updatedAt).getTime() > lastSyncTime
        ),
        achievements: mergedState.achievements.filter(
          (a) => !a.updatedAt || new Date(a.updatedAt).getTime() > lastSyncTime
        )
      };
    }

    res.json({
      success: true,
      state: mergedState,
      delta,
      serverTime: new Date().toISOString(),
      deviceId
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// GET /sync/state - get current server state
router.get('/state', (req, res) => {
  try {
    const state = loadState();
    res.json({ success: true, state, serverTime: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load state', message: err.message });
  }
});

module.exports = router;
