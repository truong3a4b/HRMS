import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ApprovalMode } from "../../generated/prisma/client";
import { attendanceService } from "../services/attendance.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";

const historyQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be in YYYY-MM format"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be in YYYY-MM format"),
});

const createCompensationSchema = z.object({
  employeeId: z.string().min(1).optional(),
  attendanceDate: z.string().min(1, "attendanceDate is required"),
  workShiftId: z.string().min(1, "workShiftId is required"),
  reason: z.string().min(2, "reason is required"),
  addedWorkUnits: z.number().positive().optional(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  approvalMode: z.nativeEnum(ApprovalMode).optional(),
  approverIds: z.array(z.string().min(1)).min(1),
  watcherIds: z.array(z.string().min(1)).optional().default([]),
});

const requireUser = (req: Request) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return user;
};

const parseHistoryQuery = (req: Request) => historyQuerySchema.parse(req.query);
const parseMonthQuery = (req: Request) => monthQuerySchema.parse(req.query);
const parseEmployeeParams = (req: Request) =>
  z.object({ employeeId: z.string().min(1) }).parse(req.params);

export const attendanceController = {
  async getMyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const query = parseHistoryQuery(req);
      const result = await attendanceService.getMyAttendanceHistory(user, query);

      return sendResponse(res, 200, "Attendance history fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const query = parseHistoryQuery(req);
      const params = parseEmployeeParams(req);
      const result = await attendanceService.getEmployeeAttendanceHistory(user, {
        ...query,
        employeeId: params.employeeId,
      });

      return sendResponse(res, 200, "Attendance history fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getMyTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const query = parseMonthQuery(req);
      const result = await attendanceService.getMyTimesheet(user, query);

      return sendResponse(res, 200, "Attendance timesheet fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const query = parseMonthQuery(req);
      const params = parseEmployeeParams(req);
      const result = await attendanceService.getEmployeeTimesheet(user, {
        ...query,
        employeeId: params.employeeId,
      });

      return sendResponse(res, 200, "Attendance timesheet fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async createCompensationRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const body = createCompensationSchema.parse(req.body);
      const result = await attendanceService.createCompensationRequest(user, body);

      return sendResponse(res, 201, "Attendance compensation request created successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
