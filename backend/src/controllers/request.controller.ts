import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/request.service.js';

export class RequestController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const neederId = (req as any).user.id;
      const payload = req.body;

      if (!payload.providerId || !payload.serviceId || !payload.title || !payload.description) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'providerId, serviceId, title, and description are required.',
          },
        });
      }

      const serviceRequest = await RequestService.createRequest(neederId, payload);
      res.status(201).json({
        success: true,
        data: serviceRequest,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const statusFilter = req.query.status as string | undefined;

      const requests = await RequestService.listRequests(user.id, user.role, statusFilter);
      res.json({
        success: true,
        data: requests,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const serviceRequest = await RequestService.getRequestById(id, user.id, user.role);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Service request not found.',
          },
        });
      }

      res.json({
        success: true,
        data: serviceRequest,
      });
    } catch (err) {
      next(err);
    }
  }

  static async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { note } = req.body;

      const updated = await RequestService.acceptRequest(id, user.id, note);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await RequestService.rejectRequest(id, user.id, reason);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { note } = req.body;

      const updated = await RequestService.startRequest(id, user.id, note);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { finalPrice, note } = req.body;

      const updated = await RequestService.completeRequest(
        id,
        user.id,
        user.role,
        finalPrice ? parseFloat(finalPrice) : undefined,
        note
      );
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await RequestService.cancelRequest(id, user.id, user.role, reason);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async dispute(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A reason must be provided when raising a dispute.',
          },
        });
      }

      const updated = await RequestService.disputeRequest(id, user.id, user.role, reason);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
