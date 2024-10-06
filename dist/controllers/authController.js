"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallback = exports.initiateGoogleAuth = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.logout = exports.login = exports.register = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
const passport_1 = __importDefault(require("passport"));
const crypto_1 = __importDefault(require("crypto"));
const sendResetPasswordEmail_1 = __importDefault(require("../utils/sendResetPasswordEmail"));
const addCartItemsToDB_1 = require("../utils/addCartItemsToDB");
const validator_1 = __importDefault(require("validator"));
const sendVerificationEmail_1 = __importDefault(require("../utils/sendVerificationEmail"));
const emailVerificationToken_1 = require("../utils/emailVerificationToken");
const passwordResetToken_1 = require("../utils/passwordResetToken");
const constants_1 = require("../utils/constants");
const addWishlistToDB_1 = require("../utils/addWishlistToDB");
const errors_1 = require("../errors");
// Handler for the register endpoint ================================================
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, confirmPassword } = req.body;
    const platform = req.platform;
    const isEmailExists = yield models_1.User.findOne({ email, platform });
    if (isEmailExists) {
        return next((0, http_errors_1.default)(409, "Email already exists"));
    }
    const origin = req.headers.origin;
    const verificationCode = (0, emailVerificationToken_1.generateVerificationCode)();
    const verificationToken = (0, emailVerificationToken_1.generateEmailVerificationToken)(verificationCode, email);
    // Set an expiration time for the verification token
    const tenMinutes = 1000 * 60 * 10;
    const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);
    // Create a new user
    const user = yield models_1.User.create({
        platform,
        email,
        password,
        confirmPassword,
        verificationToken,
        verificationTokenExpirationDate,
    });
    // Send a verification email to the user
    yield (0, sendVerificationEmail_1.default)({
        email,
        verificationCode,
        origin,
    });
    if (platform === constants_1.PLATFORMS.MARKETPLACE) {
        // Add wishlist and cart items to database when user registered
        const cartItems = req.body.cartItems;
        const wishlist = req.body.wishlist;
        yield (0, addCartItemsToDB_1.addCartItemsToDatabase)(cartItems, user._id);
        yield (0, addWishlistToDB_1.addWishlistItemsToDatabase)(wishlist, user._id);
    }
    res.status(200).json({ message: "User registered successfully" });
});
exports.register = register;
// Handler for the login endpoint ===========================================
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const platform = req.platform;
    if (!email || !password) {
        let errors = {};
        if (!email || !validator_1.default.isEmail(email)) {
            errors.email = "Please provide a valid email";
        }
        if (!password) {
            errors.password = "Password is required!";
        }
        throw new errors_1.ValidationError("Validation error", errors);
    }
    const user = yield models_1.User.findOne({ email, platform });
    if (!user) {
        return next((0, http_errors_1.default)(401, "Invalid email or password"));
    }
    if (user && !user.isVerified) {
        const origin = req.headers.origin;
        const verificationCode = (0, emailVerificationToken_1.generateVerificationCode)();
        const verificationToken = (0, emailVerificationToken_1.generateEmailVerificationToken)(verificationCode, email);
        // Set an expiration time for the verification token
        const tenMinutes = 1000 * 60 * 10;
        const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);
        // Update the user's verification token and expiration date
        user.verificationToken = verificationToken;
        user.verificationTokenExpirationDate = verificationTokenExpirationDate;
        yield user.save();
        // Send a verification email to the user
        yield (0, sendVerificationEmail_1.default)({
            email,
            verificationCode,
            origin,
        });
        return next((0, http_errors_1.default)(403, "Email not verified"));
    }
    passport_1.default.authenticate(`local-${platform}`, (err, user) => {
        if (!user || err) {
            return next((0, http_errors_1.default)(401, "Invalid email or password"));
        }
        req.logIn(user, (err) => {
            if (err)
                return next(err);
            res.status(200).json({ message: "Login completed successfully" });
        });
    })(req, res, next);
});
exports.login = login;
// Handler for the logout endpoint ================================================
const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err)
            return next(err);
        res.status(200).json({ message: "Logout completed successfully" });
    });
};
exports.logout = logout;
// Handler for the verify Email endpoint ===========================================
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationCode, email } = req.body;
    const platform = req.platform;
    if (!email || !verificationCode) {
        let errors = {};
        if (!email || !validator_1.default.isEmail(email)) {
            errors.email = "Please provide a valid email";
        }
        if (!verificationCode) {
            errors.verificationToken = "Token is required!";
        }
        throw new errors_1.ValidationError("Validation error", errors);
    }
    const user = yield models_1.User.findOne({ email, platform });
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    const hashedToken = (0, emailVerificationToken_1.validateEmailVerificationToken)(user.verificationToken);
    if (verificationCode !== hashedToken.verificationCode ||
        user.verificationTokenExpirationDate < new Date()) {
        return next((0, http_errors_1.default)(401, "Verification Failed"));
    }
    // Update user's verification status, token, and set the verified timestamp
    user.isVerified = true;
    const verifiedDate = new Date();
    user.verified = verifiedDate;
    user.verificationToken = undefined;
    user.verificationTokenExpirationDate = undefined;
    yield user.save();
    res.status(200).json({ message: "Email Verified" });
});
exports.verifyEmail = verifyEmail;
// Handler for the forgot password endpoint ============================
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const platform = req.platform;
    if (!email || !validator_1.default.isEmail(email)) {
        const errors = { email: "Please provide a valid email" };
        throw new errors_1.ValidationError("Validation error", errors);
    }
    const user = yield models_1.User.findOne({ email, platform });
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    // Generate a random password reset token
    const origin = req.headers.origin;
    const passwordToken = crypto_1.default.randomBytes(70).toString("hex");
    const resetToken = (0, passwordResetToken_1.generateResetToken)({ userId: user.id, passwordToken });
    // Set an expiration time for the password reset token
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    // Update user's passwordToken and passwordTokenExpirationDate in the database
    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    yield user.save();
    // Send a reset password email to the user
    yield (0, sendResetPasswordEmail_1.default)({
        email: user.email,
        token: resetToken,
        origin,
    });
    res.status(200).json({
        message: "Please check your email for the reset password link",
    });
});
exports.forgotPassword = forgotPassword;
// Handler for the reset password endpoint =====================================
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken, password, confirmPassword } = req.body;
    // Validate the reset token and password
    if (!resetToken || !password || password.length < 8) {
        let errors = {};
        if (!resetToken) {
            errors.password = "Token is required!";
        }
        if (password && password.length < 8) {
            errors.password = "Password should be at least 8 characters long";
        }
        if (!password) {
            errors.password = "Password is required!";
        }
        if (confirmPassword === password) {
            errors.confirmPassword = "Passwords do not match";
        }
        if (!confirmPassword) {
            errors.confirmPassword = "Please provide confirm password";
        }
        throw new errors_1.ValidationError("Validation error", errors);
    }
    const hashedToken = (0, passwordResetToken_1.validateResetToken)(resetToken);
    if (!hashedToken) {
        return next((0, http_errors_1.default)(401, "Invalid or expired token."));
    }
    const user = yield models_1.User.findById(hashedToken.userId);
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    // Check if the password token has expired
    if (user.passwordToken !== hashedToken.passwordToken ||
        !user.passwordTokenExpirationDate ||
        user.passwordTokenExpirationDate <= new Date()) {
        return next((0, http_errors_1.default)(401, "Invalid or expired token."));
    }
    // Update the user's password and clear the password token and expiration date
    user.password = password;
    user.passwordToken = undefined;
    user.passwordTokenExpirationDate = undefined;
    yield user.save();
    res.status(200).json({ message: "Password reset successful" });
});
exports.resetPassword = resetPassword;
// Initiate Google Authentication
const initiateGoogleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirectUrl = req.query.callbackUrl;
    const platform = req.platform;
    passport_1.default.authenticate(`google-${platform}`, {
        scope: ["profile", "email"],
        state: encodeURIComponent(redirectUrl || "/"),
    })(req, res, next);
});
exports.initiateGoogleAuth = initiateGoogleAuth;
// Google Authentication Callback
const googleAuthCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackUrl = req.query.state;
    const redirectUrl = decodeURIComponent(callbackUrl);
    const platform = req.params.platform;
    const origin = constants_1.platformMap[platform];
    passport_1.default.authenticate(`google-${platform}`, (err, user, info) => {
        if (!user || err) {
            return res.redirect(`${origin}/login?error=Failed to sign in with Google`);
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.redirect(`${origin}/login?error=Failed to sign in with Google`);
            }
            // Redirect the user to the intended destination after successful login
            res.redirect(`${origin}/${redirectUrl}`);
        });
    })(req, res, next);
});
exports.googleAuthCallback = googleAuthCallback;
//# sourceMappingURL=authController.js.map