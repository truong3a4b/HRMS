import { NextFunction, Request, Response } from "express";
import { recruitmentService } from "../services/recruitment.service";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

export const recruitmentController = {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.getMyProfile(userId);
      return sendResponse(
        res,
        200,
        "Candidate profile fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.updateMyProfile(userId, req.body);
      return sendResponse(
        res,
        200,
        "Candidate profile updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;
      const positionId =
        typeof req.query.positionId === "string"
          ? req.query.positionId
          : undefined;
      const departmentId =
        typeof req.query.departmentId === "string"
          ? req.query.departmentId
          : undefined;

      const result = await recruitmentService.getJobs({
        page,
        limit,
        search,
        positionId,
        departmentId,
      });

      return sendResponse(
        res,
        200,
        "Recruitment jobs fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await recruitmentService.getJobById(id);
      return sendResponse(
        res,
        200,
        "Recruitment job fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.createJob(userId, req.body);
      return sendResponse(
        res,
        201,
        "Recruitment job created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await recruitmentService.updateJob(id, req.body);
      return sendResponse(
        res,
        200,
        "Recruitment job updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async closeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await recruitmentService.closeJob(id);
      return sendResponse(
        res,
        200,
        "Recruitment job closed successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async applyJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.applyJob(userId, req.body);
      return sendResponse(
        res,
        201,
        "Job application created successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.getMyApplications(userId);
      return sendResponse(
        res,
        200,
        "Your applications fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const positionId =
        typeof req.query.positionId === "string"
          ? req.query.positionId
          : undefined;
      const recruitmentJobId =
        typeof req.query.recruitmentJobId === "string"
          ? req.query.recruitmentJobId
          : undefined;
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;

      const result = await recruitmentService.getApplications({
        page,
        limit,
        status: status as any,
        positionId,
        recruitmentJobId,
        search,
      });

      return sendResponse(
        res,
        200,
        "Applications fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await recruitmentService.getApplicationById(id);
      return sendResponse(res, 200, "Application fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.scheduleInterview(
        id,
        userId,
        req.body,
      );
      return sendResponse(res, 201, "Interview scheduled successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async respondToInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = getParamValue(req.params.id);
      const scheduleId = getParamValue(req.params.scheduleId);
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.respondToInterview(
        applicationId,
        scheduleId,
        userId,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Interview response recorded successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async submitEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = getParamValue(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.submitEvaluation(
        applicationId,
        userId,
        req.body,
      );
      return sendResponse(
        res,
        201,
        "Evaluation submitted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async decideApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = getParamValue(req.params.id);
      const result = await recruitmentService.decideApplication(
        applicationId,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Application decision saved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async sendOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = getParamValue(req.params.id);
      const result = await recruitmentService.sendOffer(
        applicationId,
        req.body,
      );
      return sendResponse(res, 200, "Offer sent successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async respondToOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = getParamValue(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await recruitmentService.respondToOffer(
        applicationId,
        userId,
        req.body,
      );
      return sendResponse(
        res,
        200,
        "Offer response processed successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getPipeline(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getPipeline();
      return sendResponse(
        res,
        200,
        "Recruitment pipeline fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
