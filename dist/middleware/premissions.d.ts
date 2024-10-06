import { Request, Response, NextFunction } from "express";
export declare const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizePermissions: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeCartAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeProductAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeReviewAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeWishlistAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeOrderAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
