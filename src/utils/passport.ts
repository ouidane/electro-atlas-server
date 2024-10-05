import dotenv from "dotenv";
dotenv.config();
import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel";
import crypto from "crypto";
import { PLATFORMS } from "./constants";
import Profile from "../models/profileModel";

declare module "express" {
  interface Request {
    user?: any;
  }
}

// Helper function for Local Strategy
const createLocalStrategy = (platform: string) => {
  return new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      const user = await User.findOne({ email, platform });
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }

      const result = await user.comparePassword(password);
      if (!result) {
        return done(null, false, { message: "Invalid email or password" });
      }

      return done(null, user);
    }
  );
};

// Helper function for Google Strategy
const createGoogleStrategy = (
  platform: string,
  clientID: string,
  clientSecret: string,
  callbackURL: string
) => {
  return new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (token, refreshToken, profile, done) => {
      const email = profile.emails?.[0].value;
      const givenName = profile.name?.givenName;
      const familyName = profile.name?.familyName;
      // const name = profile.displayName;
      // const picture = profile.photos?.[0].value;
      // const googleId = profile.id;

      if (!email) {
        return done(new Error("Failed to obtain user email from Google"));
      }

      const user = await User.findOne({ email, platform });
      if (user) return done(null, user);

      const generatePassword = crypto.randomBytes(40).toString("hex");
      const newUser = await User.create({
        platform,
        email,
        password: generatePassword,
        confirmPassword: generatePassword,
        isVerified: true,
        verified: new Date(),
      });

      await Profile.create({
        givenName,
        familyName,
        userId: newUser._id,
      });

      return done(null, newUser);
    }
  );
};

export default (passport: PassportStatic): void => {
  passport.serializeUser((user: any, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id).select("_id role").lean();
    if (!user) {
      return done(new Error("User not found"), null);
    }
    const result = {
      id: user._id,
      role: user.role,
    };
    return done(null, result);
  });

  // Google Strategies ============================================
  passport.use(
    "google-marketplace",
    createGoogleStrategy(
      PLATFORMS.MARKETPLACE,
      process.env.GOOGLE_MARKETPLACE_CLIENT_ID!,
      process.env.GOOGLE_MARKETPLACE_CLIENT_SECRET!,
      "/api/auth/google/marketplace/callback"
    )
  );

  passport.use(
    "google-delivery",
    createGoogleStrategy(
      PLATFORMS.DELIVERY,
      process.env.GOOGLE_DELIVERY_CLIENT_ID!,
      process.env.GOOGLE_DELIVERY_CLIENT_SECRET!,
      "/api/auth/google/delivery/callback"
    )
  );

  passport.use(
    "google-vendor",
    createGoogleStrategy(
      PLATFORMS.VENDOR,
      process.env.GOOGLE_VENDOR_CLIENT_ID!,
      process.env.GOOGLE_VENDOR_CLIENT_SECRET!,
      "/api/auth/google/vendor/callback"
    )
  );

  // Local Strategies ======================================================
  passport.use("local-marketplace", createLocalStrategy(PLATFORMS.MARKETPLACE));
  passport.use("local-delivery", createLocalStrategy(PLATFORMS.DELIVERY));
  passport.use("local-vendor", createLocalStrategy(PLATFORMS.VENDOR));
};
