import React, { useState, useEffect } from 'react';
import { API_BASE_URL, USER_NAMES, USER_COLORS } from '../utils/constants';
import { useAccessibility } from '../App';

export default function Analytics({ currentUser }) {
  const { isHighContrast } = useAccessibility();
  const [familyOverview, setFamilyOverview] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [wellnessData, setWellnessData] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const [famRes, healthRes, wellRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/family`),
        fetch(`${API_BASE_URL}/analytics/health`),
        fetch(`${API_BASE_URL}/analytics/wellness`)
      ]);
      if (famRes.ok) setFamilyOverview(await famRes.json());
      if (healthRes.ok) setHealthData(await healthRes.json());
      if (wellRes.ok) setWellnessData(await wellRes.json());
    } catch (e) {} finally {
      setLoading(false);
    }
  }

  async function generateWeeklyReport() {
    setGeneratingReport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/weekly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedBy: currentUser })
      });
      const data = await res.json();
      setWeeklyReport(data.report);
    } catch (e) {
      alert('Could not generate report. Try again.');
    } finally {
      setGeneratingReport(false);
    }
  }

  const cardClass = isHighContrast
    ? 'bg-white border-2 border-black rounded-xl p-4 mb-4'
    : 'bg-white rounded-xl shadow p-4 mb-4';

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📊</div>
        Loading analytics...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Family Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance & wellness tracking</p>
      </div>

      <button
        onClick={generateWeeklyReport}
        disabled={generatingReport}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold mb-6 disabled:opacity-50"
        style={{ minHeight: '50px' }}
      >
        {generatingReport ? 'Generating AI report...' : 'Generate Weekly Report (AI)'}
      </button>

      {weeklyReport && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-indigo-800 mb-2">Weekly Family Report</h3>
          <p className="text-indigo-700 text-sm whitespace-pre-line">{weeklyReport}</p>
        </div>
      )}

      {/* Family Overview */}
      {familyOverview && (
        <div className={cardClass}>
          <h2 className="font-bold text-gray-800 mb-3">Family Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{familyOverview.totalTasksCompleted || 0}</p>
              <p className="text-xs text-blue-500">Tasks Done</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{familyOverview.totalAchievements || 0}</p>
              <p className="text-xs text-green-500">Achievements</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{familyOverview.avgMoodScore ? familyOverview.avgMoodScore.toFixed(1) : '—'}</p>
              <p className="text-xs text-purple-500">Avg Mood</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{familyOverview.missedChores || 0}</p>
              <p className="text-xs text-orange-500">Missed Chores</p>
            </div>
          </div>

          {familyOverview.memberStats && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Per Person</h3>
              {Object.entries(familyOverview.memberStats).map(([userId, stats]) => {
                const color = USER_COLORS[userId] || '#6B7280';
                const completion = stats.tasksCompleted && stats.totalTasks
                  ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100)
                  : 0;
                return (
                  <div key={userId} className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {(USER_NAMES[userId] || userId)[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="font-medium text-gray-700">{USER_NAMES[userId] || userId}</span>
                        <span className="text-gray-400">{completion}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${completion}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Health Data */}
      {healthData && (
        <div className={cardClass}>
          <h2 className="font-bold text-gray-800 mb-3">Nutrition & Health</h2>
          {healthData.weeklyAvg && (
            <div className="space-y-2">
              {[
                { label: 'Vegetables', value: healthData.weeklyAvg.vegetables, max: 10, color: '#22c55e' },
                { label: 'Protein', value: healthData.weeklyAvg.protein, max: 10, color: '#3b82f6' },
                { label: 'Fruits', value: healthData.weeklyAvg.fruits, max: 10, color: '#f97316' },
                { label: 'Starch (lower = better)', value: healthData.weeklyAvg.starch, max: 10, color: '#ef4444' }
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">{value || 0}/{max}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${((value || 0) / max) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {healthData.notes && (
            <p className="text-sm text-gray-500 mt-3">{healthData.notes}</p>
          )}
          {!healthData.weeklyAvg && (
            <p className="text-gray-400 text-sm">No nutrition data yet. Start adding meals in the Food section!</p>
          )}
        </div>
      )}

      {/* Wellness Data */}
      {wellnessData && (
        <div className={cardClass}>
          <h2 className="font-bold text-gray-800 mb-3">Wellness Trends</h2>
          {wellnessData.familyMoodAvg !== undefined && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Family average mood this week:</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{wellnessData.familyMoodAvg?.toFixed(1) || '—'}/10</p>
            </div>
          )}
          {wellnessData.gratitudeThemes?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Gratitude themes this week:</p>
              <div className="flex flex-wrap gap-2">
                {wellnessData.gratitudeThemes.map((theme, i) => (
                  <span key={i} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          {wellnessData.stressedMembers?.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 font-medium">Needs attention:</p>
              {wellnessData.stressedMembers.map(userId => (
                <p key={userId} className="text-sm text-orange-600">{USER_NAMES[userId] || userId} seems stressed. Consider checking in.</p>
              ))}
            </div>
          )}
          {!wellnessData.familyMoodAvg && (
            <p className="text-gray-400 text-sm">No wellness data yet. Start logging moods in the Wellness Hub!</p>
          )}
        </div>
      )}

      <button
        onClick={loadAnalytics}
        className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium mt-2"
        style={{ minHeight: '50px' }}
      >
        Refresh Data
      </button>
    </div>
  );
}
