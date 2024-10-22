import { Express } from "express-serve-static-core";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { PLATFORMS, type PlatformValue } from "../utils/constants";
import appConfig from "../config/appConfig";

declare global {
  namespace Express {
    interface Request {
      platform: PlatformValue;
    }
  }
}

const platformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientPlatform = req.headers["x-platform"] as PlatformValue | undefined;

  if (clientPlatform && Object.values(PLATFORMS).includes(clientPlatform)) {
    req.platform = clientPlatform;
  } else {
    // if (appConfig.environment !== "dev") {
    //   return next(createError(400, "Unknown or missing platform"));
    // } else {
    //   req.platform = PLATFORMS.MARKETPLACE;
    // }
    req.platform = PLATFORMS.MARKETPLACE;
  }

  next();
};

export default platformMiddleware;
