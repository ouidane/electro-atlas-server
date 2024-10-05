import { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response) =>
  res.status(404).send(`Can't find the route ${req.originalUrl}`);

export default notFound;
