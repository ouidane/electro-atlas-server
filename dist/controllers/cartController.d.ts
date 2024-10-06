import { Request, Response, NextFunction } from "express";
declare const getCarts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getCartById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getItemById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const addItemToCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updateItemInCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const deleteItemFromCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const clearCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getCarts, getCartById, getItemById, addItemToCart, updateItemInCart, deleteItemFromCart, clearCart, };
