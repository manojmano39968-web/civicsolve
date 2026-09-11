import { Request, Response, NextFunction } from 'express';
import { CivicSolveIntelligenceEngine } from '../intelligence/index.js';
import { getDatabase } from '../database/index.js';
import crypto from 'crypto';

const engine = new CivicSolveIntelligenceEngine();
const db = getDatabase();

export class SearchController {
  static async understand(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q?.toString() || '';
      if (!query.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUERY_REQUIRED',
            message: 'Search query string parameter "q" is required.',
          },
        });
      }

      const understanding = await engine.understand(query);

      res.status(200).json({
        success: true,
        data: understanding,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.body || {};

      const result = await engine.matchProviders({
        query: filters.query,
        serviceId: filters.serviceId,
        categorySlug: filters.categorySlug,
        latitude: filters.latitude !== undefined ? Number(filters.latitude) : undefined,
        longitude: filters.longitude !== undefined ? Number(filters.longitude) : undefined,
        maxDistanceKm: filters.maxDistanceKm !== undefined ? Number(filters.maxDistanceKm) : undefined,
        minRating: filters.minRating !== undefined ? Number(filters.minRating) : undefined,
        serviceMode: filters.serviceMode,
        onlyAvailable: filters.onlyAvailable,
        onlyVerified: filters.onlyVerified,
        page: filters.page ? Number(filters.page) : 1,
        limit: filters.limit ? Number(filters.limit) : 10,
      });

      res.status(200).json({
        success: true,
        data: {
          providers: result.providers,
          understanding: result.understanding,
        },
        meta: {
          total: result.total,
          count: result.providers.length,
          page: filters.page || 1,
          limit: filters.limit || 10,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async postRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const { rawQuery, detectedCategory, detectedService, city } = req.body;
      if (!rawQuery) {
        return res.status(400).json({
          success: false,
          error: { code: 'QUERY_REQUIRED', message: 'Requirement query is required.' },
        });
      }

      const id = `req-${crypto.randomUUID()}`;
      const neederId = req.user?.id || null;

      await db.query(
        `INSERT INTO unmet_requirements (id, raw_query, detected_category, detected_service, needer_id, city)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, rawQuery, detectedCategory || null, detectedService || null, neederId, city || null]
      );

      res.status(201).json({
        success: true,
        data: {
          id,
          message: 'Your requirement has been recorded. Solvers will be notified as they onboard in your area.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
