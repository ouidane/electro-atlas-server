import express from "express";
import { authController } from "../controllers/authController";
import { authenticateUser } from "../middlewares/premissions";
import {
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/validateAuth";

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(validateLogin, authController.login);
router
  .route("/verify-email")
  .post(validateVerifyEmail, authController.verifyEmail);
router.post("/resend-verification-code", authController.resendVerificationCode);
router
  .route("/forgot-password")
  .post(validateForgotPassword, authController.forgotPassword);
router
  .route("/reset-password")
  .post(validateResetPassword, authController.resetPassword);
router.route("/google").get(authController.initiateGoogleAuth);
router
  .route("/google/:platform/callback")
  .get(authController.googleAuthCallback);
router.route("/logout").delete(authenticateUser, authController.logout);

export default router;
