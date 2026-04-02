import React, { useState, useEffect } from 'react';
import { useRecipeGenerator } from '../hooks/useRecipeGenerator';
import { DAY_NAMES } from '../utils/constants';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

export default function MealPlanner({ currentUser }) {
  const { mealPlan, loading, error, generateMealPlan, getCurrentMealPlan } = useRecipeGenerator();
  const [days, setDays] = useState(7);

  useEffect(() => {
    getCurrentMealPlan();
  }, []);

  const plan = mealPlan?.days || [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📅</span> Meal Planner
        </h3>
        <div className="flex gap-2 mb-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="flex-1 border rounded-lg px-3 py-2 text-sm min-h-touch"
            aria-label="Number of days for meal plan"
          >
            {[3, 5, 7, 14].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
          <button
            onClick={() => generateMealPlan(days, currentUser)}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 min-h-touch"
          >
            {loading ? '⏳ Generating...' : '🍱 Generate Plan'}
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded" role="alert">{error}</div>
        )}
      </div>

      {plan.length > 0 ? (
        <div className="space-y-3">
          {plan.map((dayPlan, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-700 mb-2">
                {dayPlan.day || `Day ${idx + 1}`}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TYPES.map((meal) => (
                  <div key={meal} className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{meal}</div>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-700 min-h-[48px] flex items-center justify-center text-center">
                      {dayPlan[meal] || '—'}
                    </div>
                  </div>
                ))}
              </div>
              {dayPlan.snacks && dayPlan.snacks.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Snacks: {Array.isArray(dayPlan.snacks) ? dayPlan.snacks.join(', ') : dayPlan.snacks}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          <div className="text-4xl mb-2">📅</div>
          <p>Generate a meal plan for the family</p>
          <p className="text-xs mt-1">Focuses on less starch and more vegetables</p>
        </div>
      ) : null}
    </div>
  );
}
