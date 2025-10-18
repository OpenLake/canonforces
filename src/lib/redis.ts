import { Redis } from '@upstash/redis';

// Ensure environment variables exist
if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  throw new Error('Missing Redis environment variables');
}

// Tell TypeScript that Redis will store strings
export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});
