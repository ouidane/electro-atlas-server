import session from "express-session";
import RedisStore from "connect-redis";
import redisClient from "../config/redisConfig";
import appConfig from "../config/appConfig";

// Initialize session middleware
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "user-session:",
});

const sessionMiddleware = session({
  store: redisStore,
  secret: appConfig.sessionPrivateKey,
  saveUninitialized: false,
  resave: false,
  name: "sessionId",
  cookie: {
    secure: appConfig.environment !== "dev",
    httpOnly: true,
    maxAge: 1000 * 60 * 30,
    sameSite: "lax",
  },
});

export default sessionMiddleware;
