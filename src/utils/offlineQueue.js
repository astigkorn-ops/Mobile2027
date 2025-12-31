// IndexedDB manager for offline incident queue

const DB_NAME = 'MDRRMOOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'incidents';

class OfflineQueueManager {
  constructor() {
    this.db = null;
    this.listeners = [];
    this.syncInProgress = false;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineQueue] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineQueue] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          
          // Create indexes
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });
          
          console.log('[OfflineQueue] Object store created');
        }
      };
    });
  }

  // Add incident to queue
  async addIncident(incidentData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const incident = {
        data: incidentData,
        timestamp: new Date().toISOString(),
        synced: false,
        type: 'incident',
        attempts: 0,
        lastAttempt: null,
      };

      const request = objectStore.add(incident);

      request.onsuccess = () => {
        console.log('[OfflineQueue] Incident added to queue:', request.result);
        this.notifyListeners();
        
        // Register background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-incidents')
              .then(() => console.log('[OfflineQueue] Background sync registered'))
              .catch(err => console.error('[OfflineQueue] Failed to register background sync:', err));
          });
        }
        
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[OfflineQueue] Failed to add incident:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all queued items
  async getQueuedItems(type = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      let request;

      if (type) {
        // Get items by type
        const index = objectStore.index('type');
        request = index.getAll(IDBKeyRange.only(type));
      } else {
        request = objectStore.getAll();
      }

      request.onsuccess = () => {
        const items = request.result.filter(item => !item.synced);
        resolve(items);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get all queued incidents
  async getQueuedIncidents() {
    return this.getQueuedItems('incident');
  }

  // Get count of queued items
  async getQueueCount(type = null) {
    const items = await this.getQueuedItems(type);
    return items.length;
  }

  // Mark item as synced
  async markAsSynced(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const getRequest = objectStore.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const updateRequest = objectStore.put(item);
          
          updateRequest.onsuccess = () => {
            console.log('[OfflineQueue] Item marked as synced:', id);
            this.notifyListeners();
            resolve();
          };
          
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete synced items
  async deleteSyncedItems() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          objectStore.delete(cursor.primaryKey);
          console.log('[OfflineQueue] Deleted synced item:', cursor.primaryKey);
          cursor.continue();
        } else {
          this.notifyListeners();
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Add a generic item to queue
  async addToQueue(data, type = 'generic') {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const item = {
        data: data,
        timestamp: new Date().toISOString(),
        synced: false,
        type: type,
        attempts: 0,
        lastAttempt: null,
      };

      const request = objectStore.add(item);

      request.onsuccess = () => {
        console.log(`[OfflineQueue] ${type} item added to queue:`, request.result);
        this.notifyListeners();
        
        // Register background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-incidents')
              .then(() => console.log('[OfflineQueue] Background sync registered'))
              .catch(err => console.error('[OfflineQueue] Failed to register background sync:', err));
          });
        }
        
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`[OfflineQueue] Failed to add ${type} item:`, request.error);
        reject(request.error);
      };
    });
  }

  // Sync all queued items
  async syncAll() {
    if (this.syncInProgress) {
      console.log('[OfflineQueue] Sync already in progress, skipping');
      return { success: 0, failed: 0, errors: [] };
    }

    this.syncInProgress = true;
    console.log('[OfflineQueue] Starting sync process');

    try {
      const items = await this.getQueuedItems();
      
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const item of items) {
        try {
          // Update attempt count and timestamp
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const objectStore = transaction.objectStore(STORE_NAME);
          const getRequest = objectStore.get(item.id);

          getRequest.onsuccess = () => {
            const updatedItem = getRequest.result;
            updatedItem.attempts = (updatedItem.attempts || 0) + 1;
            updatedItem.lastAttempt = new Date().toISOString();
            objectStore.put(updatedItem);
          };

          // Try to send item to server based on type
          let response;
          if (item.type === 'incident') {
            // Handle incident data with Supabase
            const createClient = await import('../lib/supabase').then(mod => mod.createClient);
            const supabase = createClient();
            
            if (supabase) {
              const { data, error } = await supabase
                .from('incidents')
                .insert([item.data]);
              
              if (error) {
                throw error;
              }
              
              response = { ok: true, data };
            } else {
              // Fallback to regular API endpoint if Supabase not configured
              response = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(item.data),
              });
            }
          } else {
            // For other types, you can implement specific endpoints
            console.warn(`[OfflineQueue] Unknown item type: ${item.type}, using generic endpoint`);
            response = await fetch('/api/data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(item.data),
            });
          }

          if (response.ok || (response.data && !response.error)) {
            await this.markAsSynced(item.id);
            results.success++;
            console.log(`[OfflineQueue] Successfully synced ${item.type} item:`, item.id);
          } else {
            results.failed++;
            console.error(`[OfflineQueue] Failed to sync ${item.type} item:`, item.id, response.status || response.error);
            results.errors.push({
              id: item.id,
              type: item.type,
              error: `Server responded with ${response.status || response.error}`,
            });
          }
        } catch (error) {
          results.failed++;
          console.error(`[OfflineQueue] Network error syncing ${item.type} item:`, item.id, error);
          results.errors.push({
            id: item.id,
            type: item.type,
            error: error.message,
          });
        }
      }

      // Clean up synced items
      if (results.success > 0) {
        await this.deleteSyncedItems();
      }

      console.log(`[OfflineQueue] Sync completed: ${results.success} success, ${results.failed} failed`);
      
      // Notify all clients about sync completion
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'SYNC_COMPLETE',
            synced: results.success,
            failed: results.failed
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('[OfflineQueue] Sync process failed:', error);
      return { success: 0, failed: 0, errors: [{ error: error.message }] };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Add listener for queue changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.getQueueCount().then(count => {
      this.listeners.forEach(callback => callback(count));
    });
  }

  // Sync when back online
  async initSyncOnOnline() {
    // Listen for online event
    window.addEventListener('online', async () => {
      console.log('[OfflineQueue] Online detected, starting sync in 5 seconds...');
      // Delay to ensure connection is stable
      setTimeout(() => {
        this.syncAll().catch(err => {
          console.error('[OfflineQueue] Error during online sync:', err);
        });
      }, 5000);
    });

    // Sync on startup if online
    if (navigator.onLine) {
      console.log('[OfflineQueue] Online at startup, starting sync...');
      setTimeout(() => {
        this.syncAll().catch(err => {
          console.error('[OfflineQueue] Error during startup sync:', err);
        });
      }, 2000);
    }
  }

  // Clear all data (for testing)
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('[OfflineQueue] All data cleared');
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
const offlineQueue = new OfflineQueueManager();
export default offlineQueue;