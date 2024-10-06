import { Request, Response, NextFunction } from "express";
declare const getWishlists: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getWishlistById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const addItemToWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const deleteItemFromWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getWishlists, getWishlistById, addItemToWishlist, deleteItemFromWishlist, };
