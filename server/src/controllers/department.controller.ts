import { NextFunction, Request, Response } from "express";
import { departmentService } from "../services/department.service";
import { sendResponse } from "../utils/response";

export const departmentController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.getAll();
      return sendResponse(res, 200, "Departments fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.create(req.body);
      return sendResponse(res, 201, "Department created successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
