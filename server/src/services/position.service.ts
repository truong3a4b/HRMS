import { prisma } from "../config/prisma";
import {
  PERMISSION_DEFINITIONS,
  PermissionKey,
} from "../constants/permissions";
import { ApiError } from "../utils/apiError";
import { Prisma } from "../../generated/prisma/client";

type CreatePositionInput = {
  name: string;
  code?: string | null;
  description?: string | null;
  permissionKeys: PermissionKey[];
};

type UpdatePositionInput = {
  name?: string;
  code?: string | null;
  description?: string | null;
  permissionKeys?: PermissionKey[];
};

// Đảm bảo rằng tất cả permissions trong PERMISSION_DEFINITIONS đều tồn tại trong database
const ensurePermissionCatalog = async () => {
  await Promise.all(
    PERMISSION_DEFINITIONS.map((item) =>
      prisma.permission.upsert({
        where: { key: item.key },
        update: {
          name: item.name,
          description: item.description,
        },
        create: {
          key: item.key,
          name: item.name,
          description: item.description,
        },
      }),
    ),
  );
};

const normalizePositionCode = (code?: string | null) => {
  const normalized = code?.trim().toUpperCase();
  return normalized || null;
};

const buildRandomPositionCode = () => {
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  return `POS-${randomSuffix}`;
};

const buildPositionCodeFromName = (name: string) => {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || buildRandomPositionCode();
};

const generateUniquePositionCode = async (name: string) => {
  const baseCode = buildPositionCodeFromName(name);
  let finalCode = baseCode;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const existing = await prisma.position.findUnique({
      where: { code: finalCode },
      select: { id: true },
    });

    if (!existing) return finalCode;

    finalCode = baseCode.startsWith("POS-")
      ? buildRandomPositionCode()
      : `${baseCode}_${attempt + 1}`;
  }

  throw new ApiError(
    500,
    "Unable to generate a unique position code",
    "POSITION_CODE_GENERATION_FAILED",
  );
};

const isPositionCodeConflictError = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const targets = Array.isArray(error.meta?.target)
    ? error.meta.target.map((target) => String(target))
    : [];

  return targets.includes("code");
};

export const positionService = {
  async getAll() {
    await ensurePermissionCatalog();

    return prisma.position.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getPermissionCatalog() {
    await ensurePermissionCatalog();
    return prisma.permission.findMany({
      orderBy: { key: "asc" },
    });
  },

  async create(data: CreatePositionInput) {
    await ensurePermissionCatalog();

    const uniquePermissionKeys = [...new Set(data.permissionKeys)];

    const permissions = await prisma.permission.findMany({
      where: {
        key: {
          in: uniquePermissionKeys,
        },
      },
      select: {
        id: true,
        key: true,
      },
    });

    if (permissions.length !== uniquePermissionKeys.length) {
      throw new ApiError(
        400,
        "Invalid permission keys provided",
        "INVALID_PERMISSION_KEYS",
      );
    }

    const requestedCode = normalizePositionCode(data.code);
    const code = requestedCode ?? (await generateUniquePositionCode(data.name));

    if (requestedCode) {
      const codeExists = await prisma.position.findUnique({
        where: { code: requestedCode },
        select: { id: true },
      });

      if (codeExists) {
        throw new ApiError(
          400,
          "Position code already exists",
          "POSITION_CODE_EXISTS",
        );
      }
    }

    try {
      return await prisma.position.create({
        data: {
          name: data.name,
          code,
          description: data.description,
          permissions: {
            create: permissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    } catch (error) {
      if (isPositionCodeConflictError(error)) {
        throw new ApiError(
          409,
          "Position code already exists. Please try again.",
          "POSITION_CODE_EXISTS",
        );
      }

      throw error;
    }
  },

  async getById(id: string) {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
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
    });

    if (!position) {
      throw new ApiError(404, "Position not found", "POSITION_NOT_FOUND");
    }

    return {
      ...position,
      permissions: position.permissions.map((item) => item.permission.key),
    };
  },

  async update(id: string, data: UpdatePositionInput) {
    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      throw new ApiError(404, "Position not found", "POSITION_NOT_FOUND");
    }

    await ensurePermissionCatalog();

    // Validate new code doesn't conflict (if code is being updated)
    const nextCode =
      data.code !== undefined ? normalizePositionCode(data.code) : undefined;

    if (nextCode && nextCode !== existingPosition.code) {
      const codeExists = await prisma.position.findUnique({
        where: { code: nextCode },
      });

      if (codeExists) {
        throw new ApiError(
          400,
          "Position code already exists",
          "POSITION_CODE_EXISTS",
        );
      }
    }

    // Handle permission updates
    let permissionUpdates = undefined;
    if (data.permissionKeys && data.permissionKeys.length > 0) {
      const uniquePermissionKeys = [...new Set(data.permissionKeys)];

      const permissions = await prisma.permission.findMany({
        where: {
          key: {
            in: uniquePermissionKeys,
          },
        },
        select: {
          id: true,
          key: true,
        },
      });

      if (permissions.length !== uniquePermissionKeys.length) {
        throw new ApiError(400, "Invalid permission keys provided");
      }

      // Delete old permissions and create new ones
      permissionUpdates = {
        deleteMany: {},
        create: permissions.map((permission) => ({
          permissionId: permission.id,
        })),
      };
    }

    return prisma.position.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(nextCode !== undefined ? { code: nextCode } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(permissionUpdates && { permissions: permissionUpdates }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      throw new ApiError(404, "Position not found", "POSITION_NOT_FOUND");
    }

    // Prevent deletion if there are employees assigned to this position
    const assignedEmployees = await prisma.employee.count({
      where: { positionId: id },
    });

    if (assignedEmployees > 0) {
      throw new ApiError(
        400,
        "Cannot delete position with assigned employees",
        "POSITION_HAS_ASSIGNED_EMPLOYEES",
      );
    }

    // Deleting position will cascade position_permissions per schema
    return prisma.position.delete({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },
};
