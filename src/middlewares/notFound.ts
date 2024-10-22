import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response) => {
  logger.error(`Error: Can't find the route ${req.originalUrl}`);
  return res.status(404).send(`Can't find the route ${req.originalUrl}`);
};

export default notFound;
