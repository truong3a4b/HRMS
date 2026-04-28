import { NextFunction, Request, Response } from "express";
import { positionService } from "../services/position.service";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await positionService.getById(id);
      return sendResponse(res, 200, "Position fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await positionService.update(id, req.body);
      return sendResponse(res, 200, "Position updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParamValue(req.params.id);
      const result = await positionService.delete(id);
      return sendResponse(res, 200, "Position deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
