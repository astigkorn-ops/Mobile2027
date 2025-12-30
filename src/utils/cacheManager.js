// Cache manager for pre-caching critical data

const CRITICAL_ENDPOINTS = [
  '/api/hotlines',
  '/api/resources',
  '/api/checklist',
  '/api/map/locations',
];

class CacheManager {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || '';
  }

  // Pre-cache critical API endpoints
  async preCacheCriticalData() {
    const promises = CRITICAL_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (response.ok) {
          return { endpoint, success: true };
        } else {
          return { endpoint, success: false };
        }
      } catch (error) {
        return { endpoint, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    return results;
  }

  // Clear old cache data
  async clearOldCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('mdrrmo') && !name.includes('-v1')
      );
      
      await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
    }
  }

  // Check if data is available in cache
  async isCached(endpoint) {
    if ('caches' in window) {
      const cache = await caches.open('mdrrmo-api-v1');
      const response = await cache.match(`${this.baseURL}${endpoint}`);
      return !!response;
    }
    return false;
  }

  // Get cache status for all critical endpoints
  async getCacheStatus() {
    const status = {};
    
    for (const endpoint of CRITICAL_ENDPOINTS) {
      status[endpoint] = await this.isCached(endpoint);
    }
    
    return status;
  }

  // Manually trigger cache refresh
  async refreshCache() {
    await this.clearOldCache();
    return await this.preCacheCriticalData();
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;
