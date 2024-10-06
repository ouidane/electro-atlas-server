import { Request, Response, NextFunction } from "express";
declare const recommendedProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { recommendedProducts };
