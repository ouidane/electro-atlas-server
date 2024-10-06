import { Request, Response, NextFunction } from "express";
declare const bestSeller: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { bestSeller };
