import { NextFunction, Request, Response } from "express";
import { PayrollStatus } from "../../generated/prisma/client";
import { payrollService } from "../services/payroll.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

const getCurrentUser = (req: Request) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  return req.user;
};

const getNumberQuery = (value: unknown) => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getStatusQuery = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  return Object.values(PayrollStatus).includes(value as PayrollStatus)
    ? (value as PayrollStatus)
    : undefined;
};

export const payrollController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.create(getCurrentUser(req), req.body);
      return sendResponse(res, 201, "Payroll created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async createByTargets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.createByTargets(
        getCurrentUser(req),
        req.body,
      );
      return sendResponse(res, 201, "Payrolls created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getAll(getCurrentUser(req), {
        employeeId:
          typeof req.query.employeeId === "string"
            ? req.query.employeeId
            : undefined,
        departmentId:
          typeof req.query.departmentId === "string"
            ? req.query.departmentId
            : undefined,
        positionId:
          typeof req.query.positionId === "string"
            ? req.query.positionId
            : undefined,
        month: getNumberQuery(req.query.month),
        year: getNumberQuery(req.query.year),
        status: getStatusQuery(req.query.status),
      });
      return sendResponse(res, 200, "Payrolls fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getMine(getCurrentUser(req), {
        month: getNumberQuery(req.query.month),
        year: getNumberQuery(req.query.year),
      });
      return sendResponse(res, 200, "My payrolls fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.getById(getCurrentUser(req), id);
      return sendResponse(res, 200, "Payroll fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.update(
        getCurrentUser(req),
        id,
        req.body,
      );
      return sendResponse(res, 200, "Payroll updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async requestApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.requestApproval(
        getCurrentUser(req),
        id,
      );
      return sendResponse(
        res,
        200,
        "Payroll submitted for approval successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.approve(getCurrentUser(req), id);
      return sendResponse(res, 200, "Payroll approved successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async approveMany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.approveMany(
        getCurrentUser(req),
        req.body.ids,
      );
      return sendResponse(res, 200, "Payrolls approved successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async pay(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.pay(getCurrentUser(req), id);
      return sendResponse(res, 200, "Payroll paid successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async payMany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.payMany(
        getCurrentUser(req),
        req.body.ids,
      );
      return sendResponse(res, 200, "Payrolls paid successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
