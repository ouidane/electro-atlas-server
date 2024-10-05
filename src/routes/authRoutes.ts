import dotenv from "dotenv";
import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  initiateGoogleAuth,
  googleAuthCallback,
} from "../controllers/authController";
import { authenticateUser } from "../middleware/premissions";

dotenv.config();
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify-email").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/google").get(initiateGoogleAuth);
router.route("/google/:platform/callback").get(googleAuthCallback);
router.route("/logout").delete(authenticateUser, logout);

export default router;
