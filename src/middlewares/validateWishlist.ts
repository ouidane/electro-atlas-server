import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { z } from "zod";

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

const addItemSchema = z.object({
  productId: z.string().refine(isValidObjectId, "Invalid product ID"),
  sku: z.string().min(1),
});

const deleteItemSchema = z.object({
  productId: z.string().refine(isValidObjectId, "Invalid product ID"),
  sku: z.string().min(1),
});

// Generic validation middleware creator
const validate = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      throw error;
    }
  };
};

export const validateAddItem = validate(addItemSchema);
export const validateDeleteItem = validate(deleteItemSchema);
