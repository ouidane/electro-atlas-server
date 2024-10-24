import { User } from "../models";
import createError from "http-errors";
import crypto from "crypto";
import { emailService } from "./emailService";
import { cartService } from "./cartService";
import { verifyToken, generateToken } from "../lib/jwt";
import { ORIGINS, PLATFORMS, type PlatformValue } from "../utils/constants";
import { wishlistService } from "./wishlistService";

class AuthService {
  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async registerUser(userData: any, platform: PlatformValue): Promise<void> {
    const { email, password, confirmPassword, cartItems, wishlist } = userData;

    const existingUser = await User.findOne({ email, platform });
    if (existingUser) {
      throw createError(409, "Email already exists");
    }

    const verificationCode = this.generateVerificationCode();
    const verificationToken = generateToken({
      verificationCode,
      email,
      createdAt: Date.now(),
    });

    const tenMinutes = 1000 * 60 * 10;
    const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);

    const user = await User.create({
      platform,
      email,
      password,
      confirmPassword,
      verificationToken,
      verificationTokenExpirationDate,
    });

    const origin = ORIGINS[platform];
    await emailService.sendVerificationEmail({
      email,
      verificationCode,
      origin,
    });

    if (platform === PLATFORMS.MARKETPLACE) {
      await Promise.all([
        cartService.addCartToDatabase(cartItems, user._id),
        wishlistService.addWishlistToDatabase(wishlist, user._id),
      ]);
    }
  }

  async loginUser(email: string, platform: PlatformValue): Promise<void> {
    const user = await User.findOne({ email, platform });
    if (!user) {
      throw createError(401, "Invalid email or password");
    }

    if (!user.isVerified) {
      await this.resendVerificationEmail(user, platform);
    }
  }

  private async resendVerificationEmail(
    user: any,
    platform: PlatformValue
  ): Promise<void> {
    const codeExpirationTime = 60 * 1000; // 1 minute
    const maxRequestsPerHour = 3;
    const oneHour = 60 * 60 * 1000;
    const currentTime = Date.now();

    // Filter out old requests
    const requestHistory = user.verificationTokenRequestHistory.filter(
      (timestamp: number) => currentTime - timestamp < oneHour
    );
    user.verificationTokenRequestHistory = requestHistory;

    // Limit the number of requests
    if (user.verificationTokenRequestHistory.length >= maxRequestsPerHour) {
      throw createError(
        400,
        "You've requested too many verification codes. Please try again later."
      );
    }

    if (
      user.verificationTokenExpirationDate >
      new Date(Date.now() - codeExpirationTime)
    ) {
      throw createError(400, "Please wait before requesting another code");
    }

    // Add the current timestamp to the request history
    user.verificationTokenRequestHistory.push(currentTime);

    const verificationCode = this.generateVerificationCode();
    const verificationToken = generateToken({
      verificationCode,
      email: user.email,
      createdAt: Date.now(),
    });

    const tenMinutes = 1000 * 60 * 10;
    const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.verificationToken = verificationToken;
    user.verificationTokenExpirationDate = verificationTokenExpirationDate;
    await user.save();

    const origin = ORIGINS[platform];
    await emailService.sendVerificationEmail({
      email: user.email,
      verificationCode,
      origin,
    });

    throw createError(403, "Email not verified");
  }

  async verifyUserEmail(
    verificationCode: string,
    email: string,
    platform: PlatformValue
  ) {
    const user = await User.findOne({ email, platform });
    if (!user) {
      throw createError(404, "User not found");
    }

    const hashedToken = verifyToken(user.verificationToken!);
    if (
      !hashedToken ||
      verificationCode !== hashedToken.verificationCode ||
      user.verificationTokenExpirationDate! < new Date()
    ) {
      throw createError(401, "Invalid or expired token.");
    }

    user.isVerified = true;
    const verifiedDate = new Date();
    user.verified = verifiedDate;
    user.verificationToken = undefined;
    user.verificationTokenExpirationDate = undefined;
    await user.save();
  }

  async forgotUserPassword(email: string, platform: PlatformValue) {
    const user = await User.findOne({ email, platform });
    if (!user) {
      throw createError(404, "User not found");
    }

    const passwordToken = crypto.randomBytes(70).toString("hex");
    const resetToken = generateToken({ userId: user.id, passwordToken });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();

    await emailService.sendResetPasswordEmail({
      email: user.email,
      token: resetToken,
      origin: origin,
    });
  }

  async resetUserPassword(resetToken: string, password: string): Promise<void> {
    const hashedToken = verifyToken(resetToken);
    if (!hashedToken) {
      throw createError(401, "Invalid or expired token");
    }

    const user = await User.findById(hashedToken.userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (
      user.passwordToken !== hashedToken.passwordToken ||
      !user.passwordTokenExpirationDate ||
      user.passwordTokenExpirationDate <= new Date()
    ) {
      throw createError(401, "Invalid or expired token");
    }

    user.password = password;
    user.passwordToken = undefined;
    user.passwordTokenExpirationDate = undefined;
    await user.save();
  }
}

export const authService = new AuthService();
