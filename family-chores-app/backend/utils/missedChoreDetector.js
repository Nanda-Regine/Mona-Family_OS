'use strict';

/**
 * Detect overdue (missed) tasks for a given user.
 * A task is missed if:
 *  - It is not completed
 *  - Its dueDate is in the past (before today's start)
 *  - It belongs to the specified userId (or userId is null for all users)
 */
function detectMissed(tasks, userId) {
  if (!Array.isArray(tasks)) return [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return tasks.filter((task) => {
    if (task.completed) return false;
    if (userId && task.assignedTo !== userId) return false;
    if (!task.dueDate) return false;

    const dueTime = new Date(task.dueDate).getTime();
    return dueTime < todayStart;
  });
}

/**
 * Get a summary of missed chores grouped by user.
 */
function getMissedSummary(tasks) {
  const missed = detectMissed(tasks, null);
  const summary = {};
  missed.forEach((task) => {
    const userId = task.assignedTo || 'unassigned';
    if (!summary[userId]) summary[userId] = [];
    summary[userId].push(task);
  });
  return summary;
}

/**
 * Flag urgency level for a missed task.
 * Returns: 'low' | 'medium' | 'high' | 'critical'
 */
function getUrgency(task) {
  if (!task.dueDate) return 'low';
  const now = Date.now();
  const due = new Date(task.dueDate).getTime();
  const daysMissed = Math.floor((now - due) / (1000 * 60 * 60 * 24));

  if (daysMissed >= 3) return 'critical';
  if (daysMissed >= 2) return 'high';
  if (daysMissed >= 1) return 'medium';
  return 'low';
}

module.exports = { detectMissed, getMissedSummary, getUrgency };
