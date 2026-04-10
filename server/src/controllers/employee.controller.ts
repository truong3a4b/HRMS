import { NextFunction, Request, Response } from "express";
import { employeeService } from "../services/employee.service";
import { sendResponse } from "../utils/response";

export const employeeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const search = String(req.query.search || "");

      const result = await employeeService.getAll(page, limit, search);
      return sendResponse(res, 200, "Employees fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await employeeService.getById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return sendResponse(res, 200, "Employee fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
