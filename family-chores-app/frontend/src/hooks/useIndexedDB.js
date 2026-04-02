import { openDB } from 'idb';

const DB_NAME = 'family-chores-db';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Main data stores
        const stores = [
          'state',
          'tasks',
          'routines',
          'groceries',
          'recipes',
          'wellness',
          'achievements',
          'offline-queue',
          'preferences',
          'users'
        ];
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      }
    });
  }
  return dbPromise;
}

export function useIndexedDB() {
  /**
   * Save data to IndexedDB.
   */
  async function saveData(store, key, value) {
    try {
      const db = await getDB();
      const data = typeof value === 'object' && value !== null ? { ...value, id: key } : { id: key, value };
      await db.put(store, data);
      return true;
    } catch (err) {
      console.error(`IndexedDB saveData error (${store}/${key}):`, err);
      return false;
    }
  }

  /**
   * Get data from IndexedDB.
   */
  async function getData(store, key) {
    try {
      const db = await getDB();
      const result = await db.get(store, key);
      if (!result) return null;
      // If stored with value wrapper, return the value
      if (result.value !== undefined && Object.keys(result).length === 2) {
        return result.value;
      }
      return result;
    } catch (err) {
      console.error(`IndexedDB getData error (${store}/${key}):`, err);
      return null;
    }
  }

  /**
   * Get all data from a store.
   */
  async function getAllData(store) {
    try {
      const db = await getDB();
      return await db.getAll(store);
    } catch (err) {
      console.error(`IndexedDB getAllData error (${store}):`, err);
      return [];
    }
  }

  /**
   * Delete a specific item from a store.
   */
  async function deleteData(store, key) {
    try {
      const db = await getDB();
      await db.delete(store, key);
      return true;
    } catch (err) {
      console.error(`IndexedDB deleteData error (${store}/${key}):`, err);
      return false;
    }
  }

  /**
   * Clear all items from a store.
   */
  async function clearStore(store) {
    try {
      const db = await getDB();
      await db.clear(store);
      return true;
    } catch (err) {
      console.error(`IndexedDB clearStore error (${store}):`, err);
      return false;
    }
  }

  /**
   * Get count of items in a store.
   */
  async function countStore(store) {
    try {
      const db = await getDB();
      return await db.count(store);
    } catch (err) {
      return 0;
    }
  }

  return { saveData, getData, getAllData, deleteData, clearStore, countStore };
}

export default useIndexedDB;
