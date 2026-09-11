import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';

export class ReviewController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const neederId = (req as any).user.id;
      const { id: requestId } = req.params;
      const { problemSolved, rating, comment } = req.body;

      if (rating === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rating (1-5) is required.',
          },
        });
      }

      const review = await ReviewService.createReview(neederId, requestId, {
        problemSolved: problemSolved !== false,
        rating: Number(rating),
        comment,
      });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProviderReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: providerId } = req.params;
      const reviews = await ReviewService.getProviderReviews(providerId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (err) {
      next(err);
    }
  }
}
