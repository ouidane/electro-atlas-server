import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { User, Profile } from "../models";
import passport from "passport";
import crypto from "crypto";
import sendResetPasswordEmail from "../utils/sendResetPasswordEmail";
import { addCartItemsToDatabase } from "../utils/addCartItemsToDB";
import validator from "validator";
import sendVerificationEmail from "../utils/sendVerificationEmail";
import {
  generateEmailVerificationToken,
  generateVerificationCode,
  validateEmailVerificationToken,
} from "../utils/emailVerificationToken";
import {
  generateResetToken,
  validateResetToken,
} from "../utils/passwordResetToken";
import { PLATFORMS, platformMap } from "../utils/constants";
import { addWishlistItemsToDatabase } from "../utils/addWishlistToDB";
import { ValidationError } from "../errors";

// Handler for the register endpoint ================================================
const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, confirmPassword } = req.body;
  const platform = req.platform;

  const isEmailExists = await User.findOne({ email, platform });
  if (isEmailExists) {
    return next(createError(409, "Email already exists"));
  }

  const origin = req.headers.origin;
  const verificationCode = generateVerificationCode();
  const verificationToken = generateEmailVerificationToken(
    verificationCode,
    email
  );

  // Set an expiration time for the verification token
  const tenMinutes = 1000 * 60 * 10;
  const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);

  // Create a new user
  const user = await User.create({
    platform,
    email,
    password,
    confirmPassword,
    verificationToken,
    verificationTokenExpirationDate,
  });

  // Send a verification email to the user
  await sendVerificationEmail({
    email,
    verificationCode,
    origin,
  });

  if (platform === PLATFORMS.MARKETPLACE) {
    // Add wishlist and cart items to database when user registered
    const cartItems = req.body.cartItems;
    const wishlist = req.body.wishlist;
    await addCartItemsToDatabase(cartItems, user._id);
    await addWishlistItemsToDatabase(wishlist, user._id);
  }

  res.status(200).json({ message: "User registered successfully" });
};

// Handler for the login endpoint ===========================================
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const platform = req.platform;

  if (!email || !password) {
    let errors = {} as any;
    if (!email || !validator.isEmail(email)) {
      errors.email = "Please provide a valid email";
    }
    if (!password) {
      errors.password = "Password is required!";
    }

    throw new ValidationError("Validation error", errors);
  }

  const user = await User.findOne({ email, platform });
  if (!user) {
    return next(createError(401, "Invalid email or password"));
  }

  if (user && !user.isVerified) {
    const origin = req.headers.origin;
    const verificationCode = generateVerificationCode();
    const verificationToken = generateEmailVerificationToken(
      verificationCode,
      email
    );

    // Set an expiration time for the verification token
    const tenMinutes = 1000 * 60 * 10;
    const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);

    // Update the user's verification token and expiration date
    user.verificationToken = verificationToken;
    user.verificationTokenExpirationDate = verificationTokenExpirationDate;
    await user.save();

    // Send a verification email to the user
    await sendVerificationEmail({
      email,
      verificationCode,
      origin,
    });

    return next(createError(403, "Email not verified"));
  }

  passport.authenticate(
    `local-${platform}`,
    (err: Error | null, user: Express.User | false) => {
      if (!user || err) {
        return next(createError(401, "Invalid email or password"));
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        res.status(200).json({ message: "Login completed successfully" });
      });
    }
  )(req, res, next);
};

// Handler for the logout endpoint ================================================
const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) return next(err);

    res.status(200).json({ message: "Logout completed successfully" });
  });
};

// Handler for the verify Email endpoint ===========================================
const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { verificationCode, email } = req.body;
  const platform = req.platform;

  if (!email || !verificationCode) {
    let errors = {} as any;
    if (!email || !validator.isEmail(email)) {
      errors.email = "Please provide a valid email";
    }
    if (!verificationCode) {
      errors.verificationToken = "Token is required!";
    }

    throw new ValidationError("Validation error", errors);
  }

  const user = await User.findOne({ email, platform });
  if (!user) {
    return next(createError(404, "User not found"));
  }

  const hashedToken = validateEmailVerificationToken(user.verificationToken);
  if (
    verificationCode !== hashedToken.verificationCode ||
    user.verificationTokenExpirationDate < new Date()
  ) {
    return next(createError(401, "Verification Failed"));
  }

  // Update user's verification status, token, and set the verified timestamp
  user.isVerified = true;
  const verifiedDate = new Date();
  user.verified = verifiedDate;
  user.verificationToken = undefined;
  user.verificationTokenExpirationDate = undefined;
  await user.save();

  res.status(200).json({ message: "Email Verified" });
};

// Handler for the forgot password endpoint ============================
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const platform = req.platform;

  if (!email || !validator.isEmail(email)) {
    const errors = { email: "Please provide a valid email" };
    throw new ValidationError("Validation error", errors);
  }

  const user = await User.findOne({ email, platform });
  if (!user) {
    return next(createError(404, "User not found"));
  }

  // Generate a random password reset token
  const origin = req.headers.origin;
  const passwordToken = crypto.randomBytes(70).toString("hex");
  const resetToken = generateResetToken({ userId: user.id, passwordToken });

  // Set an expiration time for the password reset token
  const tenMinutes = 1000 * 60 * 10;
  const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

  // Update user's passwordToken and passwordTokenExpirationDate in the database
  user.passwordToken = passwordToken;
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  await user.save();

  // Send a reset password email to the user
  await sendResetPasswordEmail({
    email: user.email,
    token: resetToken,
    origin,
  });

  res.status(200).json({
    message: "Please check your email for the reset password link",
  });
};

// Handler for the reset password endpoint =====================================
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { resetToken, password, confirmPassword } = req.body;

  // Validate the reset token and password
  if (!resetToken || !password || password.length < 8) {
    let errors = {} as any;
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

    throw new ValidationError("Validation error", errors);
  }

  const hashedToken = validateResetToken(resetToken);
  if (!hashedToken) {
    return next(createError(401, "Invalid or expired token."));
  }

  const user = await User.findById(hashedToken.userId);
  if (!user) {
    return next(createError(404, "User not found"));
  }

  // Check if the password token has expired
  if (
    user.passwordToken !== hashedToken.passwordToken ||
    !user.passwordTokenExpirationDate ||
    user.passwordTokenExpirationDate <= new Date()
  ) {
    return next(createError(401, "Invalid or expired token."));
  }

  // Update the user's password and clear the password token and expiration date
  user.password = password;
  user.passwordToken = undefined;
  user.passwordTokenExpirationDate = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

// Initiate Google Authentication
const initiateGoogleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const redirectUrl = req.query.callbackUrl as string | undefined;
  const platform = req.platform;

  passport.authenticate(`google-${platform}`, {
    scope: ["profile", "email"],
    state: encodeURIComponent(redirectUrl || "/"),
  })(req, res, next);
};

// Google Authentication Callback
const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const callbackUrl = req.query.state as string;
  const redirectUrl = decodeURIComponent(callbackUrl);
  const platform = req.params.platform;
  const origin = platformMap[platform];

  passport.authenticate(
    `google-${platform}`,
    (err: Error | null, user: Express.User | false, info: any) => {
      if (!user || err) {
        return res.redirect(
          `${origin}/login?error=Failed to sign in with Google`
        );
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(
            `${origin}/login?error=Failed to sign in with Google`
          );
        }

        // Redirect the user to the intended destination after successful login
        res.redirect(`${origin}/${redirectUrl}`);
      });
    }
  )(req, res, next);
};

export {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  initiateGoogleAuth,
  googleAuthCallback,
};
