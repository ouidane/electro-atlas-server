import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ROLE, CITIES, COUNTRIES } from "../utils/constants";

const phoneRegex = /^(?:\+212|0)(?:5|6|7)[0-9]{8}$/;

const UserSchema = z.object({
  familyName: z
    .string()
    .min(1, "FamilyName is required")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "FamilyName must contain only letters, spaces, or hyphens"
    ),
  givenName: z
    .string()
    .min(1, "GivenName is required")
    .regex(
      /^[a-zA-Z\s-]+$/,
      "GivenName must contain only letters, spaces, or hyphens"
    ),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  contactEmail: z.string().email("Invalid contact email").optional(),
  contactPhone: z
    .string()
    .regex(phoneRegex, "Invalid contact phone number")
    .optional(),
  contactWebsite: z.string().url("Invalid contact website URL").optional(),
  line1: z
    .string()
    .min(2, "Address is required")
    .max(100, "Address is too long"),
  line2: z
    .string()
    .min(2, "Invalid address")
    .max(100, "Address is too long")
    .optional(),
  postalCode: z.string().regex(/^\d{5}$/, "Invalid postal code"),
  city: z.enum([...CITIES] as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid city" }),
  }),
  country: z.enum([...COUNTRIES] as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid country" }),
  }),
  description: z
    .string()
    .min(2, "Invalid description")
    .max(200, "Description is too long")
    .optional(),
  role: z
    .enum(Object.values(ROLE) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid role" }),
    })
    .optional(),
});

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    UserSchema.parse(req.body);
    next();
  } catch (error) {
    throw error;
  }
};

export default validateUser;
