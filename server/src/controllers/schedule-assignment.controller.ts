import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { scheduleAssignmentService } from "../services/schedule-assignment.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";

const getCurrentUser = (req: Request) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  return req.user;
};

const getMonthFromQuery = (req: Request) => {
  const monthParam = req.query.month;
  const month = Array.isArray(monthParam) ? monthParam[0] : monthParam;

  if (!month || typeof month !== "string") {
    return null;
  }

  const [yearStr, monthStr] = month.split("-");
  const year = Number.parseInt(yearStr, 10);
  const m = Number.parseInt(monthStr, 10);

  if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) {
    return null;
  }

  return { year, month: m };
};

const resolveEmployeeId = async (user: NonNullable<Request["user"]>) => {
  if (user.employeeId) {
    return user.employeeId;
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  return employee.id;
};

export const scheduleAssignmentController = {
  async create(req: Request, res: Response) {
    const payload = req.body;
    const setup = await scheduleAssignmentService.createSetupAndApply(payload);
    return sendResponse(res, 201, "Created", setup);
  },

  async register(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = req.body;
    const request = await scheduleAssignmentService.createRegistrationRequest(
      user.id,
      payload,
    );

    return sendResponse(res, 201, "Created", request);
  },

  async getEmployeeByMonth(req: Request, res: Response) {
    const id = String(req.params.id);
    const monthInfo = getMonthFromQuery(req);

    if (!monthInfo) {
      return sendResponse(res, 400, "month query parameter required (YYYY-MM)");
    }

    const items = await scheduleAssignmentService.getEmployeeScheduleByMonth(
      id,
      monthInfo.year,
      monthInfo.month,
    );
    return sendResponse(res, 200, "OK", items);
  },

  async getEmployeeByDate(req: Request, res: Response) {
    const id = String(req.params.id);
    const dateParam = req.query.date;
    const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

    if (!date || typeof date !== "string") {
      return sendResponse(
        res,
        400,
        "date query parameter required (YYYY-MM-DD)",
      );
    }

    const item = await scheduleAssignmentService.getEmployeeScheduleByDate(
      id,
      date,
    );

    return sendResponse(res, 200, "OK", item);
  },

  async applyForEmployee(req: Request, res: Response) {
    const id = String(req.params.id);
    const payload = req.body;
    const result = await scheduleAssignmentService.applyForEmployee(
      id,
      payload.scheduleDetails,
    );
    return sendResponse(res, 200, "Applied", result);
  },

  async getMineByMonth(req: Request, res: Response) {
    const user = getCurrentUser(req);
    const employeeId = await resolveEmployeeId(user);

    const monthInfo = getMonthFromQuery(req);

    if (!monthInfo) {
      return sendResponse(res, 400, "month query parameter required (YYYY-MM)");
    }

    const items = await scheduleAssignmentService.getEmployeeScheduleByMonth(
      employeeId,
      monthInfo.year,
      monthInfo.month,
    );

    return sendResponse(res, 200, "OK", items);
  },
};
