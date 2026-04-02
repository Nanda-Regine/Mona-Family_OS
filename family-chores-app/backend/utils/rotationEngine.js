'use strict';

const { loadState, saveState } = require('./stateManager');

const COOKING_ORDER = ['tabile', 'nanda', 'dad', 'mom'];
const DISHES_ORDER = ['nanda', 'tabile', 'mom', 'dad'];

function getRotation() {
  const state = loadState();
  return state.rotationSchedule || {
    cooking: { current: 'tabile', next: 'nanda', lastUpdated: null },
    dishes: { current: 'nanda', next: 'tabile', lastUpdated: null }
  };
}

async function advanceRotation(type) {
  const state = loadState();
  if (!state.rotationSchedule) {
    state.rotationSchedule = {
      cooking: { current: 'tabile', next: 'nanda', lastUpdated: null },
      dishes: { current: 'nanda', next: 'tabile', lastUpdated: null }
    };
  }

  const order = type === 'cooking' ? COOKING_ORDER : DISHES_ORDER;
  const schedule = state.rotationSchedule[type];

  const currentIdx = order.indexOf(schedule.current);
  const nextIdx = (currentIdx + 1) % order.length;
  const afterNextIdx = (nextIdx + 1) % order.length;

  schedule.current = order[nextIdx];
  schedule.next = order[afterNextIdx];
  schedule.lastUpdated = new Date().toISOString();

  await saveState(state);
  return state.rotationSchedule;
}

function getWhoCooked() {
  const rotation = getRotation();
  return rotation.cooking ? rotation.cooking.current : 'tabile';
}

function getWhoDoesDishes() {
  const rotation = getRotation();
  return rotation.dishes ? rotation.dishes.current : 'nanda';
}

function getRotationForDate(date) {
  const state = loadState();
  const rotation = state.rotationSchedule || {};
  // Determine day-of-week offset from last update
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = date.getDay();
  const dayName = dayNames[dayIndex];
  return {
    cook: rotation.cooking ? rotation.cooking.current : 'tabile',
    dishes: rotation.dishes ? rotation.dishes.current : 'nanda',
    dayName
  };
}

module.exports = { getRotation, advanceRotation, getWhoCooked, getWhoDoesDishes, getRotationForDate };
