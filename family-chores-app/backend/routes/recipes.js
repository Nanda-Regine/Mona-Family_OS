'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { loadState, saveState } = require('../utils/stateManager');
const { aiRateLimit } = require('../middleware/rateLimit');
const {
  generateHealthyRecipes,
  optimizeBudget,
  generateMealPlan,
  analyzeHealthTrends
} = require('../utils/openaiService');

// POST /recipes/generate - generate recipes using AI
router.post('/generate', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const { userId, preferences } = req.body;
    const groceries = state.groceryList?.items || [];

    // Get health goals from user or family
    const user = userId ? state.users[userId] : null;
    const healthGoals = user?.healthGoals || { dietaryFocus: 'less starch, more vegetables' };

    const recipes = await generateHealthyRecipes(groceries, healthGoals, preferences);

    // Cache the recipes
    const cachedRecipes = recipes.map((r) => ({
      ...r,
      id: uuidv4(),
      generatedAt: new Date().toISOString(),
      generatedFor: userId || 'family'
    }));

    if (!state.recipes) state.recipes = [];
    state.recipes.unshift(...cachedRecipes);
    // Keep only last 50 recipes
    state.recipes = state.recipes.slice(0, 50);
    await saveState(state);

    res.json({ success: true, recipes: cachedRecipes });
  } catch (err) {
    console.error('Recipe generation error:', err);
    res.status(503).json({
      error: 'Recipe generation failed',
      message: 'Could not generate recipes. Please try again later.'
    });
  }
});

// GET /recipes/cached - get cached AI-generated recipes
router.get('/cached', (req, res) => {
  try {
    const state = loadState();
    const { limit = 10 } = req.query;
    const recipes = (state.recipes || []).slice(0, parseInt(limit));
    res.json({ success: true, recipes, total: (state.recipes || []).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /nutrition/analysis - analyze nutritional trends
router.get('/nutrition/analysis', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const nutritionData = state.nutritionTracking?.weeklyData || {};
    const moodData = state.wellness?.moodTracker || [];

    const analysis = await analyzeHealthTrends(nutritionData, moodData);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Nutrition analysis error:', err);
    res.status(503).json({
      error: 'Analysis failed',
      message: 'Could not analyze nutrition data. Please try again later.'
    });
  }
});

// POST /mealplan - generate meal plan
router.post('/mealplan', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const { userId, days = 7 } = req.body;

    const user = userId ? state.users[userId] : null;
    const healthGoals = user?.healthGoals || { dietaryFocus: 'less starch, more vegetables' };

    const mealPlan = await generateMealPlan(state.recipes || [], healthGoals, days);

    const savedPlan = {
      id: uuidv4(),
      ...mealPlan,
      generatedAt: new Date().toISOString(),
      generatedFor: userId || 'family'
    };

    if (!state.mealPlans) state.mealPlans = [];
    state.mealPlans.unshift(savedPlan);
    state.mealPlans = state.mealPlans.slice(0, 10);
    await saveState(state);

    res.json({ success: true, mealPlan: savedPlan });
  } catch (err) {
    console.error('Meal plan error:', err);
    res.status(503).json({
      error: 'Meal plan generation failed',
      message: 'Could not generate meal plan. Please try again later.'
    });
  }
});

// GET /mealplan/current - get most recent meal plan
router.get('/mealplan/current', (req, res) => {
  try {
    const state = loadState();
    const current = state.mealPlans?.[0] || null;
    res.json({ success: true, mealPlan: current });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /budget/optimize - optimize grocery budget
router.post('/budget/optimize', aiRateLimit, async (req, res) => {
  try {
    const state = loadState();
    const { budget } = req.body;
    const result = await optimizeBudget(state.groceryList, budget, null);
    res.json({ success: true, optimization: result });
  } catch (err) {
    console.error('Budget optimization error:', err);
    res.status(503).json({
      error: 'Budget optimization failed',
      message: 'Could not optimize budget. Please try again later.'
    });
  }
});

module.exports = router;
