import dotenv from "dotenv";
import session from "express-session";
import RedisStore from "connect-redis";
import redisClient from "../db/connectRedis";

dotenv.config();

// Initialize session middleware
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "user-session:",
});

export default session({
  store: redisStore,
  secret: process.env.SESSION_PRIVATE_KEY as string,
  saveUninitialized: false,
  resave: false,
  name: "sessionId",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 30,
    sameSite: "lax",
  },
});
