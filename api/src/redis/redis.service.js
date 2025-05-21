import Redis from "ioredis";
import redisConfig from "../config/redis.js";
import "dotenv/config";

export class RedisProvider {
  static client = null;

  static async connect() {
    try {
      this.client = new Redis(redisConfig);
      if (process.env.NODE_ENV !== "test") {
        console.log("Successfully connected to Redis");
      }
      return this.client;
    } catch (error) {
      console.error("Redis connection error:", error);
      throw error;
    }
  }
  static getClient() {
    if (!this.client) {
      throw new Error("Redis client not initialized. Call connect() first.");
    }
    return this.client;
  }
}
