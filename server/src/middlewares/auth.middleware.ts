import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { PermissionKey } from "../constants/permissions";

type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

const hasAnyPermission = (
  userPermissions: PermissionKey[] | undefined,
  permissions: PermissionKey[],
) => permissions.some((permission) => userPermissions?.includes(permission));

export const authMiddleware =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

      let permissions: PermissionKey[] = [];
      let employeeId: string | undefined;

      if (decoded.role === UserRole.EMPLOYEE) {
        const employee = await prisma.employee.findUnique({
          where: { userId: decoded.userId },
          select: {
            id: true,
            position: {
              select: {
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
        });

        employeeId = employee?.id;
        permissions =
          employee?.position?.permissions.map(
            (item) => item.permission.key as PermissionKey,
          ) ?? [];
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        employeeId,
        permissions,
      };

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };

export const checkAccessToken = authMiddleware();

export const permissionMiddleware =
  (...permissions: PermissionKey[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === UserRole.ADMIN) {
      return next();
    }

    if (permissions.length === 0) {
      return next();
    }

    const hasPermission = hasAnyPermission(user.permissions, permissions);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };

export const selfOrPermissionMiddleware =
  (fullPermission: PermissionKey, selfPermission: PermissionKey) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === UserRole.ADMIN) {
      return next();
    }

    if (hasAnyPermission(user.permissions, [fullPermission])) {
      return next();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const canSelfEdit =
      !!id &&
      !!user.employeeId &&
      id === user.employeeId &&
      hasAnyPermission(user.permissions, [selfPermission]);

    if (!canSelfEdit) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
