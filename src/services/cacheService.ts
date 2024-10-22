import redisClient from "../config/redisConfig";
import { logger } from "../utils/logger";

export const setCache = async (
  key: string,
  value: any,
  expiration?: number
): Promise<void> => {
  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.set(key, serializedValue);
    if (expiration) {
      await redisClient.expire(key, expiration);
    }
  } catch (error: any) {
    logger.error(`Error setting cache for key ${key}: ${error.message}`);
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(`Error getting cache for key ${key}: ${error.message}`);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error: any) {
    logger.error(`Error deleting cache for key ${key}: ${error.message}`);
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await redisClient.flushAll();
    logger.info(`All cache cleared`);
  } catch (error: any) {
    logger.error(`Error clearing cache: ${error.message}`);
  }
};
