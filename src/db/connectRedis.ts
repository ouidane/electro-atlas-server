import dotenv from "dotenv";
import { createClient } from "redis";
import { logger } from "../utils/logger";

dotenv.config();

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 50000,
  },
});

client.on("error", (err) => logger.error(`Redis Client Error: ${err.message}`));
client.connect();

export default client;
