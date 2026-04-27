import { NextFunction, Request, Response } from "express";
import { departmentService } from "../services/department.service";
import { ApiError } from "../utils/apiError";
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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await departmentService.getById(id);

      if (!result) {
        throw new ApiError(404, "Department not found", "DEPARTMENT_NOT_FOUND");
      }

      return sendResponse(res, 200, "Department fetched successfully", result);
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

  async updateManager(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await departmentService.updateManager(
        departmentId,
        req.body.managerId,
      );

      return sendResponse(
        res,
        200,
        "Department manager updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateBasic(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await departmentService.updateBasic(
        departmentId,
        req.body,
      );

      return sendResponse(
        res,
        200,
        "Department basic information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await departmentService.remove(departmentId);

      return sendResponse(res, 200, "Department deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
