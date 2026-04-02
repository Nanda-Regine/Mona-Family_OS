'use strict';

/**
 * Merge client changes into server state using timestamp-based last-write-wins.
 * clientChanges: { tasks?, routines?, groceryList?, wellness?, achievements?, users?, rotationSchedule? }
 * Each item should carry a `updatedAt` ISO string.
 */
function resolveConflicts(serverState, clientChanges) {
  const merged = JSON.parse(JSON.stringify(serverState));

  if (!clientChanges || typeof clientChanges !== 'object') return merged;

  // Merge tasks array
  if (Array.isArray(clientChanges.tasks)) {
    clientChanges.tasks.forEach((clientTask) => {
      const idx = merged.tasks.findIndex((t) => t.id === clientTask.id);
      if (idx === -1) {
        merged.tasks.push(clientTask);
      } else {
        const serverTask = merged.tasks[idx];
        const serverTime = serverTask.updatedAt ? new Date(serverTask.updatedAt).getTime() : 0;
        const clientTime = clientTask.updatedAt ? new Date(clientTask.updatedAt).getTime() : 0;
        if (clientTime >= serverTime) {
          merged.tasks[idx] = clientTask;
        }
      }
    });

    // Handle deletions flagged with _deleted
    const deletedIds = clientChanges.tasks.filter((t) => t._deleted).map((t) => t.id);
    if (deletedIds.length > 0) {
      merged.tasks = merged.tasks.filter((t) => !deletedIds.includes(t.id));
    }
  }

  // Merge routines
  if (Array.isArray(clientChanges.routines)) {
    clientChanges.routines.forEach((clientRoutine) => {
      const idx = merged.routines.findIndex((r) => r.id === clientRoutine.id);
      if (idx === -1) {
        merged.routines.push(clientRoutine);
      } else {
        const serverTime = merged.routines[idx].updatedAt
          ? new Date(merged.routines[idx].updatedAt).getTime()
          : 0;
        const clientTime = clientRoutine.updatedAt
          ? new Date(clientRoutine.updatedAt).getTime()
          : 0;
        if (clientTime >= serverTime) {
          merged.routines[idx] = clientRoutine;
        }
      }
    });
  }

  // Merge groceryList
  if (clientChanges.groceryList && Array.isArray(clientChanges.groceryList.items)) {
    if (!merged.groceryList) merged.groceryList = { items: [] };
    clientChanges.groceryList.items.forEach((clientItem) => {
      const idx = merged.groceryList.items.findIndex((i) => i.id === clientItem.id);
      if (idx === -1) {
        merged.groceryList.items.push(clientItem);
      } else {
        const serverTime = merged.groceryList.items[idx].updatedAt
          ? new Date(merged.groceryList.items[idx].updatedAt).getTime()
          : 0;
        const clientTime = clientItem.updatedAt ? new Date(clientItem.updatedAt).getTime() : 0;
        if (clientTime >= serverTime) {
          merged.groceryList.items[idx] = clientItem;
        }
      }
    });
    // Deletions
    const deletedGrocery = clientChanges.groceryList.items
      .filter((i) => i._deleted)
      .map((i) => i.id);
    if (deletedGrocery.length > 0) {
      merged.groceryList.items = merged.groceryList.items.filter(
        (i) => !deletedGrocery.includes(i.id)
      );
    }
  }

  // Merge wellness
  if (clientChanges.wellness && typeof clientChanges.wellness === 'object') {
    if (!merged.wellness) merged.wellness = {};
    const wKeys = ['gratitudeLog', 'moodTracker', 'stressIndicators', 'meditationReminders'];
    wKeys.forEach((key) => {
      if (Array.isArray(clientChanges.wellness[key])) {
        if (!Array.isArray(merged.wellness[key])) merged.wellness[key] = [];
        clientChanges.wellness[key].forEach((clientEntry) => {
          const idx = merged.wellness[key].findIndex((e) => e.id === clientEntry.id);
          if (idx === -1) {
            merged.wellness[key].push(clientEntry);
          } else {
            const sTime = merged.wellness[key][idx].updatedAt
              ? new Date(merged.wellness[key][idx].updatedAt).getTime()
              : 0;
            const cTime = clientEntry.updatedAt ? new Date(clientEntry.updatedAt).getTime() : 0;
            if (cTime >= sTime) merged.wellness[key][idx] = clientEntry;
          }
        });
      }
    });
  }

  // Merge achievements
  if (Array.isArray(clientChanges.achievements)) {
    clientChanges.achievements.forEach((clientAch) => {
      const idx = merged.achievements.findIndex((a) => a.id === clientAch.id);
      if (idx === -1) {
        merged.achievements.push(clientAch);
      } else {
        const sTime = merged.achievements[idx].updatedAt
          ? new Date(merged.achievements[idx].updatedAt).getTime()
          : 0;
        const cTime = clientAch.updatedAt ? new Date(clientAch.updatedAt).getTime() : 0;
        if (cTime >= sTime) merged.achievements[idx] = clientAch;
      }
    });
  }

  // Merge user preferences (non-destructive)
  if (clientChanges.users && typeof clientChanges.users === 'object') {
    Object.keys(clientChanges.users).forEach((userId) => {
      if (merged.users[userId]) {
        const clientUser = clientChanges.users[userId];
        const sTime = merged.users[userId].updatedAt
          ? new Date(merged.users[userId].updatedAt).getTime()
          : 0;
        const cTime = clientUser.updatedAt ? new Date(clientUser.updatedAt).getTime() : 0;
        if (cTime >= sTime) {
          merged.users[userId] = { ...merged.users[userId], ...clientUser };
        }
      }
    });
  }

  return merged;
}

module.exports = { resolveConflicts };
