import { MOODS } from './constants';

/**
 * Calculate stress score (0-10) from wellness data.
 */
export function calculateStressScore(data) {
  if (!data) return 5;

  let score = 5;

  if (typeof data.moodScore === 'number') {
    score = 10 - data.moodScore;
  }

  if (typeof data.stressLevel === 'number') {
    score = (score + data.stressLevel) / 2;
  }

  if (data.missedTasks && data.missedTasks > 0) {
    score += Math.min(data.missedTasks * 0.5, 3);
  }

  if (data.noGratitude) score += 0.5;
  if (data.badSleep) score += 1;
  if (data.noExercise) score += 0.5;

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}

/**
 * Get mood trend from array of mood entries.
 * Returns: 'improving' | 'declining' | 'stable' | 'insufficient_data'
 */
export function getMoodTrend(moodData) {
  if (!moodData || moodData.length < 3) return 'insufficient_data';

  const scores = moodData
    .slice(-7) // Last 7 entries
    .map((e) => e.moodScore || 5);

  if (scores.length < 3) return 'insufficient_data';

  const half = Math.floor(scores.length / 2);
  const firstHalfAvg = scores.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const secondHalfAvg = scores.slice(half).reduce((a, b) => a + b, 0) / (scores.length - half);

  const diff = secondHalfAvg - firstHalfAvg;

  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

/**
 * Get wellness tip based on stress score.
 */
export function getWellnessTip(score) {
  const tips = {
    low: [
      'You are doing great! Keep up the positive habits.',
      'Share your positive energy with the family today!',
      'Great time to try something new and fun!'
    ],
    medium: [
      'Take a few deep breaths and drink some water.',
      'A short walk outside can do wonders for your mood.',
      'Write down one thing you are grateful for right now.'
    ],
    high: [
      'Remember: it is okay to ask for help. You do not have to do everything alone.',
      'Focus on just one task at a time. You have got this.',
      'Take a break - even 10 minutes of rest can reset your energy.'
    ]
  };

  if (score <= 3) return tips.low[Math.floor(Math.random() * tips.low.length)];
  if (score <= 6) return tips.medium[Math.floor(Math.random() * tips.medium.length)];
  return tips.high[Math.floor(Math.random() * tips.high.length)];
}

/**
 * Get mood emoji from score (0-10 scale).
 */
export function getMoodEmoji(score) {
  const idx = Math.min(Math.max(Math.round(score) - 1, 0), MOODS.length - 1);
  return MOODS[idx] || '😐';
}

/**
 * Calculate average mood from entries.
 */
export function getAverageMood(moodEntries) {
  if (!moodEntries || moodEntries.length === 0) return null;
  const sum = moodEntries.reduce((acc, e) => acc + (e.moodScore || 5), 0);
  return Math.round((sum / moodEntries.length) * 10) / 10;
}

/**
 * Get wellness color based on score.
 */
export function getWellnessColor(score) {
  if (score <= 3) return '#22c55e'; // Green - good
  if (score <= 5) return '#eab308'; // Yellow - okay
  if (score <= 7) return '#f97316'; // Orange - stressed
  return '#ef4444'; // Red - high stress
}

/**
 * Get gratitude streak (consecutive days with entries).
 */
export function getGratitudeStreak(gratitudeLog, userId) {
  if (!gratitudeLog || gratitudeLog.length === 0) return 0;

  const userEntries = gratitudeLog
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (userEntries.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < userEntries.length; i++) {
    const entryDate = new Date(userEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((currentDate - entryDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === streak) {
      streak++;
      currentDate = new Date(entryDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
