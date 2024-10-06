import { Request, Response, NextFunction } from "express";
declare const createReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getReviewById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const deleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getReviews, createReview, getReviewById, updateReview, deleteReview };
