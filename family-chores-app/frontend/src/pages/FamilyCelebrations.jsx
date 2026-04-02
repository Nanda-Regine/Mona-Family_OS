import React, { useState, useEffect } from 'react';
import { API_BASE_URL, USER_NAMES, USER_COLORS, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_EMOJIS, REACTIONS } from '../utils/constants';
import { useAccessibility } from '../App';

export default function FamilyCelebrations({ currentUser }) {
  const { isHighContrast } = useAccessibility();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    userId: currentUser || 'mom',
    category: 'routine',
    title: '',
    description: '',
    icon: '🏆',
    visibility: 'family'
  });
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState([]);

  const EMOJI_OPTIONS = ['🏆', '🌟', '💪', '📚', '🥗', '👨‍🍳', '🎯', '🔥', '⭐', '🎉', '💚', '🏅'];

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    setLoading(true);
    try {
      const [achRes, milRes] = await Promise.all([
        fetch(`${API_BASE_URL}/achievements`),
        fetch(`${API_BASE_URL}/achievements/milestones`)
      ]);
      if (achRes.ok) setAchievements(await achRes.json());
      if (milRes.ok) setMilestones(await milRes.json());
    } catch (e) {
      // offline
    } finally {
      setLoading(false);
    }
  }

  async function logAchievement() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/achievements/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setShowAddForm(false);
      setForm({ userId: currentUser || 'mom', category: 'routine', title: '', description: '', icon: '🏆', visibility: 'family' });
      loadAchievements();
    } catch (e) {
      alert('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function reactToAchievement(id, reaction) {
    try {
      await fetch(`${API_BASE_URL}/achievements/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction, from: currentUser })
      });
      loadAchievements();
    } catch (e) {}
  }

  const cardClass = isHighContrast
    ? 'bg-white border-2 border-black rounded-xl p-4 mb-4'
    : 'bg-white rounded-xl shadow p-4 mb-4';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏆 Family Wins</h1>
          <p className="text-gray-500 text-sm mt-1">Celebrating every milestone</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-1"
          style={{ minHeight: '44px' }}
        >
          + Log Win
        </button>
      </div>

      {/* Auto milestones */}
      {milestones.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔥 Auto-Detected Milestones</h3>
          {milestones.map((m, i) => (
            <div key={i} className="text-sm text-yellow-700 py-1">
              {m.icon} {USER_NAMES[m.userId]}: {m.title}
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">Log Achievement</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Person</label>
                <select
                  value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-base"
                  style={{ minHeight: '44px' }}
                >
                  {Object.entries(USER_NAMES).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-base"
                  style={{ minHeight: '44px' }}
                >
                  {ACHIEVEMENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{ACHIEVEMENT_EMOJIS[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="What did they achieve?"
                  className="w-full border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell the story..."
                  className="w-full border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg border-2 ${form.icon === emoji ? 'border-yellow-500 bg-yellow-50' : 'border-transparent'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={logAchievement}
              disabled={saving || !form.title.trim()}
              className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50"
              style={{ minHeight: '50px' }}
            >
              {saving ? 'Saving...' : '🎉 CELEBRATE!'}
            </button>
          </div>
        </div>
      )}

      {/* Achievements List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🌟</div>
          <p className="text-gray-500">No achievements yet. Log your first win!</p>
        </div>
      ) : (
        <div>
          {achievements.map((ach) => {
            const color = USER_COLORS[ach.userId] || '#6B7280';
            return (
              <div
                key={ach.id}
                className={cardClass}
                style={isHighContrast ? {} : { borderLeft: `4px solid ${color}` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: color }}
                      >
                        {USER_NAMES[ach.userId]}
                      </span>
                      <span className="text-xs text-gray-400">{ach.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-800">{ach.title}</h3>
                    {ach.description && (
                      <p className="text-sm text-gray-600 mt-1">{ach.description}</p>
                    )}
                    {ach.celebrationMessage && (
                      <p className="text-sm font-medium text-green-700 mt-2 bg-green-50 rounded-lg px-2 py-1">
                        {ach.celebrationMessage}
                      </p>
                    )}

                    {/* Reactions */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {REACTIONS.map(r => {
                        const count = ach.reactions?.filter(x => x === r).length || 0;
                        return (
                          <button
                            key={r}
                            onClick={() => reactToAchievement(ach.id, r)}
                            className={`text-sm px-2 py-1 rounded-full border transition-colors ${
                              count > 0 ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'
                            }`}
                          >
                            {r} {count > 0 && <span className="text-xs">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Comments */}
                    {ach.comments?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {ach.comments.map((c, i) => (
                          <p key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            <strong>{USER_NAMES[c.from] || c.from}:</strong> {c.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
