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

const getNumberQuery = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new ApiError(400, `${field} must be an integer`, "INVALID_QUERY");
  }

  return parsed;
};

const getNumberParam = (value: string | string[], field: string) => {
  const raw = getParamValue(value);
  const parsed = Number(raw);

  if (!Number.isInteger(parsed)) {
    throw new ApiError(400, `${field} must be an integer`, "INVALID_PARAM");
  }

  return parsed;
};

const getStatusQuery = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  if (!Object.values(PayrollStatus).includes(value as PayrollStatus)) {
    throw new ApiError(400, "Invalid payroll status", "INVALID_QUERY");
  }

  return value as PayrollStatus;
};

const getMonthQuery = (value: unknown) => {
  const month = getNumberQuery(value, "month");
  if (month !== undefined && (month < 1 || month > 12)) {
    throw new ApiError(400, "month must be between 1 and 12", "INVALID_QUERY");
  }

  return month;
};

const getYearQuery = (value: unknown) => {
  const year = getNumberQuery(value, "year");
  if (year !== undefined && (year < 1900 || year > 9999)) {
    throw new ApiError(400, "year must be between 1900 and 9999", "INVALID_QUERY");
  }

  return year;
};

const getMonthParam = (value: string | string[]) => {
  const month = getNumberParam(value, "month");
  if (month < 1 || month > 12) {
    throw new ApiError(400, "month must be between 1 and 12", "INVALID_PARAM");
  }

  return month;
};

const getYearParam = (value: string | string[]) => {
  const year = getNumberParam(value, "year");
  if (year < 1900 || year > 9999) {
    throw new ApiError(400, "year must be between 1900 and 9999", "INVALID_PARAM");
  }

  return year;
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

  async createByTargetsJob(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.createByTargetsJob(
        getCurrentUser(req),
        req.body,
      );
      return sendResponse(
        res,
        202,
        "Payroll calculation job created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getCalculationJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.getCalculationJob(
        getCurrentUser(req),
        id,
      );
      return sendResponse(
        res,
        200,
        "Payroll calculation job fetched successfully",
        result,
      );
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
        periodId:
          typeof req.query.periodId === "string" ? req.query.periodId : undefined,
        departmentId:
          typeof req.query.departmentId === "string"
            ? req.query.departmentId
            : undefined,
        positionId:
          typeof req.query.positionId === "string"
            ? req.query.positionId
            : undefined,
        month: getMonthQuery(req.query.month),
        year: getYearQuery(req.query.year),
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
        month: getMonthQuery(req.query.month),
        year: getYearQuery(req.query.year),
      });
      return sendResponse(res, 200, "My payrolls fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getPeriods(getCurrentUser(req), {
        month: getMonthQuery(req.query.month),
        year: getYearQuery(req.query.year),
      });
      return sendResponse(res, 200, "Payroll periods fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getPeriodOverviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getPeriodOverview(getCurrentUser(req), {
        periodId: getParamValue(req.params.periodId),
      });
      return sendResponse(
        res,
        200,
        "Payroll period overview fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async exportPeriodExcelById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.exportPeriodExcel(getCurrentUser(req), {
        periodId: getParamValue(req.params.periodId),
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );

      return res.status(200).send(result.buffer);
    } catch (error) {
      next(error);
    }
  },

  async getPeriodOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getPeriodOverview(getCurrentUser(req), {
        month: getMonthParam(req.params.month),
        year: getYearParam(req.params.year),
      });
      return sendResponse(
        res,
        200,
        "Payroll period overview fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPeriodEmployeeDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.getPeriodEmployeeDetail(
        getCurrentUser(req),
        {
          month: getMonthParam(req.params.month),
          year: getYearParam(req.params.year),
          employeeId: getParamValue(req.params.employeeId),
        },
      );
      return sendResponse(
        res,
        200,
        "Employee payroll period detail fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPeriodEmployeeDetailById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.getPeriodEmployeeDetail(
        getCurrentUser(req),
        {
          periodId: getParamValue(req.params.periodId),
          employeeId: getParamValue(req.params.employeeId),
        },
      );
      return sendResponse(
        res,
        200,
        "Employee payroll period detail fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async removePeriodEmployeeById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.removeEmployeeFromPeriod(
        getCurrentUser(req),
        {
          periodId: getParamValue(req.params.periodId),
          employeeId: getParamValue(req.params.employeeId),
        },
      );
      return sendResponse(
        res,
        200,
        "Payroll employee removed from period successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async requestPeriodApproval(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.requestPeriodApproval(
        getCurrentUser(req),
        {
          month: getMonthParam(req.params.month),
          year: getYearParam(req.params.year),
        },
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Payroll period submitted for approval successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async requestPeriodApprovalById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollService.requestPeriodApproval(
        getCurrentUser(req),
        { periodId: getParamValue(req.params.periodId) },
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Payroll period submitted for approval successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async approvePeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.approvePeriod(getCurrentUser(req), {
        month: getMonthParam(req.params.month),
        year: getYearParam(req.params.year),
      });
      return sendResponse(
        res,
        200,
        "Payroll period approved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async approvePeriodById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.approvePeriod(getCurrentUser(req), {
        periodId: getParamValue(req.params.periodId),
      });
      return sendResponse(
        res,
        200,
        "Payroll period approved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async cancelPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.cancelPeriod(getCurrentUser(req), {
        month: getMonthParam(req.params.month),
        year: getYearParam(req.params.year),
      });
      return sendResponse(
        res,
        200,
        "Payroll period cancelled successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async cancelPeriodById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.cancelPeriod(getCurrentUser(req), {
        periodId: getParamValue(req.params.periodId),
      });
      return sendResponse(
        res,
        200,
        "Payroll period cancelled successfully",
        result,
      );
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
        req.body,
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

  async getPaymentBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.getPaymentBatches(getCurrentUser(req), {
        month: getMonthQuery(req.query.month),
        year: getYearQuery(req.query.year),
        employeeId:
          typeof req.query.employeeId === "string"
            ? req.query.employeeId
            : undefined,
        periodId:
          typeof req.query.periodId === "string" ? req.query.periodId : undefined,
      });
      return sendResponse(
        res,
        200,
        "Payroll payment batches fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPaymentBatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollService.getPaymentBatchById(
        getCurrentUser(req),
        id,
      );
      return sendResponse(
        res,
        200,
        "Payroll payment batch fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createPaymentBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollService.createPaymentBatch(
        getCurrentUser(req),
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Payroll payment batch created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
