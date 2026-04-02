import { DAY_NAMES } from './constants';

/**
 * Check if the given date falls in an exam period.
 */
export function isExamPeriod(date, schoolCalendar) {
  if (!schoolCalendar?.examPeriods?.length) return false;

  const d = date instanceof Date ? date : new Date(date);
  return schoolCalendar.examPeriods.some((period) => {
    const start = new Date(period.start);
    const end = new Date(period.end);
    return d >= start && d <= end;
  });
}

/**
 * Check if the student has sports on a given date.
 */
export function hasSportsToday(userId, date, users) {
  const user = users?.[userId];
  if (!user?.sportsSchedule) return null;

  const dayName = DAY_NAMES[date.getDay()];
  const sportsEntry = user.sportsSchedule.find((s) => s.day === dayName);

  if (!sportsEntry || !sportsEntry.sport) return null;

  return sportsEntry;
}

/**
 * Get school alerts for a user for a given date.
 */
export function getSchoolAlert(userId, date, users) {
  const user = users?.[userId];
  if (!user || user.role !== 'student') return [];

  const alerts = [];
  const dayName = DAY_NAMES[date.getDay()];

  // Check if school day
  if (user.schoolDays && !user.schoolDays.includes(dayName)) {
    alerts.push({ type: 'noSchool', message: 'No school today' });
  }

  // Check exam period
  if (isExamPeriod(date, user.schoolCalendar)) {
    alerts.push({ type: 'exam', message: 'Exam period - reduce chore load', priority: 'high' });
  }

  // Check sports
  const sports = hasSportsToday(userId, date, users);
  if (sports) {
    alerts.push({
      type: 'sports',
      message: `${sports.sport} from ${sports.startTime} to ${sports.endTime}`,
      sport: sports.sport,
      startTime: sports.startTime,
      endTime: sports.endTime
    });
  }

  // Check academic events
  if (user.academicEvents?.length) {
    const todayEvents = user.academicEvents.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === date.toDateString();
    });
    todayEvents.forEach((event) => {
      alerts.push({ type: 'academic', message: event.title || event.description, event });
    });
  }

  return alerts;
}

/**
 * Get suggested chore time considering school schedule.
 */
export function getSuggestedChoreTime(userId, date, users) {
  const sports = hasSportsToday(userId, date, users);
  const dayName = DAY_NAMES[date.getDay()];
  const user = users?.[userId];
  const isSchoolDay = user?.schoolDays?.includes(dayName);

  if (!isSchoolDay) {
    return { start: '09:00', end: '11:00', note: 'Weekend - morning chores' };
  }

  if (sports) {
    const endHour = parseInt(sports.endTime?.split(':')[0] || '17');
    const afterSports = `${endHour + 1}:00`;
    return { start: afterSports, end: '19:00', note: `After ${sports.sport}` };
  }

  return { start: '17:00', end: '19:00', note: 'After school' };
}
