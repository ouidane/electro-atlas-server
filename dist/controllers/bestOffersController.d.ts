import { Request, Response, NextFunction } from "express";
declare const bestOffers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { bestOffers };
