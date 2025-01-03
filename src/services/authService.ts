import { User } from "../models";
import createError from "http-errors";
import crypto from "crypto";
import { emailService } from "./emailService";
import { cartService } from "./cartService";
import { verifyToken, generateToken } from "../lib/jwt";
import {
  ORIGINS,
  PLATFORMS,
  ROLE,
  type PlatformValue,
} from "../utils/constants";
import { wishlistService } from "./wishlistService";
import { log } from "console";

class AuthService {
  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async registerUser(userData: any, platform: PlatformValue): Promise<void> {
    const { email, password, confirmPassword, cartItems, wishlist } = userData;
    await User.findOneAndDelete({ email, platform });

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
      role: platform === PLATFORMS.MARKETPLACE ? ROLE.BUYER : ROLE.SELLER,
      email,
      password,
      confirmPassword,
      verificationToken,
      verificationTokenExpirationDate,
      verificationTokenRequestHistory: [new Date(Date.now())],
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
      throw createError(403, "Email not verified");
    }
  }

  async resendVerificationCode(email: string, platform: PlatformValue) {
    const user = await User.findOne({ email, platform });
    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.isVerified) {
      throw createError(400, "User is already verified");
    }

    await this.resendVerificationEmail(user, platform);
  }

  private async resendVerificationEmail(user: any, platform: PlatformValue) {
    const timeToRequestNewCode = 30 * 1000; // 30 seconds
    const maxRequestsPerHour = 5;
    const oneHour = 60 * 60 * 1000;
    const currentTime = Date.now();

    // Filter out old requests
    const requestHistory = user.verificationTokenRequestHistory?.filter(
      (timestamp: Date) => currentTime - timestamp.getTime() < oneHour
    );

    // Limit the number of requests
    if (requestHistory.length >= maxRequestsPerHour) {
      throw createError(400, "Please try again later.");
    }

    const lastRequestTime = user.verificationTokenRequestHistory.at(-1);
    if (lastRequestTime > new Date(Date.now() - timeToRequestNewCode)) {
      throw createError(400, "Please wait before requesting another code");
    }

    const tenMinutes = 1000 * 60 * 10;
    const verificationTokenExpirationDate = new Date(Date.now() + tenMinutes);
    const verificationCode = this.generateVerificationCode();
    const verificationToken = generateToken({
      verificationCode,
      email: user.email,
    });

    user.verificationToken = verificationToken;
    user.verificationTokenExpirationDate = verificationTokenExpirationDate;
    user.verificationTokenRequestHistory?.push(new Date(currentTime));
    await user.save();

    const origin = ORIGINS[platform];
    await emailService.sendVerificationEmail({
      email: user.email,
      verificationCode,
      origin,
    });
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

    const timeToRequestNewCode = 60 * 1000;
    const maxRequestsPerMonth = 5;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();

    // Filter out old requests
    const requestHistory = user.passwordTokenRequestHistory?.filter(
      (timestamp: Date) => currentTime - timestamp.getTime() < oneMonth
    );

    // Limit the number of requests
    if (requestHistory.length >= maxRequestsPerMonth) {
      throw createError(
        400,
        "You've requested too many reset password codes. Please try again later."
      );
    }

    const lastRequestTime = user.passwordTokenRequestHistory.at(-1) || new Date();
    if (lastRequestTime > new Date(Date.now() - timeToRequestNewCode)){
      throw createError(400, "Please wait before requesting another code");
    }

    
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    const passwordToken = crypto.randomBytes(70).toString("hex");
    const resetToken = generateToken({ userId: user.id, passwordToken });

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    user.passwordTokenRequestHistory?.push(new Date(currentTime));
    await user.save();

    const origin = ORIGINS[platform];
    await emailService.sendResetPasswordEmail({
      email: user.email,
      token: resetToken,
      origin,
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
