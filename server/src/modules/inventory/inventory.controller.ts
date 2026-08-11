import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class InventoryController {
  async getStockLevels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await inventoryService.getStockLevels(req.query as any);
      sendPaginated(res, result.products, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await inventoryService.getMovements(req.query as any);
      sendPaginated(res, result.movements, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async createMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // created_by derived from token, never from client
      const movement = await inventoryService.createMovement(
        req.body,
        req.user!.userId
      );
      sendCreated(res, movement);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
