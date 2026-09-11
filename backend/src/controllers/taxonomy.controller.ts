import { Request, Response, NextFunction } from 'express';
import { TaxonomyService } from '../services/taxonomy.service.js';

const taxonomyService = new TaxonomyService();

export class TaxonomyController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await taxonomyService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
        meta: { count: categories.length },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const categorySlug = req.query.category?.toString();
      const services = await taxonomyService.getServices(categorySlug);
      res.status(200).json({
        success: true,
        data: services,
        meta: { count: services.length },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await taxonomyService.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: `Category with slug '${slug}' not found.`,
          },
        });
      }
      const services = await taxonomyService.getServices(slug);
      res.status(200).json({
        success: true,
        data: {
          category,
          services,
        },
        meta: { count: services.length },
      });
    } catch (error) {
      next(error);
    }
  }
}
