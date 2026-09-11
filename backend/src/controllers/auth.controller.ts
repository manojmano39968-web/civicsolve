import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { config } from '../config/index.js';

const authService = new AuthService();

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: config.jwtRefreshExpiresIn * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
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

      const ip = req.ip || req.socket.remoteAddress;
      const device = req.headers['user-agent'];

      const result = await authService.register(parsed.data, ip, device);
      setRefreshCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: config.jwtAccessExpiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0].message,
          },
        });
      }

      const ip = req.ip || req.socket.remoteAddress;
      const device = req.headers['user-agent'];

      const result = await authService.login(parsed.data, ip, device);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: config.jwtAccessExpiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (!rawToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token cookie is missing. Please log in.',
          },
        });
      }

      const ip = req.ip || req.socket.remoteAddress;
      const device = req.headers['user-agent'];

      const result = await authService.refresh(rawToken, ip, device);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: config.jwtAccessExpiresIn,
        },
      });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (rawToken) {
        await authService.logout(rawToken);
      }
      clearRefreshCookie(res);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully.' },
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getCurrentUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
