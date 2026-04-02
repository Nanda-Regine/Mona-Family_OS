import { DAY_NAMES } from './constants';

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

export function isToday(date) {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function getDayName(date) {
  const d = date instanceof Date ? date : new Date(date);
  return DAY_NAMES[d.getDay()];
}

export function getWeekDates(startDate = new Date()) {
  const start = new Date(startDate);
  // Start from Monday
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'never';
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatShortDate(timestamp);
}

export function formatTime(timeString) {
  // timeString is "HH:MM"
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function isFutureDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.getTime() > Date.now();
}

export function isPastDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return d.getTime() < todayStart.getTime();
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getToday() {
  return startOfDay(new Date());
}
