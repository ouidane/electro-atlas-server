import { Request, Response, NextFunction } from "express";
declare const productFilters: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { productFilters };
