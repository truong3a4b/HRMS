import { UserRole } from "../../generated/prisma/client";
import { PermissionKey } from "../constants/permissions";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        employeeId?: string;
        permissions: PermissionKey[];
      };
    }
  }
}

export {};
