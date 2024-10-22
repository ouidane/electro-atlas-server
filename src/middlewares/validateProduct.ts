import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

const ProductVariantSchema = z
  .object({
    variation: z.string(),
    sku: z.string(),
    inventory: z.number().int().min(0),
    globalPrice: z.number().min(0),
    salePrice: z.number().min(0).optional(),
    discountPercent: z.number().min(0).max(100).optional(),
    saleStartDate: z.date().optional(),
    saleEndDate: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.saleEndDate ||
      !data.saleStartDate ||
      data.saleEndDate > data.saleStartDate,
    {
      message: "saleEndDate must be after saleStartDate",
      path: ["saleEndDate"],
    }
  );

const ProductSpecificationsSchema = z.object({
  certifications: z.enum([
    "ASTM Certified",
    "Australian Made",
    "Eco Friendly",
    "Fair Trade",
    "Made in Morocco",
    "Swiss Made",
    "Hong Kong Made",
    "Made in Turkey",
  ]),
  ramSize: z.number().optional(),
  graphics: z.string().optional(),
  processor: z.string().optional(),
  cpuSpeed: z.number().optional(),
  cpuManufacturer: z.string().optional(),
  graphicsProcessorManufacturer: z.string().optional(),
  screenSize: z.number().optional(),
  resolution: z.string().optional(),
  storage: z.number().optional(),
  memory: z.number().optional(),
  cameraResolution: z.number().optional(),
  operatingSystem: z.string().optional(),
  audioOutput: z.string().optional(),
  connectivity: z.string().optional(),
  batteryLife: z.number().optional(),
  weight: z.number().optional(),
  sensor: z.string().optional(),
  waterResistance: z.boolean().optional(),
  fitnessTracking: z.boolean().optional(),
  sleepTracking: z.boolean().optional(),
  compatiblePlatform: z.string().optional(),
  voiceControl: z.boolean().optional(),
  energyEfficiency: z.string().optional(),
  remoteControl: z.boolean().optional(),
});

const ProductSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(1000),
  brand: z.string(),
  color: z.string().optional(),
  categoryId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid categoryId" }),
  parentCategoryId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid parentCategoryId" }),
  variants: z.array(ProductVariantSchema).min(1),
  specifications: ProductSpecificationsSchema,
});

const UpdateProductSchema = ProductSchema.partial().extend({
  imagesToDelete: z.array(z.string()).optional(),
  reorderedImages: z.array(z.string()).optional(),
});

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

export const validateProduct = validate(ProductSchema);
export const validateUpdateProduct = validate(UpdateProductSchema);
