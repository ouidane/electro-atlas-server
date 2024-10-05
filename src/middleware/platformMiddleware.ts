import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { PLATFORMS } from "../utils/constants";

declare module "express" {
  interface Request {
    platform?: string;
  }
}

dotenv.config();

const platformMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;

  // if (origin?.includes(process.env.MARKETPLACE_URL)) {
  //   req.platform = PLATFORM.MARKETPLACE;
  // } else if (origin?.includes(process.env.DELIVERY_URL)) {
  //   req.platform = PLATFORM.DELIVERY;
  // } else if (origin?.includes(process.env.VENDOR_URL)) {
  //   req.platform = PLATFORM.VENDOR;
  // } else {
  //   // Throw an error if the platform is unknown
  //   return next(createError(400, "Unknown platform"));
  // }

  req.platform = PLATFORMS.MARKETPLACE;

  next();
};

export default platformMiddleware;
