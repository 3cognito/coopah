import { createClient } from "redis";
import { Configs } from "../configs";
import { plainToInstance } from "class-transformer";

const client = createClient({
  url: Configs.REDIS_URL,
  //limit reconnection attempts
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.error("Redis connection failed:", error);
    process.exit(1);
  }
};

export class RedisClient {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async addObject<V extends object>(key: string, value: V) {
    await this.client.set(key, JSON.stringify(value), {
      EX: 24 * 3600, //one day in seconds
    });
  }

  async getObject<V extends object>(key: string, cls: new () => V) {
    const data = await this.client.get(key);
    if (!data) return;
    return plainToInstance(cls, JSON.parse(data));
  }

  async deleteObject(k: string) {
    await this.client.del(k);
  }
}

export const redisClient = new RedisClient(client);
