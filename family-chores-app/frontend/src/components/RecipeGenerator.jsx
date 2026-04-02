import React, { useState, useEffect } from 'react';
import { useRecipeGenerator } from '../hooks/useRecipeGenerator';

export default function RecipeGenerator({ currentUser }) {
  const {
    recipes, loading, error,
    generateRecipes, loadCachedRecipes
  } = useRecipeGenerator();
  const [expanded, setExpanded] = useState(null);
  const [preferences, setPreferences] = useState('family-friendly, quick to prepare');

  useEffect(() => {
    loadCachedRecipes(5);
  }, []);

  async function handleGenerate() {
    // Get groceries from state
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/groceries`);
    const data = await res.json();
    await generateRecipes(data.items || [], currentUser, preferences);
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>🤖</span> AI Recipe Generator
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Generates healthy recipes based on your grocery list, focusing on less starch and more vegetables.
        </p>
        <div className="mb-3">
          <label className="text-xs text-gray-500 font-medium" htmlFor="preferences">
            Preferences
          </label>
          <input
            id="preferences"
            type="text"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-touch"
            placeholder="e.g. quick, vegetarian, South African..."
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-touch"
          aria-label="Generate recipes using AI"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Generating...
            </>
          ) : (
            '✨ Generate Recipes'
          )}
        </button>

        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-sm" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Recipe Cards */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          {recipes.map((recipe, idx) => (
            <div key={recipe.id || idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between min-h-touch"
                aria-expanded={expanded === idx}
                aria-label={`View recipe: ${recipe.name}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{recipe.name}</h4>
                    <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                      {recipe.prepTime && <span>⏱ {recipe.prepTime}</span>}
                      {recipe.calories && <span>🔥 {recipe.calories} cal</span>}
                      {recipe.healthScore && (
                        <span className={recipe.healthScore >= 7 ? 'text-green-500' : 'text-yellow-500'}>
                          ❤️ {recipe.healthScore}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400">{expanded === idx ? '▲' : '▼'}</span>
              </button>

              {expanded === idx && (
                <div className="px-4 pb-4 border-t animate-fade-in">
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-semibold text-gray-700 text-sm mb-2">Ingredients</h5>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-semibold text-gray-700 text-sm mb-2">Instructions</h5>
                      <ol className="space-y-2">
                        {recipe.instructions.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="font-bold text-purple-600 flex-shrink-0">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipe.notes && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
                      💡 {recipe.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {recipes.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          <div className="text-4xl mb-2">🍳</div>
          <p>Generate recipes based on your grocery list</p>
        </div>
      )}
    </div>
  );
}
