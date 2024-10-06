import { Request, Response, NextFunction } from "express";
declare const getAllProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, };
