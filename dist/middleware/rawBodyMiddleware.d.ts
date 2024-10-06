import { Request, Response, NextFunction } from "express";
declare const rawBodyMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default rawBodyMiddleware;
