import { Request, Response, NextFunction } from "express";
import passport from "passport";
import createError from "http-errors";
import { authService } from "../services/authService";
import { ORIGINS, type PlatformValue } from "../utils/constants";

class AuthController {
  // Handler for the register endpoint
  async register(req: Request, res: Response) {
    const platform = req.platform;

    await authService.registerUser(req.body, platform);
    res.status(200).json({ message: "User registered successfully" });
  }

  // Handler for the login endpoint
  async login(req: Request, res: Response, next: NextFunction) {
    const platform = req.platform;

    await authService.loginUser(req.body.email, platform);

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
  }

  // Handler for the logout endpoint
  async logout(req: Request, res: Response, next: NextFunction) {
    req.logout(function (err) {
      if (err) return next(err);
      res.status(200).json({ message: "Logout completed successfully" });
    });
  }

  // Handler for the verify Email endpoint
  async verifyEmail(req: Request, res: Response) {
    const { verificationCode, email } = req.body;
    const platform = req.platform;

    await authService.verifyUserEmail(verificationCode, email, platform);
    res.status(200).json({ message: "Email Verified" });
  }

  // Resend verification code endpoint
  async resendVerificationCode(req: Request, res: Response) {
    const { email } = req.body;
    const platform = req.platform;

    await authService.resendVerificationCode(email, platform);
    res.status(200).json({ message: "Verification code resent successfully" });
  }

  // Handler for the forgot password endpoint
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const platform = req.platform;

    await authService.forgotUserPassword(email, platform);
    res.status(200).json({ message: "Check your email for the reset link" });
  }

  // Handler for the reset password endpoint
  async resetPassword(req: Request, res: Response) {
    const { resetToken, password } = req.body;

    await authService.resetUserPassword(resetToken, password);
    res.status(200).json({ message: "Password reset successful" });
  }

  // Initiate Google Authentication
  async initiateGoogleAuth(req: Request, res: Response, next: NextFunction) {
    const platform = req.platform;
    const callbackUrl = (req.query.callbackUrl as string) || "/";

    passport.authenticate(`google-${platform}`, {
      scope: ["profile", "email"],
      state: encodeURIComponent(callbackUrl),
    })(req, res, next);
  }

  // Google Authentication Callback
  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    const state = req.query.state as string;
    const platform = req.params.platform as PlatformValue;

    const redirectUrl = decodeURIComponent(state);
    const origin = ORIGINS[platform];

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
          res.redirect(`${origin}/${redirectUrl}`);
        });
      }
    )(req, res, next);
  }
}

export const authController = new AuthController();
