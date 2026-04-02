import React, { useState, useEffect } from 'react';
import { useWellness } from '../hooks/useWellness';
import { MOODS } from '../utils/constants';
import { getMoodEmoji, getWellnessTip, getGratitudeStreak } from '../utils/wellnessLogic';
import { formatRelativeTime } from '../utils/dateHelpers';

// ─── Gratitude Log ────────────────────────────────────────────────────────────
function GratitudeLog({ currentUser }) {
  const { gratitudeLog, loading, logGratitude, loadGratitudeLog } = useWellness();
  const [entries, setEntries] = useState(['', '', '']);
  const [mood, setMood] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadGratitudeLog(currentUser, 10);
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    const validEntries = entries.filter((e) => e.trim());
    if (validEntries.length === 0) return;

    setSubmitting(true);
    const result = await logGratitude(validEntries, mood, currentUser);
    if (result) {
      setSuccess(true);
      setEntries(['', '', '']);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  }

  const streak = getGratitudeStreak(gratitudeLog, currentUser);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span>🙏</span> Gratitude Journal
        </h3>
        {streak > 0 && (
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
            🔥 {streak} day streak
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <p className="text-sm text-gray-500">3 things I'm grateful for today:</p>
        {entries.map((entry, idx) => (
          <input
            key={idx}
            type="text"
            value={entry}
            onChange={(e) => {
              const updated = [...entries];
              updated[idx] = e.target.value;
              setEntries(updated);
            }}
            placeholder={`Grateful for #${idx + 1}...`}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 min-h-touch"
            aria-label={`Gratitude entry ${idx + 1}`}
          />
        ))}

        {/* Mood selector */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Mood: {getMoodEmoji(mood)}</p>
          <input
            type="range"
            min={1} max={10} value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full"
            aria-label={`Mood rating: ${mood} out of 10`}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>😢 Low</span>
            <span>🥳 Great</span>
          </div>
        </div>

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded" role="status">
            ✅ Gratitude logged! Keep up the beautiful practice.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || entries.every((e) => !e.trim())}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 min-h-touch"
        >
          {submitting ? 'Saving...' : '💚 Save Gratitude'}
        </button>
      </form>

      {/* Recent entries */}
      {gratitudeLog.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent</h4>
          {gratitudeLog.slice(0, 3).map((log) => (
            <div key={log.id} className="text-xs text-gray-500 mb-1">
              <span className="text-gray-400">{formatRelativeTime(log.date)}</span>
              {' — '}{log.entries?.slice(0, 2).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mood Tracker ─────────────────────────────────────────────────────────────
function MoodTracker({ currentUser }) {
  const { logMood, loading } = useWellness();
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (selectedMood === null) return;

    await logMood({
      userId: currentUser,
      mood: MOODS[selectedMood],
      moodScore: selectedMood + 1,
      notes
    });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setSelectedMood(null); setNotes(''); }, 3000);
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>😊</span> How are you feeling?
      </h3>

      {submitted ? (
        <div className="text-center py-4 text-green-600">
          <div className="text-3xl mb-1">{selectedMood !== null ? MOODS[selectedMood] : '💚'}</div>
          <p className="font-medium">Mood logged! Thank you for checking in.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-1 mb-3" role="group" aria-label="Select your mood">
            {MOODS.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMood(idx)}
                className={`text-2xl p-2 rounded-lg border-2 transition-all touch-target ${
                  selectedMood === idx
                    ? 'border-blue-500 bg-blue-50 scale-110'
                    : 'border-transparent hover:border-gray-200'
                }`}
                aria-label={`Mood: ${idx + 1} out of 10 (${emoji})`}
                aria-pressed={selectedMood === idx}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to note? (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Optional mood notes"
          />
          <button
            onClick={handleSubmit}
            disabled={selectedMood === null || loading}
            className="w-full mt-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 min-h-touch"
          >
            {loading ? 'Saving...' : 'Log Mood'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Meditation Reminder ───────────────────────────────────────────────────────
function MeditationReminder({ currentUser }) {
  const { addMeditationReminder } = useWellness();
  const [time, setTime] = useState('07:00');
  const [duration, setDuration] = useState(10);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await addMeditationReminder(currentUser, time, null, duration);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>🧘</span> Meditation Reminder
      </h3>
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500" htmlFor="med-time">Time</label>
          <input
            id="med-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500" htmlFor="med-duration">Duration (min)</label>
          <select
            id="med-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
          >
            {[5, 10, 15, 20, 30].map((d) => (
              <option key={d} value={d}>{d} minutes</option>
            ))}
          </select>
        </div>
      </div>
      {saved && <div className="text-green-600 text-sm mb-2">✅ Reminder set!</div>}
      <button
        onClick={handleSave}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 min-h-touch"
      >
        Set Reminder
      </button>
    </div>
  );
}

// ─── Stress Detector ──────────────────────────────────────────────────────────
function StressDetector({ currentUser }) {
  const { stressData, getStressCheck, logStress } = useWellness();
  const [loading, setLoading] = useState(false);
  const [stressLevel, setStressLevel] = useState(5);
  const [logged, setLogged] = useState(false);

  async function checkStress() {
    setLoading(true);
    await getStressCheck(currentUser);
    setLoading(false);
  }

  async function handleLogStress() {
    await logStress(currentUser, stressLevel, [], '');
    setLogged(true);
    await checkStress();
    setTimeout(() => setLogged(false), 3000);
  }

  const rec = stressData?.recommendation;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>💆</span> Stress Check
      </h3>

      <div className="mb-3">
        <label className="text-sm text-gray-600 block mb-2">
          Current stress level: <strong>{stressLevel}/10</strong>
        </label>
        <input
          type="range"
          min={1} max={10} value={stressLevel}
          onChange={(e) => setStressLevel(Number(e.target.value))}
          className="w-full"
          aria-label={`Stress level: ${stressLevel} out of 10`}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>😌 Calm</span>
          <span>😰 Overwhelmed</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLogStress}
          className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 min-h-touch"
        >
          {logged ? '✅ Logged' : 'Log Stress'}
        </button>
        <button
          onClick={checkStress}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 min-h-touch"
        >
          {loading ? '...' : 'Get Tips'}
        </button>
      </div>

      {rec && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            rec.level === 'excellent' ? 'bg-green-50 text-green-800' :
            rec.level === 'good' ? 'bg-blue-50 text-blue-800' :
            rec.level === 'moderate' ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}
          role="status"
        >
          <p className="font-semibold mb-1">{rec.emoji} {rec.message}</p>
          <ul className="list-disc list-inside space-y-1">
            {rec.suggestions?.slice(0, 3).map((s, i) => (
              <li key={i} className="text-xs">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main WellnessCenter Component ────────────────────────────────────────────
export default function WellnessCenter({ currentUser }) {
  const [activeTab, setActiveTab] = useState('gratitude');

  const tabs = [
    { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
    { id: 'mood', label: 'Mood', emoji: '😊' },
    { id: 'stress', label: 'Stress', emoji: '💆' },
    { id: 'meditation', label: 'Meditate', emoji: '🧘' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 min-h-touch ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'gratitude' && <GratitudeLog currentUser={currentUser} />}
        {activeTab === 'mood' && <MoodTracker currentUser={currentUser} />}
        {activeTab === 'stress' && <StressDetector currentUser={currentUser} />}
        {activeTab === 'meditation' && <MeditationReminder currentUser={currentUser} />}
      </div>
    </div>
  );
}
