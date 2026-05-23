import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/client";
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

const getRefreshTokenFromRequest = (req: Request) => {
  const bodyToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";

  if (bodyToken) {
    return bodyToken;
  }

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return "";
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const index = cookie.indexOf("=");

      if (index === -1) {
        return [cookie.trim(), ""];
      }

      const key = cookie.slice(0, index).trim();
      const value = cookie.slice(index + 1).trim();

      return [key, decodeURIComponent(value)];
    }),
  );

  return typeof cookies.refreshToken === "string" ? cookies.refreshToken : "";
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: parseExpiresToMs(env.REFRESH_TOKEN_EXPIRES_IN),
});

const getTokenMeta = (req: Request) => ({
  userAgent:
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : undefined,
  ipAddress: req.ip || req.socket.remoteAddress || undefined,
});

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

      const result = await authService.verifyOtp(email, otp, getTokenMeta(req));

      res.cookie(
        "refreshToken",
        result.refreshToken,
        getRefreshCookieOptions(),
      );

      const { refreshToken, ...responseData } = result;

      return sendResponse(res, 200, "OTP verified successfully", responseData);
    } catch (error) {
      return next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(
        email,
        password,
        getTokenMeta(req),
      );

      res.cookie(
        "refreshToken",
        result.refreshToken,
        getRefreshCookieOptions(),
      );

      const { refreshToken, ...responseData } = result;

      return sendResponse(res, 200, "Login successful", responseData);
    } catch (error) {
      return next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      return sendResponse(res, 200, "Password reset OTP has been sent", result);
    } catch (error) {
      return next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, newPassword } = req.body;

      await authService.resetPassword(resetToken, newPassword);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return sendResponse(res, 200, "Password reset successfully");
    } catch (error) {
      return next(error);
    }
  },

  async verifyPasswordResetOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, otp } = req.body;

      const result = await authService.verifyPasswordResetOtp(email, otp);

      return sendResponse(res, 200, "OTP verified successfully", result);
    } catch (error) {
      return next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
      return next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);

      const result = await authService.refreshToken(refreshToken);

      res.cookie(
        "refreshToken",
        result.refreshToken,
        getRefreshCookieOptions(),
      );

      const { refreshToken: _refreshToken, ...responseData } = result;

      return sendResponse(
        res,
        200,
        "Token refreshed successfully",
        responseData,
      );
    } catch (error) {
      return next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);

      await authService.logout(refreshToken);

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

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await authService.getMe(userId);
      return sendResponse(res, 200, "User retrieved successfully", result);
    } catch (error) {
      return next(error);
    }
  },

  async getMyPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return sendResponse(res, 401, "Unauthorized");
      }

      return sendResponse(res, 200, "Permissions retrieved successfully", {
        userId: user.id,
        role: user.role,
        isAdmin: user.role === UserRole.ADMIN,
        permissions: user.permissions,
      });
    } catch (error) {
      return next(error);
    }
  },
};
