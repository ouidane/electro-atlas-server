import { Request, Response, NextFunction } from "express";
declare const getNavData: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export { getNavData };
