import { createClient } from "redis";
import { Configs } from "../configs";

const redisClient = createClient({
  url: Configs.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.error("Redis connection failed:", error);
    process.exit(1);
  }
};

export { redisClient, connectRedis };
