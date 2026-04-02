'use strict';

const { loadState } = require('./stateManager');

/**
 * Calculate stress level (0-10) for a user based on recent data.
 */
function calculateStressLevel(userId, data) {
  let stressScore = 0;
  let factors = 0;

  // Factor 1: Missed tasks (each missed task adds 1 point)
  const { tasks = [] } = loadState();
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const missedTasks = tasks.filter(
    (t) => t.assignedTo === userId && !t.completed && t.dueDate && new Date(t.dueDate) < todayStart
  );
  stressScore += Math.min(missedTasks.length * 1.5, 4);
  factors++;

  // Factor 2: Mood score (if provided, invert it)
  if (data && typeof data.mood === 'number') {
    stressScore += (10 - data.mood) * 0.3;
    factors++;
  }

  // Factor 3: Recent wellness log
  const state = loadState();
  const wellnessLog = state.wellness?.stressIndicators || [];
  const userStress = wellnessLog
    .filter((s) => s.userId === userId)
    .slice(-3);
  if (userStress.length > 0) {
    const avgStress = userStress.reduce((sum, s) => sum + (s.level || 5), 0) / userStress.length;
    stressScore += avgStress * 0.4;
    factors++;
  }

  // Factor 4: Days since last gratitude entry
  const gratitudeLog = state.wellness?.gratitudeLog || [];
  const userGratitude = gratitudeLog.filter((g) => g.userId === userId);
  if (userGratitude.length > 0) {
    const lastEntry = new Date(userGratitude[userGratitude.length - 1].date);
    const daysSince = Math.floor((now - lastEntry) / (1000 * 60 * 60 * 24));
    if (daysSince > 3) stressScore += Math.min(daysSince * 0.2, 2);
  } else {
    stressScore += 1; // No gratitude practice
  }

  const normalizedScore = Math.min(Math.round(stressScore), 10);
  return normalizedScore;
}

/**
 * Get wellness recommendation based on stress level.
 */
function getWellnessRecommendation(stressLevel) {
  if (stressLevel <= 2) {
    return {
      level: 'excellent',
      emoji: '🌟',
      message: 'You are doing wonderfully! Keep up the great balance.',
      suggestions: [
        'Celebrate your calm state with a family activity',
        'Share what is working well with the family',
        'Set a new positive challenge for yourself'
      ]
    };
  } else if (stressLevel <= 4) {
    return {
      level: 'good',
      emoji: '😊',
      message: 'You are managing well. A little self-care goes a long way.',
      suggestions: [
        'Take a 10-minute walk outside',
        'Write down 3 things you are grateful for',
        'Do a quick breathing exercise: breathe in for 4, hold for 4, out for 4'
      ]
    };
  } else if (stressLevel <= 6) {
    return {
      level: 'moderate',
      emoji: '😐',
      message: 'You seem a bit stressed. Let us ease that load together.',
      suggestions: [
        'Prioritize your top 3 tasks for today and let the rest wait',
        'Ask a family member to help with one task',
        'Take a 15-minute break: stretch, breathe, or listen to calming music',
        'Check in with how your body feels right now'
      ]
    };
  } else if (stressLevel <= 8) {
    return {
      level: 'high',
      emoji: '😟',
      message: 'Your stress seems high. It is okay to ask for help.',
      suggestions: [
        'Talk to a family member about how you are feeling',
        'Take tonight off from non-essential tasks',
        'Try a 5-minute meditation or body scan',
        'Go to bed 30 minutes earlier than usual',
        'Write out your worries to get them out of your head'
      ]
    };
  } else {
    return {
      level: 'critical',
      emoji: '🆘',
      message: 'You seem very overwhelmed. Please reach out for support.',
      suggestions: [
        'Talk to someone you trust right now',
        'Cancel or delegate as much as possible today',
        'Focus only on basic self-care: eat, rest, breathe',
        'Consider speaking with a counselor or therapist',
        'Remember: this feeling is temporary and help is available'
      ]
    };
  }
}

module.exports = { calculateStressLevel, getWellnessRecommendation };
