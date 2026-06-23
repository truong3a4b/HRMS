import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { EmployeeStatus } from "../../generated/prisma/client";
import { employeeImportService } from "../services/employee-import.service";
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
  limit: z.coerce
    .number()
    .int()
    .refine((value) => value === -1 || (value >= 1 && value <= 100), {
      message: "limit must be -1 (all) or between 1 and 100",
    })
    .default(10),
  search: z.string().default(""),
  departmentId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  positionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(EmployeeStatus).optional(),
  ),
  view: z.enum(["summary"]).optional(),
});

export const employeeController = {
  async downloadImportTemplate(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const buffer = employeeImportService.createTemplateBuffer();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="employee-import-template.xlsx"',
      );
      return res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  },

  async previewImport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await employeeImportService.preview(req.file, req.user?.id);
      return sendResponse(
        res,
        201,
        "Employee import preview created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async confirmImport(req: Request, res: Response, next: NextFunction) {
    try {
      const batchId = Array.isArray(req.params.batchId)
        ? req.params.batchId[0]
        : req.params.batchId;
      const result = await employeeImportService.confirm(batchId, req.user?.id);
      return sendResponse(
        res,
        200,
        "Employees imported successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, departmentId, positionId, status, view } =
        getAllEmployeesQuerySchema.parse(req.query);

      const result = await employeeService.getAll(page, limit, search, {
        departmentId,
        positionId,
        status,
        view,
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

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      console.log("User ID from token:", userId);
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const result = req.user?.employeeId
        ? await employeeService.getById(req.user.employeeId)
        : await employeeService.getByUserId(userId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Employee account not found",
        });
      }

      return sendResponse(
        res,
        200,
        "Your employee profile fetched successfully",
        result,
      );
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

  async getMyJobHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const employee = req.user?.employeeId
        ? await employeeService.getById(req.user.employeeId)
        : await employeeService.getByUserId(userId);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee account not found",
        });
      }

      const result = await employeeService.getJobHistory(employee.id);

      return sendResponse(
        res,
        200,
        "Your employee job history fetched successfully",
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
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const me = req.user?.employeeId
        ? await employeeService.getById(req.user.employeeId)
        : await employeeService.getByUserId(userId);

      if (!me) {
        throw new ApiError(403, "Employee account not found");
      }

      const result = await employeeService.updateBasic(me.id, req.body);
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
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const me = req.user?.employeeId
        ? await employeeService.getById(req.user.employeeId)
        : await employeeService.getByUserId(userId);

      if (!me) {
        throw new ApiError(403, "Employee account not found");
      }

      const result = await employeeService.updateAdditional(me.id, req.body);
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
