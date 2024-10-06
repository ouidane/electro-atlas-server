import { Request, Response, NextFunction } from "express";
declare module "express" {
    interface Request {
        platform?: string;
    }
}
declare const platformMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default platformMiddleware;
