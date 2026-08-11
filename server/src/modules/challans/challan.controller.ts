import { Request, Response, NextFunction } from 'express';
import { challanService } from './challan.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class ChallanController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await challanService.list(req.query as any);
      sendPaginated(res, result.challans, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await challanService.getById(req.params.id as string);
      sendSuccess(res, challan);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // created_by derived from authenticated user
      const challan = await challanService.create(req.body, req.user!.userId);
      sendCreated(res, challan);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await challanService.confirm(req.params.id as string, req.user!.userId);
      sendSuccess(res, challan);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await challanService.cancel(req.params.id as string, req.user!.userId);
      sendSuccess(res, challan);
    } catch (error) {
      next(error);
    }
  }
}

export const challanController = new ChallanController();
