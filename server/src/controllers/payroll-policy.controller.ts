import { NextFunction, Request, Response } from "express";
import { payrollPolicyService } from "../services/payroll-policy.service";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

const getBooleanQuery = (value: unknown) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

export const payrollPolicyController = {
  async getInsurancePolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollPolicyService.insurancePolicies.getAll({
        isActive: getBooleanQuery(req.query.isActive),
      });
      return sendResponse(
        res,
        200,
        "Insurance policies fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getInsurancePolicyById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.insurancePolicies.getById(id);
      return sendResponse(
        res,
        200,
        "Insurance policy fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createInsurancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.insurancePolicies.create(
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Insurance policy created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateInsurancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.insurancePolicies.update(
        id,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Insurance policy updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteInsurancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.insurancePolicies.delete(id);
      return sendResponse(
        res,
        200,
        "Insurance policy deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getTaxPolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollPolicyService.taxPolicies.getAll({
        isActive: getBooleanQuery(req.query.isActive),
      });
      return sendResponse(res, 200, "Tax policies fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getTaxPolicyById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.taxPolicies.getById(id);
      return sendResponse(res, 200, "Tax policy fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async createTaxPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollPolicyService.taxPolicies.create(req.body);
      return sendResponse(res, 201, "Tax policy created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async updateTaxPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.taxPolicies.update(id, req.body);
      return sendResponse(res, 200, "Tax policy updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async deleteTaxPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.taxPolicies.delete(id);
      return sendResponse(res, 200, "Tax policy deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getAttendanceBonusPolicies(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.attendanceBonusPolicies.getAll({
        isActive: getBooleanQuery(req.query.isActive),
      });
      return sendResponse(
        res,
        200,
        "Attendance bonus policies fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getAttendanceBonusPolicyById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result =
        await payrollPolicyService.attendanceBonusPolicies.getById(id);
      return sendResponse(
        res,
        200,
        "Attendance bonus policy fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createAttendanceBonusPolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.attendanceBonusPolicies.create(
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Attendance bonus policy created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateAttendanceBonusPolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.attendanceBonusPolicies.update(
        id,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Attendance bonus policy updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteAttendanceBonusPolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result =
        await payrollPolicyService.attendanceBonusPolicies.delete(id);
      return sendResponse(
        res,
        200,
        "Attendance bonus policy deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getAllowancePolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollPolicyService.allowancePolicies.getAll({
        isActive: getBooleanQuery(req.query.isActive),
      });
      return sendResponse(
        res,
        200,
        "Allowance policies fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getAllowancePolicyById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.allowancePolicies.getById(id);
      return sendResponse(
        res,
        200,
        "Allowance policy fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createAllowancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.allowancePolicies.create(
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Allowance policy created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateAllowancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.allowancePolicies.update(
        id,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Allowance policy updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteAllowancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.allowancePolicies.delete(id);
      return sendResponse(
        res,
        200,
        "Allowance policy deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getAllowanceAssignments(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.allowancePolicies.getAssignments({
        allowancePolicyId:
          typeof req.query.allowancePolicyId === "string"
            ? req.query.allowancePolicyId
            : undefined,
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
      });
      return sendResponse(
        res,
        200,
        "Allowance assignments fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async assignAllowancePolicy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.allowancePolicies.assign(
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Allowance policy assigned successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPayrollBonusPenalties(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.payrollBonusPenalties.getAll({
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
        month:
          typeof req.query.month === "string"
            ? new Date(req.query.month)
            : undefined,
      });
      return sendResponse(
        res,
        200,
        "Payroll bonus penalties fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPayrollBonusPenaltyById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result =
        await payrollPolicyService.payrollBonusPenalties.getById(id);
      return sendResponse(
        res,
        200,
        "Payroll bonus penalty fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createPayrollBonusPenalty(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.payrollBonusPenalties.create(
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Payroll bonus penalty created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updatePayrollBonusPenalty(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result = await payrollPolicyService.payrollBonusPenalties.update(
        id,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Payroll bonus penalty updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async deletePayrollBonusPenalty(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getParamValue(req.params.id);
      const result =
        await payrollPolicyService.payrollBonusPenalties.delete(id);
      return sendResponse(
        res,
        200,
        "Payroll bonus penalty deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPayrollProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrollPolicyService.payrollProfiles.getAll({
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
      });
      return sendResponse(
        res,
        200,
        "Payroll profiles fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPayrollProfileByEmployeeId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const employeeId = getParamValue(req.params.employeeId);
      const result =
        await payrollPolicyService.payrollProfiles.getByEmployeeId(employeeId);
      return sendResponse(
        res,
        200,
        "Payroll profile fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async assignPayrollPolicies(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await payrollPolicyService.payrollProfiles.assign(req.body);
      return sendResponse(
        res,
        200,
        "Payroll policies assigned successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
