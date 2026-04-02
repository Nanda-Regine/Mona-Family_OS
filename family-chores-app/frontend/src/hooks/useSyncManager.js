import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL, SYNC_INTERVAL } from '../utils/constants';
import { useIndexedDB } from './useIndexedDB';
import { useOffline } from './useOffline';

const DEVICE_ID_KEY = 'family-os-device-id';

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function useSyncManager() {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error, offline
  const [lastSync, setLastSync] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const intervalRef = useRef(null);
  const deviceId = useRef(getDeviceId());
  const { saveData, getData, getAllData, deleteData } = useIndexedDB();
  const { isOnline, wasOffline } = useOffline();

  const syncNow = useCallback(async (changes = null) => {
    if (!isOnline) {
      setSyncStatus('offline');
      return null;
    }

    setSyncStatus('syncing');
    try {
      const payload = {
        deviceId: deviceId.current,
        lastSync: lastSync,
        changes: changes || {}
      };

      const response = await axios.post(`${API_BASE_URL}/sync`, payload, {
        timeout: 10000,
        headers: { 'X-Device-ID': deviceId.current }
      });

      const { state } = response.data;
      const now = new Date().toISOString();
      setLastSync(now);
      setSyncStatus('synced');

      // Save to IndexedDB
      if (state) {
        await saveData('state', 'current', { id: 'current', data: state, updatedAt: now });
      }

      // Clear processed offline queue entries
      const queue = await getAllData('offline-queue');
      for (const entry of queue) {
        await deleteData('offline-queue', entry.id);
      }
      setPendingChanges([]);

      return state;
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('error');
      return null;
    }
  }, [isOnline, lastSync, saveData, getAllData, deleteData]);

  const startSync = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (isOnline) syncNow();
    }, SYNC_INTERVAL);
  }, [isOnline, syncNow]);

  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const queueChange = useCallback(async (type, data) => {
    const entry = {
      id: uuidv4(),
      type,
      data,
      timestamp: new Date().toISOString()
    };

    await saveData('offline-queue', entry.id, entry);
    setPendingChanges((prev) => [...prev, entry]);

    // Try to sync immediately if online
    if (isOnline) {
      await syncNow({ [type]: Array.isArray(data) ? data : [data] });
    }
  }, [isOnline, saveData, syncNow]);

  const flushOfflineQueue = useCallback(async () => {
    const queue = await getAllData('offline-queue');
    if (queue.length === 0) return;

    // Group changes by type
    const changes = {};
    queue.forEach((entry) => {
      if (!changes[entry.type]) changes[entry.type] = [];
      if (Array.isArray(entry.data)) {
        changes[entry.type].push(...entry.data);
      } else {
        changes[entry.type].push(entry.data);
      }
    });

    await syncNow(changes);
  }, [getAllData, syncNow]);

  // Flush queue when back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      flushOfflineQueue();
    }
  }, [wasOffline, isOnline, flushOfflineQueue]);

  // Start auto-sync on mount
  useEffect(() => {
    startSync();
    return () => stopSync();
  }, [startSync, stopSync]);

  // Update sync status when offline
  useEffect(() => {
    if (!isOnline) setSyncStatus('offline');
  }, [isOnline]);

  function getSyncStatus() {
    return {
      status: syncStatus,
      lastSync,
      pendingCount: pendingChanges.length,
      isOnline,
      deviceId: deviceId.current
    };
  }

  return {
    syncStatus,
    lastSync,
    pendingChanges,
    startSync,
    stopSync,
    syncNow,
    queueChange,
    flushOfflineQueue,
    getSyncStatus
  };
}

export default useSyncManager;
