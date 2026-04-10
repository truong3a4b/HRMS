import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { UserRole } from "../../generated/prisma/client";
import { sendOtpEmail } from "../config/brevo";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export const authService = {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pendingUser = await prisma.pendingUser.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otp,
        expiresAt,
      },
      create: {
        email,
        password: hashedPassword,
        otp,
        expiresAt,
      },
    });

    try {
      await sendOtpEmail(pendingUser.email, otp);
    } catch (error) {
      console.error("Failed to send OTP email", error);
      const message =
        error instanceof Error ? error.message : "Failed to send OTP email";
      throw new ApiError(500, message);
    }

    return {
      email: pendingUser.email,
      expiresAt: pendingUser.expiresAt,
    };
  },

  async verifyOtp(email: string, otp: string) {
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email },
    });

    if (!pendingUser) {
      throw new ApiError(404, "Pending user not found");
    }

    if (pendingUser.otp !== otp) {
      throw new ApiError(400, "Invalid OTP");
    }

    if (pendingUser.expiresAt < new Date()) {
      throw new ApiError(400, "OTP has expired");
    }

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        await tx.pendingUser.delete({ where: { email } });
        return existingUser;
      }

      const createdUser = await tx.user.create({
        data: {
          email: pendingUser.email,
          password: pendingUser.password,
          role: UserRole.CANDIDATE,
        },
      });

      await tx.pendingUser.delete({ where: { email } });
      return createdUser;
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },
};
