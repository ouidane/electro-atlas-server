import { Request, Response, NextFunction } from "express";
declare const validateUser: (req: Request, res: Response, next: NextFunction) => void;
export default validateUser;
