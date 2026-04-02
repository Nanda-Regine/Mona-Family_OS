import React, { useState, useEffect } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { USERS, USER_NAMES, USER_COLORS, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_EMOJIS, REACTIONS } from '../utils/constants';
import { formatRelativeTime } from '../utils/dateHelpers';

export default function AchievementLogger({ currentUser }) {
  const {
    achievements, loading, error,
    loadAchievements, logAchievement,
    reactToAchievement, commentOnAchievement
  } = useAchievements();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: currentUser,
    title: '',
    description: '',
    category: 'personal',
    emoji: '🌟'
  });
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAchievements(null, null, 20);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    const result = await logAchievement(form);
    if (result) {
      setShowForm(false);
      setForm({ userId: currentUser, title: '', description: '', category: 'personal', emoji: '🌟' });
    }
    setSubmitting(false);
  }

  async function handleComment(achievementId) {
    const text = commentText[achievementId];
    if (!text?.trim()) return;
    await commentOnAchievement(achievementId, currentUser, text);
    setCommentText((prev) => ({ ...prev, [achievementId]: '' }));
  }

  return (
    <div className="space-y-4">
      {/* Add Achievement Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors min-h-touch flex items-center justify-center gap-2"
        aria-expanded={showForm}
      >
        {showForm ? '✕ Cancel' : '🏆 Log an Achievement'}
      </button>

      {/* Add Achievement Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm animate-slide-up space-y-3">
          <h3 className="font-bold text-gray-800">New Achievement</h3>

          <div>
            <label className="text-xs text-gray-500 font-medium" htmlFor="ach-who">Who achieved this?</label>
            <select
              id="ach-who"
              value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            >
              {USERS.map((u) => <option key={u} value={u}>{USER_NAMES[u]}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium" htmlFor="ach-title">Title *</label>
            <input
              id="ach-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="What did they achieve?"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium" htmlFor="ach-desc">Description (optional)</label>
            <textarea
              id="ach-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="More details..."
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-16 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              >
                {ACHIEVEMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{ACHIEVEMENT_EMOJIS[c]} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 w-16 min-h-touch text-center text-lg"
                maxLength={2}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.title.trim()}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50 min-h-touch"
          >
            {submitting ? 'Saving...' : '✨ Log Achievement'}
          </button>
        </form>
      )}

      {/* Achievements List */}
      {loading && achievements.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          <div className="text-5xl mb-3">🏆</div>
          <p className="font-medium">No achievements yet</p>
          <p className="text-sm mt-1">Be the first to log a family win!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((ach) => {
            const userColor = USER_COLORS[ach.userId] || '#6B7280';
            const userName = USER_NAMES[ach.userId] || ach.userId;
            return (
              <div
                key={ach.id}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 animate-fade-in"
                style={{ borderLeftColor: userColor }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ach.emoji || '🏆'}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">{ach.title}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: userColor }}
                        >
                          {userName}
                        </span>
                      </div>
                      {ach.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{ach.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(ach.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{ach.category}</span>
                </div>

                {/* Reactions */}
                <div className="flex gap-2 mt-3 flex-wrap items-center">
                  {REACTIONS.map((reaction) => {
                    const count = ach.reactions?.[reaction]?.length || 0;
                    const reacted = ach.reactions?.[reaction]?.includes(currentUser);
                    return (
                      <button
                        key={reaction}
                        onClick={() => reactToAchievement(ach.id, reaction, currentUser)}
                        className={`px-2 py-1 rounded-full text-sm border transition-all touch-target ${
                          reacted
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`React with ${reaction} (${count} reactions)`}
                      >
                        {reaction} {count > 0 && <span className="text-xs">{count}</span>}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setExpandedComments(expandedComments === ach.id ? null : ach.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 touch-target px-2"
                    aria-label={`Comments (${(ach.comments || []).length})`}
                  >
                    💬 {(ach.comments || []).length}
                  </button>
                </div>

                {/* Comments */}
                {expandedComments === ach.id && (
                  <div className="mt-3 border-t pt-3 animate-fade-in">
                    {(ach.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: USER_COLORS[comment.userId] || '#6B7280' }}
                        >
                          {(USER_NAMES[comment.userId] || 'U')[0]}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">
                            {USER_NAMES[comment.userId] || comment.userId}
                          </span>
                          <p className="text-sm text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={commentText[ach.id] || ''}
                        onChange={(e) => setCommentText((p) => ({ ...p, [ach.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 border rounded-lg px-2 py-1.5 text-sm min-h-touch"
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(ach.id)}
                      />
                      <button
                        onClick={() => handleComment(ach.id)}
                        disabled={!commentText[ach.id]?.trim()}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 min-h-touch"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
