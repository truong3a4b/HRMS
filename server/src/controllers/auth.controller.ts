import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import { sendResponse } from "../utils/response";

const parseExpiresToMs = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+)([smhd])?$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit];
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.register(email, password);

      return sendResponse(res, 201, "OTP has been sent to your email", result);
    } catch (error) {
      return next(error);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;

      const result = await authService.verifyOtp(email, otp);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: parseExpiresToMs(env.REFRESH_TOKEN_EXPIRES_IN),
      });

      const { refreshToken, ...responseData } = result;

      return sendResponse(res, 200, "OTP verified successfully", responseData);
    } catch (error) {
      return next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: parseExpiresToMs(env.REFRESH_TOKEN_EXPIRES_IN),
      });

      const { refreshToken, ...responseData } = result;

      return sendResponse(res, 200, "Login successful", responseData);
    } catch (error) {
      return next(error);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return sendResponse(res, 200, "Logout successful");
    } catch (error) {
      return next(error);
    }
  },
};
