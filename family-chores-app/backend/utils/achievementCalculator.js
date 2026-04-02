'use strict';

const { loadState } = require('./stateManager');

/**
 * Check streak milestones for a user.
 * Returns array of milestone objects if new milestones reached.
 */
function checkStreaks(userId) {
  const state = loadState();
  const user = state.users[userId];
  if (!user) return [];

  const milestones = [];
  const streaks = user.streaks || {};

  Object.entries(streaks).forEach(([streakName, count]) => {
    if (count === 3) {
      milestones.push({ type: 'streak', userId, streakName, count, title: `3-day ${streakName} streak!` });
    } else if (count === 7) {
      milestones.push({ type: 'streak', userId, streakName, count, title: `One week ${streakName} streak!` });
    } else if (count === 30) {
      milestones.push({ type: 'streak', userId, streakName, count, title: `One month ${streakName} streak!` });
    } else if (count > 0 && count % 10 === 0) {
      milestones.push({ type: 'streak', userId, streakName, count, title: `${count}-day ${streakName} streak!` });
    }
  });

  return milestones;
}

/**
 * Check if a user had a perfect week (all tasks completed).
 */
function checkPerfectWeek(userId) {
  const state = loadState();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const userTasks = state.tasks.filter((t) => {
    if (t.assignedTo !== userId) return false;
    const due = t.dueDate ? new Date(t.dueDate) : null;
    return due && due >= weekStart && due <= now;
  });

  if (userTasks.length === 0) return null;

  const allCompleted = userTasks.every((t) => t.completed);
  if (allCompleted) {
    return {
      type: 'perfect_week',
      userId,
      taskCount: userTasks.length,
      title: 'Perfect Week! All tasks completed!'
    };
  }
  return null;
}

/**
 * Check consistency: has user completed tasks for 5+ days in a row?
 */
function checkConsistency(userId) {
  const state = loadState();
  const completedTasks = state.tasks
    .filter((t) => t.assignedTo === userId && t.completed && t.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (completedTasks.length < 5) return null;

  // Check if there's at least one completion per day for the last 5 days
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 5; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayStr = day.toDateString();
    const hasCompletion = completedTasks.some(
      (t) => new Date(t.completedAt).toDateString() === dayStr
    );
    if (hasCompletion) streak++;
    else break;
  }

  if (streak >= 5) {
    return {
      type: 'consistency',
      userId,
      streak,
      title: `${streak} days of consistent task completion!`
    };
  }
  return null;
}

/**
 * Run all achievement checks for a user and return new milestones.
 */
function checkAllMilestones(userId) {
  const results = [];
  results.push(...checkStreaks(userId));

  const perfectWeek = checkPerfectWeek(userId);
  if (perfectWeek) results.push(perfectWeek);

  const consistency = checkConsistency(userId);
  if (consistency) results.push(consistency);

  return results;
}

module.exports = { checkStreaks, checkPerfectWeek, checkConsistency, checkAllMilestones };
