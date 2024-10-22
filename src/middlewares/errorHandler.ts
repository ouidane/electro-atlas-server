import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { HttpError } from "http-errors";
import { ValidationError } from "../errors";
import { logger } from "../utils/logger";
import appConfig from "../config/appConfig";
import { z } from "zod";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err}`);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ValidationError) {
    const errors = JSON.stringify(err.errors);
    return res.status(400).json({ message: err.message, errors });
  }

  if (err instanceof z.ZodError) {
    const errors = err.errors.reduce((acc, error) => {
      acc[error.path.join(".")] = error.message;
      return acc;
    }, {} as Record<string, string>);

    return res
      .status(400)
      .json({ message: "Validation failed", errors: JSON.stringify(errors) });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors: any = {};
    Object.values(err.errors).forEach((item) => {
      return (errors[item.path] = item.message);
    });

    return res
      .status(400)
      .json({ message: "Validation error", errors: JSON.stringify(errors) });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Cast Error",
      details: appConfig.environment !== "dev" ? undefined : err.stack,
    });
  }

  if ((err as any).code === 11000) {
    const keyPattern = Object.keys((err as any).keyPattern);

    if (keyPattern.includes("productId") && keyPattern.includes("userId")) {
      return res
        .status(409)
        .json({ message: "User already reviews the product" });
    }

    if (keyPattern.includes("email") && keyPattern.includes("platform")) {
      return res.status(409).json({ message: "Email already exist" });
    }

    return res.status(409).json({
      message: "Duplicate Key Error, The Resource Already Exists",
      details: appConfig.environment !== "dev" ? undefined : err.stack,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    details: appConfig.environment !== "dev" ? undefined : err.stack,
  });
};

export default errorHandler;
