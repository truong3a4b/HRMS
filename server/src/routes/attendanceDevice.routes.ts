import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { attendanceDeviceController } from "../controllers/attendanceDevice.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createAttendanceDeviceSchema,
  updateAttendanceDeviceSchema,
  registerFingerprintCommandSchema,
  deviceListQuerySchema,
} from "../types/attendance-device.types";

const router = Router();

router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_VIEW),
  attendanceDeviceController.getAllDevices,
);

router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_VIEW),
  attendanceDeviceController.getDeviceById,
);

router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_SETUP),
  validate(createAttendanceDeviceSchema),
  attendanceDeviceController.createDevice,
);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_SETUP),
  validate(updateAttendanceDeviceSchema),
  attendanceDeviceController.updateDevice,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_SETUP),
  attendanceDeviceController.deleteDevice,
);

router.post(
  "/:id/fingerprints",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_SETUP),
  validate(registerFingerprintCommandSchema),
  attendanceDeviceController.addFingerprint,
);

router.get(
  "/:id/fingerprints",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_VIEW),
  attendanceDeviceController.getDeviceFingerprints,
);

router.delete(
  "/:id/fingerprints/:fingerprintId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_DEVICE_SETUP),
  attendanceDeviceController.deleteFingerprint,
);

export default router;
