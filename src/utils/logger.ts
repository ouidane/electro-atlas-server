import { createLogger, transports, format } from "winston";
import morgan, { StreamOptions } from "morgan";
import path from "path";

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
    }),
  ],
});

// Morgan stream configuration to use Winston's logger
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

// Morgan middleware for HTTP request logging
const morganMiddleware = morgan("combined", { stream });

export { logger, morganMiddleware };
