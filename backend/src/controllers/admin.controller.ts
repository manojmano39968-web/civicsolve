import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  /**
   * GET /api/v1/admin/metrics
   */
  static async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getPlatformMetrics();
      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/attestations
   */
  static async getAttestations(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const attestations = await AdminService.getAttestations(status);
      return res.status(200).json({
        success: true,
        data: attestations,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/attestations/:id
   */
  static async reviewAttestation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { decision, notes } = req.body;

      if (!decision || !['VERIFIED', 'REJECTED'].includes(decision)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: "Decision must be either 'VERIFIED' or 'REJECTED'.",
          },
        });
      }

      const adminId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const updated = await AdminService.reviewAttestation(
        id,
        adminId,
        decision,
        notes,
        ipAddress
      );

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/weights
   */
  static async getWeights(_req: Request, res: Response, next: NextFunction) {
    try {
      const weights = await AdminService.getMatchingWeights();
      return res.status(200).json({
        success: true,
        data: weights,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/weights
   */
  static async updateWeights(req: Request, res: Response, next: NextFunction) {
    try {
      const { weights } = req.body;
      const adminId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const updated = await AdminService.updateMatchingWeights(weights, adminId, ipAddress);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/weights/reset
   */
  static async resetWeights(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const defaults = await AdminService.resetMatchingWeights(adminId, ipAddress);

      return res.status(200).json({
        success: true,
        data: defaults,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await AdminService.getAuditLogs(limit);

      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  }
}
