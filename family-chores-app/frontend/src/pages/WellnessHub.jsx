import React, { useState, useEffect } from 'react';
import { API_BASE_URL, MOODS, USER_NAMES, USER_COLORS } from '../utils/constants';
import { useAccessibility } from '../App';

export default function WellnessHub({ currentUser }) {
  const { isHighContrast } = useAccessibility();
  const [activeTab, setActiveTab] = useState('gratitude');
  const [gratitudeEntries, setGratitudeEntries] = useState(['', '', '']);
  const [gratitudeMood, setGratitudeMood] = useState('good');
  const [moodValue, setMoodValue] = useState(7);
  const [energyValue, setEnergyValue] = useState(7);
  const [stressValue, setStressValue] = useState(3);
  const [moodNotes, setMoodNotes] = useState('');
  const [moodTrends, setMoodTrends] = useState([]);
  const [gratitudeLog, setGratitudeLog] = useState([]);
  const [stressCheck, setStressCheck] = useState(null);
  const [wellnessSuggestion, setWellnessSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('in');
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadWellnessData();
    }
  }, [currentUser]);

  async function loadWellnessData() {
    try {
      const [trendsRes, gratRes, stressRes] = await Promise.all([
        fetch(`${API_BASE_URL}/wellness/mood-trends/${currentUser}`),
        fetch(`${API_BASE_URL}/wellness/gratitude/${currentUser}`),
        fetch(`${API_BASE_URL}/wellness/stress-check/${currentUser}`)
      ]);
      if (trendsRes.ok) setMoodTrends(await trendsRes.json());
      if (gratRes.ok) setGratitudeLog(await gratRes.json());
      if (stressRes.ok) setStressCheck(await stressRes.json());
    } catch (e) {
      // offline - use cached data
    }
  }

  async function saveGratitude() {
    const filled = gratitudeEntries.filter(e => e.trim());
    if (!filled.length) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/wellness/gratitude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser, entries: filled, mood: gratitudeMood })
      });
      setGratitudeEntries(['', '', '']);
      loadWellnessData();
    } catch (e) {
      alert('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveMood() {
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/wellness/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser, mood: moodValue, energy: energyValue, stress: stressValue, notes: moodNotes })
      });
      setMoodNotes('');
      loadWellnessData();
    } catch (e) {
      alert('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function getWellnessSuggestion() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wellness/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser, mood: moodValue, stress: stressValue })
      });
      const data = await res.json();
      setWellnessSuggestion(data.suggestion || 'Keep taking care of yourself!');
    } catch (e) {
      setWellnessSuggestion('Take a moment to breathe deeply. You are doing great!');
    } finally {
      setLoading(false);
    }
  }

  function startBreathing() {
    setBreathingActive(true);
    setBreathCount(0);
    setBreathPhase('in');
    let count = 0;
    let phase = 'in';
    const phases = ['in', 'hold', 'out', 'hold'];
    const labels = ['Breathe in...', 'Hold...', 'Breathe out...', 'Hold...'];
    let phaseIdx = 0;
    const interval = setInterval(() => {
      count++;
      if (count % 4 === 0) {
        phaseIdx = (phaseIdx + 1) % 4;
        setBreathPhase(phases[phaseIdx]);
      }
      setBreathCount(count);
      if (count >= 48) { // 12 breath cycles
        clearInterval(interval);
        setBreathingActive(false);
      }
    }, 1000);
  }

  const cardClass = isHighContrast
    ? 'bg-white border-2 border-black rounded-xl p-4 mb-4'
    : 'bg-white rounded-xl shadow p-4 mb-4';

  const tabs = [
    { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
    { id: 'mood', label: 'Mood', emoji: '😊' },
    { id: 'breathe', label: 'Breathe', emoji: '🌬️' },
    { id: 'trends', label: 'Trends', emoji: '📈' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💚 Wellness Hub</h1>
        <p className="text-gray-500 text-sm mt-1">Your mental health matters</p>
      </div>

      {stressCheck && stressCheck.stressLevel === 'high' && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 rounded-r-xl">
          <p className="font-semibold text-orange-800">Heads up</p>
          <p className="text-orange-700 text-sm mt-1">{stressCheck.recommendation}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Gratitude Tab */}
      {activeTab === 'gratitude' && (
        <div>
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">What are you grateful for today?</h2>
            {gratitudeEntries.map((entry, i) => (
              <input
                key={i}
                type="text"
                value={entry}
                onChange={e => {
                  const updated = [...gratitudeEntries];
                  updated[i] = e.target.value;
                  setGratitudeEntries(updated);
                }}
                placeholder={`Grateful for... ${i + 1}`}
                className="w-full border rounded-lg px-3 py-2 mb-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ minHeight: '44px' }}
              />
            ))}
            <div className="flex gap-2 mb-3">
              {['happy', 'peaceful', 'content', 'hopeful'].map(m => (
                <button
                  key={m}
                  onClick={() => setGratitudeMood(m)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    gratitudeMood === m ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={saveGratitude}
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-base disabled:opacity-50"
              style={{ minHeight: '50px' }}
            >
              {saving ? 'Saving...' : 'Save Gratitude'}
            </button>
          </div>

          {gratitudeLog.length > 0 && (
            <div className={cardClass}>
              <h3 className="font-semibold text-gray-700 mb-3">Recent Gratitude</h3>
              {gratitudeLog.slice(0, 5).map((entry, i) => (
                <div key={i} className="border-b last:border-0 py-2">
                  <p className="text-sm text-gray-500">{entry.date} — {entry.mood}</p>
                  <ul className="mt-1">
                    {entry.entries?.map((e, j) => (
                      <li key={j} className="text-gray-700 text-sm">• {e}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mood Tab */}
      {activeTab === 'mood' && (
        <div>
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">How are you feeling?</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Mood: {MOODS[moodValue - 1]} {moodValue}/10
              </label>
              <input type="range" min="1" max="10" value={moodValue}
                onChange={e => setMoodValue(Number(e.target.value))}
                className="w-full accent-green-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low 😢</span><span>High 🥳</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Energy: {energyValue}/10
              </label>
              <input type="range" min="1" max="10" value={energyValue}
                onChange={e => setEnergyValue(Number(e.target.value))}
                className="w-full accent-yellow-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Stress: {stressValue}/10
              </label>
              <input type="range" min="1" max="10" value={stressValue}
                onChange={e => setStressValue(Number(e.target.value))}
                className="w-full accent-red-400" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Calm</span><span>Stressed</span>
              </div>
            </div>

            <textarea
              value={moodNotes}
              onChange={e => setMoodNotes(e.target.value)}
              placeholder="Any notes? (optional)"
              className="w-full border rounded-lg px-3 py-2 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={saveMood}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                style={{ minHeight: '50px' }}
              >
                {saving ? 'Saving...' : 'Log Mood'}
              </button>
              <button
                onClick={getWellnessSuggestion}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                style={{ minHeight: '50px' }}
              >
                {loading ? 'Thinking...' : 'Get Tip'}
              </button>
            </div>
          </div>

          {wellnessSuggestion && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-purple-800 mb-1">Wellness Tip</p>
              <p className="text-purple-700">{wellnessSuggestion}</p>
            </div>
          )}
        </div>
      )}

      {/* Breathing Tab */}
      {activeTab === 'breathe' && (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">Box Breathing Exercise</h2>
          <p className="text-gray-500 text-sm text-center mb-6">4 counts each phase — reduces stress in minutes</p>

          {!breathingActive ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🌬️</div>
              <p className="text-gray-600 mb-6">Ready for a calming breathing exercise?</p>
              <button
                onClick={startBreathing}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                style={{ minHeight: '56px' }}
              >
                Start Breathing
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl mb-6 transition-all duration-1000 ${
                breathPhase === 'in' ? 'bg-blue-500 scale-110' :
                breathPhase === 'out' ? 'bg-green-500 scale-90' : 'bg-purple-500'
              }`}>
                {breathPhase === 'in' ? 'Breathe In' :
                 breathPhase === 'out' ? 'Breathe Out' : 'Hold'}
              </div>
              <p className="text-gray-500">Count: {breathCount % 4 + 1} / 4</p>
              <button
                onClick={() => setBreathingActive(false)}
                className="mt-4 text-gray-500 underline"
              >
                Stop
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div>
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Mood Trends (7 days)</h2>
            {moodTrends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No mood data yet. Start logging daily!</p>
            ) : (
              <div className="space-y-3">
                {moodTrends.slice(-7).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{entry.date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${(entry.mood / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{MOODS[(entry.mood || 5) - 1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {stressCheck && (
            <div className={`${cardClass} ${
              stressCheck.stressLevel === 'low' ? 'border-l-4 border-green-400' :
              stressCheck.stressLevel === 'medium' ? 'border-l-4 border-yellow-400' :
              'border-l-4 border-red-400'
            }`}>
              <h3 className="font-semibold mb-2">Stress Check</h3>
              <p className="text-sm text-gray-600">Level: <strong>{stressCheck.stressLevel}</strong></p>
              <p className="text-sm text-gray-600 mt-1">{stressCheck.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
