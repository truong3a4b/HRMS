import { prisma } from "../config/prisma";
import {
  PERMISSION_DEFINITIONS,
  PermissionKey,
} from "../constants/permissions";
import { ApiError } from "../utils/apiError";

type CreatePositionInput = {
  name: string;
  code?: string;
  description?: string;
  permissionKeys: PermissionKey[];
};

type UpdatePositionInput = {
  name?: string;
  code?: string;
  description?: string;
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

    // Auto-generate code if not provided
    let code = data.code;
    if (!code) {
      // Generate code from name: convert to uppercase, replace spaces with underscore
      const baseCode = data.name
        .toUpperCase()
        .replace(/\s+/g, "_")
        .replace(/[^A-Z0-9_]/g, "");

      // Check if code already exists
      let finalCode = baseCode;
      let counter = 1;
      while (await prisma.position.findUnique({ where: { code: finalCode } })) {
        finalCode = `${baseCode}_${counter}`;
        counter++;
      }
      code = finalCode;
    }

    return prisma.position.create({
      data: {
        name: data.name,
        code: code,
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
    if (data.code && data.code !== existingPosition.code) {
      const codeExists = await prisma.position.findUnique({
        where: { code: data.code },
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
        name: data.name,
        code: data.code,
        description: data.description,
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
