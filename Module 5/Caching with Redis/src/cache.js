
'use strict';

const Redis = require('ioredis');

// Create Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
  retryStrategy: () => null
});

// Get data from Redis
async function cacheGet(key) {
  try {
    const value = await redis.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error('[cache] GET error:', error.message);
    return null;
  }
}

// Store data in Redis with TTL
async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(
      key,
      JSON.stringify(data),
      'EX',
      ttlSeconds
    );
  } catch (error) {
    console.error('[cache] SET error:', error.message);
  }
}

// Delete data from Redis
async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('[cache] DEL error:', error.message);
  }
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDel
};
