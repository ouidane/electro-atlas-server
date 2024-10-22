import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Schemas
const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1, "Comment cannot be empty").optional(),
});

// Middleware factory
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      throw error;
    }
  };
};

// Exported middleware
export const validateCreateReview = validate(createReviewSchema);
export const validateUpdateReview = validate(updateReviewSchema);
