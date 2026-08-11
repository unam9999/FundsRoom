import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class CustomerController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.list(req.query as any);
      sendPaginated(res, result.customers, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.getById(req.params.id as string);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.create(req.body);
      sendCreated(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.update(req.params.id as string, req.body);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.delete(req.params.id as string);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // created_by is derived from authenticated user, never from client
      const followUp = await customerService.addFollowUp(
        req.params.id as string,
        req.body,
        req.user!.userId
      );
      sendCreated(res, followUp);
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
