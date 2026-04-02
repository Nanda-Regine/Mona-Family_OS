import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getMoodTrend, getAverageMood } from '../utils/wellnessLogic';

export function useWellness() {
  const [gratitudeLog, setGratitudeLog] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [stressData, setStressData] = useState(null);
  const [wellnessSuggestions, setWellnessSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logGratitude = useCallback(async (entries, mood, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/wellness/gratitude`, {
        userId,
        entries,
        mood
      });
      const entry = response.data.entry;
      setGratitudeLog((prev) => [entry, ...prev]);
      return entry;
    } catch (err) {
      setError('Could not save gratitude entry. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGratitudeLog = useCallback(async (userId, limit = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/gratitude`, {
        params: { userId, limit }
      });
      setGratitudeLog(response.data.entries || []);
      return response.data.entries;
    } catch (err) {
      console.error('Failed to load gratitude log:', err);
      return [];
    }
  }, []);

  const logMood = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/wellness/mood`, data);
      const entry = response.data.entry;
      setMoodHistory((prev) => [entry, ...prev]);
      return entry;
    } catch (err) {
      setError('Could not save mood entry.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMoodHistory = useCallback(async (userId, days = 7) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/mood`, {
        params: { userId, days }
      });
      const entries = response.data.entries || [];
      setMoodHistory(entries);
      return {
        entries,
        trend: getMoodTrend(entries),
        average: getAverageMood(entries)
      };
    } catch (err) {
      return { entries: [], trend: 'insufficient_data', average: null };
    }
  }, []);

  const getStressCheck = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/stress/${userId}`);
      setStressData(response.data);
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  const logStress = useCallback(async (userId, level, triggers, notes) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wellness/stress`, {
        userId,
        level,
        triggers,
        notes
      });
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  const getWellnessSuggestions = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/suggestions`, {
        params: { userId }
      });
      setWellnessSuggestions(response.data.suggestions);
      return response.data.suggestions;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMoodTrends = useCallback(async (userId, days = 30) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/trends/${userId}`, {
        params: { days }
      });
      return response.data.trends;
    } catch (err) {
      return null;
    }
  }, []);

  const addMeditationReminder = useCallback(async (userId, time, days, duration) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wellness/meditation`, {
        userId,
        time,
        days,
        duration
      });
      return response.data.reminder;
    } catch (err) {
      return null;
    }
  }, []);

  return {
    gratitudeLog,
    moodHistory,
    stressData,
    wellnessSuggestions,
    loading,
    error,
    logGratitude,
    loadGratitudeLog,
    logMood,
    getMoodHistory,
    getStressCheck,
    logStress,
    getWellnessSuggestions,
    getMoodTrends,
    addMeditationReminder
  };
}

export default useWellness;
