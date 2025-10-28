export const fetchWithCache = async (url, cacheKey, expiryMinutes = 60) => {
  // Check if Cache API is available
  if ("caches" in window) {
    try {
      // Try to get from cache
      const cache = await caches.open("api-cache");
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        // Check if expired
        const cachedData = await cachedResponse.json();
        const now = new Date().getTime();
        const expiryTime = expiryMinutes * 60 * 1000;

        if (cachedData.timestamp && now - cachedData.timestamp < expiryTime) {
          console.log(`Cache hit for ${url}`);
          return cachedData.data;
        }
      }

      // If no cached data or expired, fetch from API
      console.log(`Cache miss for ${url}, fetching fresh data`);
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();

      // Clone the response and store in cache with timestamp
      const cacheData = {
        data,
        timestamp: new Date().getTime(),
      };

      const cacheResponse = new Response(JSON.stringify(cacheData), {
        headers: { "Content-Type": "application/json" },
      });

      cache.put(url, cacheResponse);

      return data;
    } catch (error) {
      console.error("Cache error:", error);
      // If cache fails, just fetch and return data without caching
      const response = await fetch(url);
      return await response.json();
    }
  }

  // If Cache API is not available, just fetch and return data
  console.warn("Cache API not available, fetching without caching");
  const response = await fetch(url);
  return await response.json();
};

export const clearCache = async () => {
  if ("caches" in window) {
    try {
      await caches.delete("api-cache");
      console.log("Cache cleared successfully");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
};

export const clearSpecificCache = async (url) => {
  if ("caches" in window) {
    try {
      const cache = await caches.open("api-cache");
      await cache.delete(url);
      console.log(`Cache cleared for ${url}`);
    } catch (error) {
      console.error("Error clearing specific cache:", error);
    }
  }
};
