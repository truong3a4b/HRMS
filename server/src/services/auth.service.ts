import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID, randomInt } from "crypto";
import { UserRole } from "../../generated/prisma/client";
import { PermissionKey } from "../constants/permissions";
import { sendOtpEmail } from "../config/brevo";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const refreshTokenSaltRounds = 10;

type TokenPayload = {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
};

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

type TokenMeta = {
  userAgent?: string;
  ipAddress?: string;
};

// Hàm chuyển đổi chuỗi expiresIn thành milliseconds
const getRefreshTokenExpiresInMs = () => {
  const value = env.REFRESH_TOKEN_EXPIRES_IN.trim();
  const match = value.match(/^(\d+)([smhd])?$/i);

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

const buildUser = (user: { id: string; email: string; role: UserRole }) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

//Hàm xác thực và giải mã payload từ refresh token
const verifyRefreshTokenPayload = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

//Hàm tạo token pair (access token và refresh token) và lưu thông tin phiên vào database
const createTokenPair = async (
  user: AuthUser,
  sessionId: string = randomUUID(),
  meta: TokenMeta = {},
) => {
  const payload: TokenPayload = {
    userId: user.id,
    sessionId,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const tokenHash = await bcrypt.hash(refreshToken, refreshTokenSaltRounds);
  const expiresAt = new Date(Date.now() + getRefreshTokenExpiresInMs());

  await prisma.refreshToken.upsert({
    where: { id: sessionId },
    update: {
      tokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      revokedAt: null,
      expiresAt,
    },
    create: {
      id: sessionId,
      userId: user.id,
      tokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    sessionId,
  };
};

// Hàm lấy và xác thực refresh token từ request, sau đó trả về thông tin phiên nếu hợp lệ
const getValidatedSession = async (token: string) => {
  let payload: TokenPayload;

  try {
    payload = verifyRefreshTokenPayload(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const session = await prisma.refreshToken.findFirst({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      tokenHash: true,
      userAgent: true,
      ipAddress: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const isTokenValid = await bcrypt.compare(token, session.tokenHash);

  if (!isTokenValid) {
    throw new ApiError(401, "Invalid refresh token");
  }

  return session;
};

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

  async verifyOtp(email: string, otp: string, meta?: TokenMeta) {
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
        await tx.candidate.upsert({
          where: { userId: existingUser.id },
          update: {
            email: existingUser.email,
          },
          create: {
            userId: existingUser.id,
            email: existingUser.email,
          },
        });
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

      await tx.candidate.create({
        data: {
          userId: createdUser.id,
          email: createdUser.email,
        },
      });

      await tx.pendingUser.delete({ where: { email } });
      return createdUser;
    });

    const { accessToken, refreshToken } = await createTokenPair(
      buildUser(user),
      undefined,
      meta,
    );

    return {
      user: buildUser(user),
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string, meta?: TokenMeta) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await createTokenPair(
      buildUser(user),
      undefined,
      meta,
    );

    return {
      user: buildUser(user),
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    if (!token) {
      throw new ApiError(401, "Refresh token is required");
    }

    const session = await getValidatedSession(token);

    const { accessToken, refreshToken } = await createTokenPair(
      session.user,
      session.id,
      {
        userAgent: session.userAgent ?? undefined,
        ipAddress: session.ipAddress ?? undefined,
      },
    );

    return {
      user: session.user,
      accessToken,
      refreshToken,
    };
  },

  async logout(token?: string) {
    if (!token) {
      return;
    }

    try {
      const payload = verifyRefreshTokenPayload(token);

      await prisma.refreshToken.updateMany({
        where: {
          id: payload.sessionId,
          userId: payload.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      return;
    }
  },

  async getMe(userId: string) {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        employee: {
          select: {
            id: true,
            position: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        key: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const permissions: PermissionKey[] =
      user.employee?.position?.permissions.map(
        (item) => item.permission.key as PermissionKey,
      ) ?? [];

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id,
        position: user.employee?.position
          ? {
              id: user.employee.position.id,
              name: user.employee.position.name,
            }
          : null,
        permissions,
      },
    };
  },
};
