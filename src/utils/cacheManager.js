// Cache manager for pre-caching critical data

const CRITICAL_ENDPOINTS = [
  '/api/hotlines',
  '/api/resources',
  '/api/checklist',
  '/api/map/locations',
  '/api/disaster-guidelines',
  '/api/typhoon-data',
];

class CacheManager {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || '';
    this.cacheNames = {
      static: 'mdrrmo-v1',
      runtime: 'mdrrmo-runtime-v1',
      api: 'mdrrmo-api-v1'
    };
  }

  // Pre-cache critical API endpoints
  async preCacheCriticalData() {
    const promises = CRITICAL_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (response.ok) {
          // Add to API cache
          if ('caches' in window) {
            const cache = await caches.open(this.cacheNames.api);
            await cache.put(`${this.baseURL}${endpoint}`, response.clone());
          }
          return { endpoint, success: true };
        } else {
          return { endpoint, success: false };
        }
      } catch (error) {
        console.error(`[CacheManager] Failed to cache ${endpoint}:`, error);
        return { endpoint, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    console.log(`[CacheManager] Cached ${successCount}/${results.length} critical endpoints`);
    return results;
  }

  // Pre-cache static assets
  async preCacheStaticAssets() {
    const staticAssets = [
      '/',
      '/index.html',
      '/logome.webp',
      '/p1.jpeg',
      '/p2.jpeg',
      '/p3.jpeg',
      '/p4.jpeg',
      '/p5.jpeg',
      '/static/css/main.css',
      '/static/js/main.js',
      '/manifest.json',
    ];

    if ('caches' in window) {
      const cache = await caches.open(this.cacheNames.static);
      await cache.addAll(staticAssets);
      console.log(`[CacheManager] Cached ${staticAssets.length} static assets`);
    }
  }

  // Pre-cache map tiles if needed
  async preCacheMapTiles() {
    // This would be implemented based on the specific map tile system used
    // For now, we'll just log this for future implementation
    console.log('[CacheManager] Map tile caching would be implemented here');
  }

  // Clear old cache data
  async clearOldCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('mdrrmo') && !name.includes('-v1')
      );
      
      await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
      console.log(`[CacheManager] Cleared ${oldCaches.length} old caches`);
    }
  }

  // Check if data is available in cache
  async isCached(endpoint) {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheNames.api);
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
    const apiResults = await this.preCacheCriticalData();
    await this.preCacheStaticAssets();
    return apiResults;
  }

  // Cache a specific resource
  async cacheResource(url, data) {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheNames.api);
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(url, response);
      console.log(`[CacheManager] Cached resource: ${url}`);
    }
  }

  // Get cached resource
  async getCachedResource(url) {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheNames.api);
      const response = await cache.match(url);
      if (response) {
        return await response.json();
      }
    }
    return null;
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;