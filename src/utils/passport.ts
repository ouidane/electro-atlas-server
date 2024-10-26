import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User, Profile } from "../models";
import crypto from "crypto";
import { PLATFORMS } from "./constants";
import { authConfig } from "../config/authConfig";

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

      console.log("profile", profile);

      if (!email) {
        return done(new Error("Failed to obtain user email from Google"));
      }

      console.log("email", email);

      const user = await User.findOne({ email, platform });

      console.log("user", user);

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

      console.log("newUser", newUser);

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
      authConfig.googleMarketplace.clientId,
      authConfig.googleMarketplace.clientSecret,
      "/api/v1/auth/google/marketplace/callback"
    )
  );

  passport.use(
    "google-vendor",
    createGoogleStrategy(
      PLATFORMS.VENDOR,
      authConfig.googleVendor.clientId,
      authConfig.googleVendor.clientSecret,
      "/api/v1/auth/google/vendor/callback"
    )
  );

  // Local Strategies ======================================================
  passport.use("local-marketplace", createLocalStrategy(PLATFORMS.MARKETPLACE));
  passport.use("local-vendor", createLocalStrategy(PLATFORMS.VENDOR));
};
