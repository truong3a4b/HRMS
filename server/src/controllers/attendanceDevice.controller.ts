import { NextFunction, Request, Response } from "express";
import { attendanceDeviceService } from "../services/attendanceDevice.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";
import {
  createAttendanceDeviceSchema,
  updateAttendanceDeviceSchema,
  registerFingerprintCommandSchema,
  deviceListQuerySchema,
} from "../types/attendance-device.types";

export const attendanceDeviceController = {
  async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const query = deviceListQuerySchema.parse(req.query);

      const result = await attendanceDeviceService.getAllDevices(query);
      return sendResponse(
        res,
        200,
        "Attendance devices fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await attendanceDeviceService.getDeviceById(id);

      if (!result) {
        throw new ApiError(
          404,
          "Attendance device not found",
          "ATTENDANCE_DEVICE_NOT_FOUND",
        );
      }

      return sendResponse(
        res,
        200,
        "Attendance device fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = createAttendanceDeviceSchema.parse(req.body);
      const result = await attendanceDeviceService.createDevice(validatedBody);
      return sendResponse(
        res,
        201,
        "Attendance device created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const validatedBody = updateAttendanceDeviceSchema.parse(req.body);
      const result = await attendanceDeviceService.updateDevice(
        id,
        validatedBody,
      );
      return sendResponse(
        res,
        200,
        "Attendance device updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await attendanceDeviceService.deleteDevice(id);
      return sendResponse(
        res,
        200,
        "Attendance device deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getDeviceFingerprints(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await attendanceDeviceService.getDeviceFingerprints(id);
      return sendResponse(
        res,
        200,
        "Device fingerprints fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async addFingerprint(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const { employeeId, fingerName } = registerFingerprintCommandSchema.parse(
        req.body,
      );

      const result = await attendanceDeviceService.addFingerprint(
        deviceId,
        employeeId,
        fingerName,
      );

      return sendResponse(
        res,
        201,
        "Fingerprint registration command created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteFingerprint(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const fingerprintId = Array.isArray(req.params.fingerprintId)
        ? req.params.fingerprintId[0]
        : req.params.fingerprintId;

      const result = await attendanceDeviceService.removeFingerprint(
        deviceId,
        fingerprintId,
      );

      return sendResponse(
        res,
        202,
        "Fingerprint deletion command sent successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
