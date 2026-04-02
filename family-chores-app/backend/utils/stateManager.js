const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '../data/state.json');
const DEFAULT_STATE = {
  users: {},
  routines: [],
  tasks: [],
  groceryList: { items: [] },
  recipes: [],
  mealPlans: [],
  wellness: {
    gratitudeLog: [],
    moodTracker: [],
    stressIndicators: [],
    meditationReminders: []
  },
  achievements: [],
  nutritionTracking: { weeklyData: {} },
  rotationSchedule: {
    cooking: { current: 'tabile', next: 'nanda', lastUpdated: null },
    dishes: { current: 'nanda', next: 'tabile', lastUpdated: null }
  },
  lastUpdated: null,
  version: 1
};

let _state = null;
let _writing = false;
let _writeQueue = [];

function loadState() {
  if (_state) return _state;
  try {
    if (!fs.existsSync(STATE_PATH)) {
      const dir = path.dirname(STATE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STATE_PATH, JSON.stringify(DEFAULT_STATE, null, 2));
      _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    } else {
      const raw = fs.readFileSync(STATE_PATH, 'utf8');
      _state = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading state:', err);
    _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  return _state;
}

async function saveState(newState) {
  _state = newState;
  _state.lastUpdated = new Date().toISOString();

  return new Promise((resolve, reject) => {
    if (_writing) {
      _writeQueue.push({ state: JSON.parse(JSON.stringify(newState)), resolve, reject });
      return;
    }
    _writing = true;
    const data = JSON.stringify(_state, null, 2);
    fs.writeFile(STATE_PATH, data, 'utf8', (err) => {
      _writing = false;
      if (err) {
        reject(err);
      } else {
        resolve(_state);
      }
      if (_writeQueue.length > 0) {
        const next = _writeQueue.shift();
        _state = next.state;
        const nextData = JSON.stringify(_state, null, 2);
        _writing = true;
        fs.writeFile(STATE_PATH, nextData, 'utf8', (e) => {
          _writing = false;
          if (e) next.reject(e);
          else next.resolve(_state);
        });
      }
    });
  });
}

function getUser(id) {
  const state = loadState();
  return state.users[id] || null;
}

async function updateUser(id, data) {
  const state = loadState();
  if (!state.users[id]) {
    state.users[id] = { id };
  }
  state.users[id] = { ...state.users[id], ...data };
  await saveState(state);
  return state.users[id];
}

module.exports = { loadState, saveState, getUser, updateUser };
