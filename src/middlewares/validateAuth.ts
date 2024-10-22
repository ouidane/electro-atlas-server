import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Define reusable schemas
const emailSchema = z
  .string()
  .min(1, "Email is required!")
  .email("Invalid email!");

const passwordSchema = z
  .string()
  .min(1, "Password is required!")
  .min(8, "Password too short!");

// Login Schema
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required!"),
});

// Email Verification Schema
const verifyEmailSchema = z.object({
  email: emailSchema,
  verificationCode: z.string().min(1, "Token is required!"),
});

// Forgot Password Schema
const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset Password Schema
const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, "Token is required!"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

// Generic validation middleware creator
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

// Export validation middlewares
export const validateLogin = validate(loginSchema);
export const validateVerifyEmail = validate(verifyEmailSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword = validate(resetPasswordSchema);
