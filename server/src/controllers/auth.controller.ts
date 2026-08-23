import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/responseHelper';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendCreated(res, result, 'Merchant registered successfully.');
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful.');
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      return sendSuccess(res, result, 'Tokens refreshed successfully.');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.refreshToken) {
        await authService.logout(req.body.refreshToken);
      }
      return sendSuccess(res, { loggedOut: true }, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
