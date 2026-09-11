import { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../services/provider.service.js';
import { providerOnboardingSchema, updateAvailabilitySchema } from '../validators/provider.validator.js';

const providerService = new ProviderService();

export class ProviderController {
  static async onboard(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = providerOnboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0].message,
            details: parsed.error.errors,
          },
        });
      }

      const userId = req.user!.id;
      const profile = await providerService.onboard(userId, parsed.data);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await providerService.getMyProfile(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Provider profile not found.' },
        });
      }
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lat = req.query.lat ? parseFloat(req.query.lat.toString()) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng.toString()) : undefined;

      const profile = await providerService.getPublicProfile(id, lat, lng);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found.' },
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateAvailabilitySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0].message,
          },
        });
      }

      const userId = req.user!.id;
      await providerService.updateAvailability(userId, parsed.data);

      res.status(200).json({
        success: true,
        data: { message: 'Availability status updated successfully.' },
      });
    } catch (error) {
      next(error);
    }
  }
}
