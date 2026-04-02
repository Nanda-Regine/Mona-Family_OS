import { DAY_NAMES } from './constants';
import { startOfDay, addDays } from './dateHelpers';

/**
 * Expand a recurring routine definition into individual daily tasks.
 */
export function expandRoutine(routine, date) {
  if (!isRoutineActiveToday(routine, date)) return [];

  const tasks = [];
  const dayName = DAY_NAMES[date.getDay()];

  if (routine.tasks && Array.isArray(routine.tasks)) {
    routine.tasks.forEach((taskTemplate) => {
      tasks.push({
        id: `${routine.id}-${date.toDateString()}-${taskTemplate.id || taskTemplate.title}`,
        title: taskTemplate.title,
        assignedTo: taskTemplate.assignedTo || routine.assignedTo,
        dueDate: date.toISOString(),
        category: taskTemplate.category || routine.category || 'general',
        routineId: routine.id,
        completed: false,
        isExpanded: true,
        timeSlot: taskTemplate.timeSlot || routine.timeSlot,
        estimatedMinutes: taskTemplate.estimatedMinutes || 15
      });
    });
  } else {
    // Simple routine without subtasks
    tasks.push({
      id: `${routine.id}-${date.toDateString()}`,
      title: routine.title,
      assignedTo: routine.assignedTo,
      dueDate: date.toISOString(),
      category: routine.category || 'general',
      routineId: routine.id,
      completed: false,
      isExpanded: true,
      timeSlot: routine.timeSlot,
      estimatedMinutes: routine.estimatedMinutes || 30
    });
  }

  return tasks;
}

/**
 * Check if a routine is active on the given date.
 */
export function isRoutineActiveToday(routine, date = new Date()) {
  if (!routine) return false;
  if (!routine.active && routine.active !== undefined) return false;

  const dayName = DAY_NAMES[date.getDay()];

  // Check recurrence type
  switch (routine.recurrence) {
    case 'daily':
      return true;

    case 'weekdays':
      return !['Saturday', 'Sunday'].includes(dayName);

    case 'weekends':
      return ['Saturday', 'Sunday'].includes(dayName);

    case 'weekly':
      // Specific days of the week
      if (Array.isArray(routine.days) && routine.days.length > 0) {
        return routine.days.includes(dayName);
      }
      // Default to same day as start date
      if (routine.startDate) {
        const startDay = DAY_NAMES[new Date(routine.startDate).getDay()];
        return dayName === startDay;
      }
      return false;

    case 'monthly':
      if (routine.dayOfMonth) {
        return date.getDate() === routine.dayOfMonth;
      }
      return date.getDate() === 1;

    case 'custom':
      if (Array.isArray(routine.days)) {
        return routine.days.includes(dayName);
      }
      return false;

    default:
      // If days array specified, use it
      if (Array.isArray(routine.days) && routine.days.length > 0) {
        return routine.days.includes(dayName);
      }
      return true; // Default: active every day
  }
}

/**
 * Generate tasks for an entire week from routines.
 */
export function generateWeekTasks(routines, startDate = new Date()) {
  const weekTasks = {};
  const start = startOfDay(startDate);

  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    const dayKey = day.toDateString();
    weekTasks[dayKey] = [];

    routines.forEach((routine) => {
      const tasks = expandRoutine(routine, day);
      weekTasks[dayKey].push(...tasks);
    });
  }

  return weekTasks;
}

/**
 * Get tasks assigned to a specific user for today.
 */
export function getTodayUserTasks(routines, tasks, userId, date = new Date()) {
  const routineTasks = routines
    .filter((r) => {
      const assignedTo = r.assignedTo;
      if (Array.isArray(assignedTo)) return assignedTo.includes(userId);
      return !assignedTo || assignedTo === userId;
    })
    .flatMap((routine) => expandRoutine(routine, date));

  const today = startOfDay(date);
  const tomorrow = addDays(today, 1);

  const standaloneTasks = (tasks || []).filter((t) => {
    if (t.assignedTo && t.assignedTo !== userId) return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= today && due < tomorrow;
  });

  return [...routineTasks, ...standaloneTasks];
}
