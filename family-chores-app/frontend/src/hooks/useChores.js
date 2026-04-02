import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../utils/constants';
import { getTodayUserTasks } from '../utils/routineGenerator';
import { startOfDay, addDays } from '../utils/dateHelpers';

export function useChores() {
  const [tasks, setTasks] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadState = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sync/state`, { timeout: 8000 });
      const { state } = response.data;
      if (state) {
        setTasks(state.tasks || []);
        setRoutines(state.routines || []);
        setUsers(state.users || {});
      }
    } catch (err) {
      setError(err.message);
      // Try to load from localStorage as fallback
      const cached = localStorage.getItem('family-os-state');
      if (cached) {
        try {
          const state = JSON.parse(cached);
          setTasks(state.tasks || []);
          setRoutines(state.routines || []);
          setUsers(state.users || {});
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  function getTodaysTasks(userId) {
    return getTodayUserTasks(routines, tasks, userId, new Date());
  }

  async function completeTask(taskId, completedBy) {
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: true, completedAt: new Date().toISOString(), completedBy }
            : t
        )
      );

      await axios.post(`${API_BASE_URL}/routines/task/${taskId}/complete`, {
        completedBy
      });
    } catch (err) {
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: false, completedAt: null } : t))
      );
      throw err;
    }
  }

  async function addTask(taskData) {
    const task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false,
      ...taskData
    };

    setTasks((prev) => [...prev, task]);

    try {
      const response = await axios.post(`${API_BASE_URL}/routines/task/quick-add`, task);
      return response.data.task;
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      throw err;
    }
  }

  async function deleteTask(taskId) {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await axios.delete(`${API_BASE_URL}/routines/task/${taskId}`);
    } catch (err) {
      if (taskToDelete) setTasks((prev) => [...prev, taskToDelete]);
      throw err;
    }
  }

  async function addRoutine(routineData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/routines`, routineData);
      const newRoutine = response.data.routine;
      setRoutines((prev) => [...prev, newRoutine]);
      return newRoutine;
    } catch (err) {
      throw err;
    }
  }

  async function updateRoutine(id, updates) {
    try {
      const response = await axios.put(`${API_BASE_URL}/routines/${id}`, updates);
      const updated = response.data.routine;
      setRoutines((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  }

  async function deleteRoutine(id) {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/routines/${id}`);
    } catch (err) {
      await loadState();
      throw err;
    }
  }

  function getMissedTasks(userId) {
    const todayStart = startOfDay(new Date()).getTime();
    return tasks.filter((t) => {
      if (t.completed) return false;
      if (userId && t.assignedTo !== userId) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() < todayStart;
    });
  }

  function getTasksForDate(userId, date) {
    return getTodayUserTasks(routines, tasks, userId, date);
  }

  return {
    tasks,
    routines,
    users,
    loading,
    error,
    loadState,
    getTodaysTasks,
    completeTask,
    addTask,
    deleteTask,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    getMissedTasks,
    getTasksForDate
  };
}

export default useChores;
