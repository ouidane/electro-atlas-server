import { Request, Response, NextFunction } from "express";
declare const uploadImages: (req: Request, res: Response, next: NextFunction) => void;
declare const uploadSingleImage: (req: Request, res: Response, next: NextFunction) => void;
export { uploadImages, uploadSingleImage };
