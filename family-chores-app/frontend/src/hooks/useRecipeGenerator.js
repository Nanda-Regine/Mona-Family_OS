import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { formatRecipeDisplay } from '../utils/recipeUtils';

export function useRecipeGenerator() {
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecipes = useCallback(async (groceries, userId, preferences) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/recipes/generate`, {
        groceries,
        userId,
        preferences
      }, { timeout: 30000 });

      const generated = (response.data.recipes || []).map(formatRecipeDisplay);
      setRecipes(generated);
      return generated;
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Too many requests. Please wait a minute and try again.'
        : err.response?.status === 503
        ? 'AI service unavailable. Please try again later.'
        : 'Could not generate recipes. Please check your connection.';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCachedRecipes = useCallback(async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/cached`, {
        params: { limit }
      });
      const cached = (response.data.recipes || []).map(formatRecipeDisplay);
      setRecipes(cached);
      return cached;
    } catch (err) {
      console.error('Failed to load cached recipes:', err);
      return [];
    }
  }, []);

  const generateMealPlan = useCallback(async (days = 7, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/recipes/mealplan`, {
        days,
        userId
      }, { timeout: 30000 });

      const plan = response.data.mealPlan;
      setMealPlan(plan);
      return plan;
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Too many requests. Please wait a minute.'
        : 'Could not generate meal plan. Please try again.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeBudget = useCallback(async (budget) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/recipes/budget/optimize`, {
        budget
      }, { timeout: 20000 });

      const analysis = response.data.optimization;
      setBudgetAnalysis(analysis);
      return analysis;
    } catch (err) {
      setError('Could not analyze budget. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentMealPlan = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/mealplan/current`);
      const plan = response.data.mealPlan;
      setMealPlan(plan);
      return plan;
    } catch (err) {
      return null;
    }
  }, []);

  return {
    recipes,
    mealPlan,
    budgetAnalysis,
    loading,
    error,
    generateRecipes,
    loadCachedRecipes,
    generateMealPlan,
    analyzeBudget,
    getCurrentMealPlan
  };
}

export default useRecipeGenerator;
