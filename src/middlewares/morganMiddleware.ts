import morgan, { StreamOptions } from "morgan";
import { logger } from "../utils/logger";

// Morgan stream configuration to use Winston's logger
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

// Morgan middleware for HTTP request logging
const morganMiddleware = morgan("combined", { stream });

export default morganMiddleware;
