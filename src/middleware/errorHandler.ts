import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { HttpError } from "http-errors";
import { StockUnavailableError, ValidationError } from "../errors";
import { logger } from "../utils/logger";

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

  if (err instanceof StockUnavailableError) {
    return res
      .status(400)
      .json({ message: err.message, errors: JSON.stringify(err.errors) });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    let errors: any = {};
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
      details: process.env.NODE_ENV === "production" ? undefined : err.stack,
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
      details: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    details: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
