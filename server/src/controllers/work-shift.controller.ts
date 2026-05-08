import { Request, Response } from "express";
import { workShiftService } from "../services/work-shift.service";
import { sendResponse } from "../utils/response";

export const workShiftController = {
  async create(req: Request, res: Response) {
    const payload = req.body;
    const shift = await workShiftService.create(payload);
    return sendResponse(res, 201, "Created", shift);
  },

  async update(req: Request, res: Response) {
    const id = String(req.params.id);
    const payload = req.body;
    const shift = await workShiftService.update(id, payload);
    return sendResponse(res, 200, "Updated", shift);
  },

  async remove(req: Request, res: Response) {
    const id = String(req.params.id);
    const shift = await workShiftService.remove(id);
    return sendResponse(res, 200, "Deleted", shift);
  },

  async getAll(req: Request, res: Response) {
    const shifts = await workShiftService.getAll();
    return sendResponse(res, 200, "OK", shifts);
  },

  async getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const shift = await workShiftService.getById(id);
    return sendResponse(res, 200, "OK", shift);
  },
};
