import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAchievements = useCallback(async (userId, category, limit = 50) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/achievements`, {
        params: { userId, category, limit }
      });
      setAchievements(response.data.achievements || []);
      return response.data.achievements;
    } catch (err) {
      setError('Could not load achievements.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const logAchievement = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/achievements`, data);
      const { achievement, milestones: newMilestones } = response.data;
      setAchievements((prev) => [achievement, ...prev]);
      if (newMilestones?.length) {
        setMilestones((prev) => [...newMilestones, ...prev]);
      }
      return { achievement, milestones: newMilestones };
    } catch (err) {
      setError('Could not log achievement. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactToAchievement = useCallback(async (id, reaction, userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/achievements/${id}/react`, {
        userId,
        reaction
      });
      const updated = response.data.achievement;
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      return updated;
    } catch (err) {
      return null;
    }
  }, []);

  const commentOnAchievement = useCallback(async (id, userId, text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/achievements/${id}/comment`, {
        userId,
        text
      });
      const updated = response.data.achievement;
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      return updated;
    } catch (err) {
      return null;
    }
  }, []);

  const checkMilestones = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/achievements/milestones`, {
        params: { userId }
      });
      const found = response.data.milestones || [];
      setMilestones(found);
      return found;
    } catch (err) {
      return [];
    }
  }, []);

  const deleteAchievement = useCallback(async (id) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/achievements/${id}`);
    } catch (err) {
      await loadAchievements();
    }
  }, [loadAchievements]);

  return {
    achievements,
    milestones,
    loading,
    error,
    loadAchievements,
    logAchievement,
    reactToAchievement,
    commentOnAchievement,
    checkMilestones,
    deleteAchievement
  };
}

export default useAchievements;
