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
      throw new ApiError(400, "Invalid permission keys provided");
    }

    return prisma.position.create({
      data: {
        name: data.name,
        code: data.code,
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
};
