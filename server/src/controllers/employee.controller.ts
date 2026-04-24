import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { EmployeeStatus } from "../../generated/prisma/client";
import { employeeService } from "../services/employee.service";
import { sendResponse } from "../utils/response";
import { ApiError } from "../utils/apiError";

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

const getAllEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().default(""),
  departmentId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  positionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(EmployeeStatus).optional(),
  ),
});

export const employeeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, departmentId, positionId, status } =
        getAllEmployeesQuerySchema.parse(req.query);

      const result = await employeeService.getAll(page, limit, search, {
        departmentId,
        positionId,
        status,
      });
      return sendResponse(res, 200, "Employees fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.create(req.body);
      return sendResponse(res, 201, "Employee created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getJobHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await employeeService.getJobHistory(id);

      return sendResponse(
        res,
        200,
        "Employee job history fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateBasic(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await employeeService.updateBasic(id, req.body);
      return sendResponse(
        res,
        200,
        "Employee basic information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMyBasic(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user?.employeeId;

      if (!employeeId) {
        throw new ApiError(403, "Employee account not found");
      }

      const result = await employeeService.updateBasic(employeeId, req.body);
      return sendResponse(
        res,
        200,
        "Your basic information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateAdditional(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await employeeService.updateAdditional(id, req.body);
      return sendResponse(
        res,
        200,
        "Employee additional information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMyAdditional(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user?.employeeId;

      if (!employeeId) {
        throw new ApiError(403, "Employee account not found");
      }

      const result = await employeeService.updateAdditional(
        employeeId,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Your additional information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await employeeService.updateJob(id, req.body);
      return sendResponse(
        res,
        200,
        "Employee job information updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
