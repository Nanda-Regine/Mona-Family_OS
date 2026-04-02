/**
 * Client-side sync utilities.
 * Handles merging local changes with server state.
 */

/**
 * Merge local state with remote server state.
 * Uses timestamp-based last-write-wins.
 */
export function mergeChanges(local, remote) {
  if (!local) return remote;
  if (!remote) return local;

  const merged = { ...remote };

  // Merge arrays using timestamps
  const arrayKeys = ['tasks', 'routines', 'achievements'];
  arrayKeys.forEach((key) => {
    if (!Array.isArray(local[key]) || !Array.isArray(remote[key])) return;

    const localMap = {};
    local[key].forEach((item) => { localMap[item.id] = item; });

    const remoteMap = {};
    remote[key].forEach((item) => { remoteMap[item.id] = item; });

    const allIds = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
    merged[key] = [];

    allIds.forEach((id) => {
      const localItem = localMap[id];
      const remoteItem = remoteMap[id];

      if (!localItem) {
        merged[key].push(remoteItem);
      } else if (!remoteItem) {
        merged[key].push(localItem);
      } else {
        // Last write wins
        const localTime = localItem.updatedAt ? new Date(localItem.updatedAt).getTime() : 0;
        const remoteTime = remoteItem.updatedAt ? new Date(remoteItem.updatedAt).getTime() : 0;
        merged[key].push(localTime >= remoteTime ? localItem : remoteItem);
      }
    });
  });

  return merged;
}

/**
 * Create a delta (diff) between old and new state.
 * Returns only changed items.
 */
export function createDelta(oldState, newState) {
  if (!oldState || !newState) return newState;

  const delta = {};

  const arrayKeys = ['tasks', 'routines', 'achievements'];
  arrayKeys.forEach((key) => {
    const oldArr = oldState[key] || [];
    const newArr = newState[key] || [];

    const oldMap = {};
    oldArr.forEach((item) => { oldMap[item.id] = item; });

    const changed = newArr.filter((item) => {
      const oldItem = oldMap[item.id];
      if (!oldItem) return true; // New item
      return JSON.stringify(oldItem) !== JSON.stringify(item); // Changed item
    });

    if (changed.length > 0) delta[key] = changed;
  });

  // Check grocery list changes
  if (newState.groceryList && oldState.groceryList) {
    const oldItems = oldState.groceryList.items || [];
    const newItems = newState.groceryList.items || [];
    if (JSON.stringify(oldItems) !== JSON.stringify(newItems)) {
      delta.groceryList = newState.groceryList;
    }
  } else if (newState.groceryList) {
    delta.groceryList = newState.groceryList;
  }

  // Check wellness changes
  if (newState.wellness && oldState.wellness) {
    const wChanged = JSON.stringify(newState.wellness) !== JSON.stringify(oldState.wellness);
    if (wChanged) delta.wellness = newState.wellness;
  }

  return delta;
}

/**
 * Apply a delta to an existing state.
 */
export function applyDelta(state, delta) {
  if (!delta || Object.keys(delta).length === 0) return state;

  const newState = { ...state };

  const arrayKeys = ['tasks', 'routines', 'achievements'];
  arrayKeys.forEach((key) => {
    if (!delta[key]) return;

    const existing = [...(newState[key] || [])];
    delta[key].forEach((deltaItem) => {
      const idx = existing.findIndex((i) => i.id === deltaItem.id);
      if (idx === -1) {
        existing.push(deltaItem);
      } else {
        const existingTime = existing[idx].updatedAt
          ? new Date(existing[idx].updatedAt).getTime()
          : 0;
        const deltaTime = deltaItem.updatedAt ? new Date(deltaItem.updatedAt).getTime() : 0;
        if (deltaTime >= existingTime) {
          existing[idx] = deltaItem;
        }
      }
    });
    newState[key] = existing;
  });

  if (delta.groceryList) newState.groceryList = delta.groceryList;
  if (delta.wellness) newState.wellness = delta.wellness;

  return newState;
}

/**
 * Prepare offline queue entry.
 */
export function createQueueEntry(type, data) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    data,
    timestamp: new Date().toISOString(),
    retries: 0
  };
}
