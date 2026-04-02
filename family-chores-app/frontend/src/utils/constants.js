export const USERS = ['mom', 'dad', 'phawu', 'tabile', 'nanda'];

export const USER_COLORS = {
  mom: '#FFA07A',
  dad: '#87CEEB',
  phawu: '#FF6B6B',
  tabile: '#98FB98',
  nanda: '#DDA0DD'
};

export const USER_NAMES = {
  mom: 'Mom',
  dad: 'Dad',
  phawu: 'Phawu',
  tabile: 'Tabile',
  nanda: 'Nanda'
};

export const USER_ROLES = {
  mom: 'parent',
  dad: 'parent',
  phawu: 'student',
  tabile: 'adult',
  nanda: 'customizer'
};

// Users who can access full customization (parents + Nanda as eldest)
export const CUSTOMIZERS = ['mom', 'dad', 'nanda'];

export const CAN_CUSTOMIZE = (userId) => CUSTOMIZERS.includes(userId);

export const CATEGORIES = ['vegetables', 'proteins', 'fruits', 'dairy', 'grains', 'other'];

export const CATEGORY_EMOJIS = {
  vegetables: '🥦',
  proteins: '🥩',
  fruits: '🍎',
  dairy: '🥛',
  grains: '🌾',
  other: '🛒'
};

export const MOODS = ['😢', '😔', '😐', '🙂', '😊', '😄', '😃', '🤩', '😁', '🥳'];

export const ACHIEVEMENT_CATEGORIES = ['academic', 'routine', 'health', 'personal', 'sport'];

export const ACHIEVEMENT_EMOJIS = {
  academic: '📚',
  routine: '✅',
  health: '💪',
  personal: '🌟',
  sport: '🏆'
};

export const SYNC_INTERVAL = 10000; // 10 seconds

export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const REACTIONS = ['❤️', '👏', '🎉', '🔥', '💪', '⭐'];

export const CHORE_CATEGORIES = ['cooking', 'cleaning', 'laundry', 'dishes', 'shopping', 'garden', 'other'];

export const PRIORITY_COLORS = {
  low: 'text-gray-500',
  normal: 'text-blue-600',
  high: 'text-orange-500',
  urgent: 'text-red-600'
};
