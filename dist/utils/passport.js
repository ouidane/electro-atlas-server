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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const userModel_1 = __importDefault(require("../models/userModel"));
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("./constants");
const profileModel_1 = __importDefault(require("../models/profileModel"));
// Helper function for Local Strategy
const createLocalStrategy = (platform) => {
    return new passport_local_1.Strategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
    }, (req, email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userModel_1.default.findOne({ email, platform });
        if (!user) {
            return done(null, false, { message: "Invalid email or password" });
        }
        const result = yield user.comparePassword(password);
        if (!result) {
            return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
    }));
};
// Helper function for Google Strategy
const createGoogleStrategy = (platform, clientID, clientSecret, callbackURL) => {
    return new passport_google_oauth20_1.Strategy({
        clientID,
        clientSecret,
        callbackURL,
    }, (token, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        const givenName = (_b = profile.name) === null || _b === void 0 ? void 0 : _b.givenName;
        const familyName = (_c = profile.name) === null || _c === void 0 ? void 0 : _c.familyName;
        // const name = profile.displayName;
        // const picture = profile.photos?.[0].value;
        // const googleId = profile.id;
        if (!email) {
            return done(new Error("Failed to obtain user email from Google"));
        }
        const user = yield userModel_1.default.findOne({ email, platform });
        if (user)
            return done(null, user);
        const generatePassword = crypto_1.default.randomBytes(40).toString("hex");
        const newUser = yield userModel_1.default.create({
            platform,
            email,
            password: generatePassword,
            confirmPassword: generatePassword,
            isVerified: true,
            verified: new Date(),
        });
        yield profileModel_1.default.create({
            givenName,
            familyName,
            userId: newUser._id,
        });
        return done(null, newUser);
    }));
};
exports.default = (passport) => {
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });
    passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userModel_1.default.findById(id).select("_id role").lean();
        if (!user) {
            return done(new Error("User not found"), null);
        }
        const result = {
            id: user._id,
            role: user.role,
        };
        return done(null, result);
    }));
    // Google Strategies ============================================
    passport.use("google-marketplace", createGoogleStrategy(constants_1.PLATFORMS.MARKETPLACE, process.env.GOOGLE_MARKETPLACE_CLIENT_ID, process.env.GOOGLE_MARKETPLACE_CLIENT_SECRET, "/api/auth/google/marketplace/callback"));
    passport.use("google-delivery", createGoogleStrategy(constants_1.PLATFORMS.DELIVERY, process.env.GOOGLE_DELIVERY_CLIENT_ID, process.env.GOOGLE_DELIVERY_CLIENT_SECRET, "/api/auth/google/delivery/callback"));
    passport.use("google-vendor", createGoogleStrategy(constants_1.PLATFORMS.VENDOR, process.env.GOOGLE_VENDOR_CLIENT_ID, process.env.GOOGLE_VENDOR_CLIENT_SECRET, "/api/auth/google/vendor/callback"));
    // Local Strategies ======================================================
    passport.use("local-marketplace", createLocalStrategy(constants_1.PLATFORMS.MARKETPLACE));
    passport.use("local-delivery", createLocalStrategy(constants_1.PLATFORMS.DELIVERY));
    passport.use("local-vendor", createLocalStrategy(constants_1.PLATFORMS.VENDOR));
};
//# sourceMappingURL=passport.js.map