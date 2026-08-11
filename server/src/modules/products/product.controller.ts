import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.list(req.query as any);
      sendPaginated(res, result.products, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getById(req.params.id as string);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.create(req.body);
      sendCreated(res, product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.update(req.params.id as string, req.body);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.delete(req.params.id as string);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
