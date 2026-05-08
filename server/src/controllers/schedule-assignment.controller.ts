import { Request, Response } from "express";
import { scheduleAssignmentService } from "../services/schedule-assignment.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";

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
    const monthParam = req.query.month;
    const month = Array.isArray(monthParam) ? monthParam[0] : monthParam;
    if (!month || typeof month !== "string")
      return sendResponse(res, 400, "month query parameter required (YYYY-MM)");
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const items = await scheduleAssignmentService.getEmployeeScheduleByMonth(
      id,
      year,
      m,
    );
    return sendResponse(res, 200, "OK", items);
  },
};
