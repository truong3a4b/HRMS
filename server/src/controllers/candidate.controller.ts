import { NextFunction, Request, Response } from "express";
import { candidateService } from "../services/candidate.service";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

export const candidateController = {
  async getCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;

      const result = await candidateService.getCandidates({
        page,
        limit,
        search,
      });

      return sendResponse(res, 200, "Candidates fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getCandidateById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await candidateService.getCandidateById(id);
      return sendResponse(res, 200, "Candidate fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await candidateService.getMyProfile(userId);
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

      const result = await candidateService.updateMyProfile(userId, req.body);
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

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }

      const result = await candidateService.getMyApplications(userId);
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

  //lay don xin viec cua ung vien theo id
  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const applicationId = getParamValue(req.params.id);

      if (!userId) {
        return sendResponse(res, 401, "Unauthorized");
      }
      const result = await candidateService.getApplicationById(
        userId,
        applicationId,
      );
      return sendResponse(
        res,
        200,
        "Your application fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};
