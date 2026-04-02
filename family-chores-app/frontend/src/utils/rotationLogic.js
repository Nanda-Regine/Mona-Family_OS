import { DAY_NAMES } from './constants';

const COOKING_ORDER = ['tabile', 'nanda', 'dad', 'mom'];
const DISHES_ORDER = ['nanda', 'tabile', 'mom', 'dad'];

/**
 * Get rotation assignment for a specific date based on server state.
 */
export function getRotationForDay(date, rotationSchedule) {
  if (!rotationSchedule) {
    return { cook: 'tabile', dishes: 'nanda' };
  }
  return {
    cook: rotationSchedule.cooking?.current || 'tabile',
    dishes: rotationSchedule.dishes?.current || 'nanda'
  };
}

/**
 * Get today's cook from rotation state.
 */
export function getTodaysCook(rotationSchedule) {
  return rotationSchedule?.cooking?.current || 'tabile';
}

/**
 * Get who does dishes today.
 */
export function getTodaysDishes(rotationSchedule) {
  return rotationSchedule?.dishes?.current || 'nanda';
}

/**
 * Get next person in cooking rotation.
 */
export function getNextCook(rotationSchedule) {
  return rotationSchedule?.cooking?.next || 'nanda';
}

/**
 * Get next person in dishes rotation.
 */
export function getNextDishes(rotationSchedule) {
  return rotationSchedule?.dishes?.next || 'tabile';
}

/**
 * Format rotation display string.
 */
export function formatRotationDisplay(rotationSchedule, users) {
  const cookId = getTodaysCook(rotationSchedule);
  const dishesId = getTodaysDishes(rotationSchedule);

  const cookName = users?.[cookId]?.name || cookId;
  const dishesName = users?.[dishesId]?.name || dishesId;

  return {
    cook: { id: cookId, name: cookName },
    dishes: { id: dishesId, name: dishesName }
  };
}

/**
 * Get the full rotation schedule display for the week.
 */
export function getWeeklyRotation(rotationSchedule) {
  const cookCurrent = rotationSchedule?.cooking?.current || 'tabile';
  const dishesCurrent = rotationSchedule?.dishes?.current || 'nanda';

  const cookIdx = COOKING_ORDER.indexOf(cookCurrent);
  const dishesIdx = DISHES_ORDER.indexOf(dishesCurrent);

  return DAY_NAMES.map((day, i) => ({
    day,
    cook: COOKING_ORDER[(cookIdx + i) % COOKING_ORDER.length],
    dishes: DISHES_ORDER[(dishesIdx + i) % DISHES_ORDER.length]
  }));
}
