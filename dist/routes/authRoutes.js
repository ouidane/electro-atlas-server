"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const premissions_1 = require("../middleware/premissions");
dotenv_1.default.config();
const router = express_1.default.Router();
router.route("/register").post(authController_1.register);
router.route("/login").post(authController_1.login);
router.route("/verify-email").post(authController_1.verifyEmail);
router.route("/forgot-password").post(authController_1.forgotPassword);
router.route("/reset-password").post(authController_1.resetPassword);
router.route("/google").get(authController_1.initiateGoogleAuth);
router.route("/google/:platform/callback").get(authController_1.googleAuthCallback);
router.route("/logout").delete(premissions_1.authenticateUser, authController_1.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map