import { NextFunction, Request, Response } from "express";
import { positionService } from "../services/position.service";
import { sendResponse } from "../utils/response";

export const positionController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await positionService.getAll();
      return sendResponse(res, 200, "Positions fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getPermissionCatalog(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await positionService.getPermissionCatalog();
      return sendResponse(res, 200, "Permissions fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await positionService.create(req.body);
      return sendResponse(res, 201, "Position created successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
