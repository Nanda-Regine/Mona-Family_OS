'use strict';

const OpenAI = require('openai');

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

async function chat(messages, options = {}) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1000,
  });
  return response.choices[0].message.content;
}

async function generateHealthyRecipes(groceries, healthGoals, preferences) {
  const groceryList = Array.isArray(groceries) ? groceries.map((g) => g.name || g).join(', ') : String(groceries);
  const messages = [
    {
      role: 'system',
      content: `You are a family nutritionist and chef. Create healthy, delicious recipes that prioritize: ${healthGoals?.dietaryFocus || 'balanced nutrition'}.
Avoid: ${(healthGoals?.allergies || []).join(', ') || 'nothing specific'}.
Dietary restrictions: ${(healthGoals?.restrictions || []).join(', ') || 'none'}.
Target calories per meal: around ${healthGoals?.targetCalories ? Math.round(healthGoals.targetCalories / 3) : 600} calories.
Always suggest swaps to reduce starch and increase vegetables. Return JSON format.`
    },
    {
      role: 'user',
      content: `Create 3 healthy family recipes using these available groceries: ${groceryList}.
Preferences: ${preferences || 'family-friendly, quick to prepare'}.
Return as JSON array: [{ "name": "", "ingredients": [], "instructions": [], "prepTime": "", "calories": 0, "healthScore": 0, "notes": "" }]`
    }
  ];

  const raw = await chat(messages, { maxTokens: 1500 });
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [{ name: 'Could not parse recipes', raw }];
  } catch {
    return [{ name: 'Recipe generation result', raw }];
  }
}

async function optimizeBudget(groceryList, budget, history) {
  const items = Array.isArray(groceryList?.items)
    ? groceryList.items.map((i) => `${i.name} (${i.category || 'other'})`).join(', ')
    : 'various items';

  const messages = [
    {
      role: 'system',
      content: 'You are a budget-savvy family grocery advisor. Help optimize grocery spending while maintaining nutrition.'
    },
    {
      role: 'user',
      content: `Budget: R${budget || 2000}/week. Current grocery list: ${items}.
Recent purchase history: ${history ? JSON.stringify(history).slice(0, 500) : 'not available'}.
Suggest: 1) Items to remove or replace with cheaper alternatives, 2) Bulk buy opportunities, 3) Seasonal swaps, 4) Estimated total cost.
Format as JSON: { "suggestions": [], "removals": [], "bulkBuy": [], "estimatedTotal": 0, "savings": 0 }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 800 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function generateMealPlan(recipes, healthGoals, daysCount) {
  const recipeNames = Array.isArray(recipes)
    ? recipes.slice(0, 10).map((r) => r.name).join(', ')
    : 'balanced meals';

  const messages = [
    {
      role: 'system',
      content: `You are a family meal planner focused on: ${healthGoals?.dietaryFocus || 'balanced nutrition'}.`
    },
    {
      role: 'user',
      content: `Create a ${daysCount || 7}-day family meal plan. Available recipes include: ${recipeNames}.
Include breakfast, lunch, dinner. Reduce starch, increase vegetables.
Format as JSON: { "days": [{ "day": "", "breakfast": "", "lunch": "", "dinner": "", "snacks": [] }] }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 1200 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function predictTimeAvailability(routine, commitments) {
  const messages = [
    {
      role: 'system',
      content: 'You are a family schedule optimizer. Analyze routines and suggest optimal times for tasks.'
    },
    {
      role: 'user',
      content: `Analyze this family member's schedule and predict free time slots.
Routine: ${JSON.stringify(routine || {}).slice(0, 300)}
Commitments: ${JSON.stringify(commitments || []).slice(0, 300)}
Return JSON: { "freeSlots": [{ "day": "", "time": "", "duration": "" }], "recommendations": [] }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 600 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function generateStudyGuide(subject, examDate, studyHistory) {
  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 14;

  const messages = [
    {
      role: 'system',
      content: 'You are a supportive academic coach for a 13-year-old student. Create encouraging, structured study plans.'
    },
    {
      role: 'user',
      content: `Create a study guide for: ${subject}.
Exam date: ${examDate || 'in 2 weeks'} (${daysUntilExam} days away).
Study history: ${studyHistory || 'not provided'}.
Include: daily study schedule, key topics to focus on, practice tips, break reminders.
Format as JSON: { "schedule": [{ "day": "", "topics": [], "duration": "", "activities": [] }], "tips": [], "resources": [] }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 1000 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function generateWellnessSuggestions(mood, stress, achievements) {
  const moodScore = typeof mood === 'number' ? mood : 5;
  const stressLevel = typeof stress === 'number' ? stress : 5;

  const messages = [
    {
      role: 'system',
      content: 'You are a compassionate family wellness coach. Provide warm, practical wellness suggestions.'
    },
    {
      role: 'user',
      content: `Family wellness check:
Mood level (1-10): ${moodScore}
Stress level (1-10): ${stressLevel}
Recent achievements: ${achievements || 'various family wins'}

Suggest: 1) Immediate stress relief activities, 2) This week's wellness focus, 3) Family bonding activities, 4) Self-care reminders.
Format as JSON: { "immediate": [], "weeklyFocus": "", "familyActivities": [], "selfCare": [], "affirmation": "" }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 700 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function analyzeHealthTrends(nutritionData, moodData) {
  const messages = [
    {
      role: 'system',
      content: 'You are a family health analyst. Identify patterns and provide actionable insights.'
    },
    {
      role: 'user',
      content: `Analyze these family health trends:
Nutrition data: ${JSON.stringify(nutritionData || {}).slice(0, 400)}
Mood data: ${JSON.stringify(moodData || []).slice(0, 400)}

Find correlations between nutrition and mood. Identify areas for improvement.
Format as JSON: { "nutritionInsights": [], "moodInsights": [], "correlations": [], "recommendations": [], "weeklyScore": 0 }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 800 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

async function generateFamilyReport(allUserData) {
  const summary = Object.keys(allUserData?.users || {}).map((userId) => {
    const user = allUserData.users[userId];
    return `${user.name} (${user.role})`;
  }).join(', ');

  const messages = [
    {
      role: 'system',
      content: 'You are a family wellness reporter. Create warm, encouraging weekly family reports.'
    },
    {
      role: 'user',
      content: `Generate a weekly family report for: ${summary}.
Tasks completed this week: ${allUserData?.tasks?.filter((t) => t.completed)?.length || 0}
Total tasks: ${allUserData?.tasks?.length || 0}
Achievements: ${allUserData?.achievements?.length || 0}

Create an encouraging report highlighting wins, areas to celebrate, and gentle suggestions for improvement.
Format as JSON: { "headline": "", "wins": [], "celebrations": [], "suggestions": [], "familyStar": "", "nextWeekFocus": "" }`
    }
  ];

  const raw = await chat(messages, { maxTokens: 700 });
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
  } catch {
    return { raw };
  }
}

module.exports = {
  generateHealthyRecipes,
  optimizeBudget,
  generateMealPlan,
  predictTimeAvailability,
  generateStudyGuide,
  generateWellnessSuggestions,
  analyzeHealthTrends,
  generateFamilyReport
};
