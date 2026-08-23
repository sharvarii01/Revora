import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { merchantService } from '../services/merchant.service';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/responseHelper';

export class MerchantController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const profile = await merchantService.getProfile(merchantId);
      return sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const updated = await merchantService.updateSettings(merchantId, req.body);
      return sendSuccess(res, updated, 'Merchant settings updated.');
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const stats = await analyticsService.getSummaryMetrics(merchantId);
      return sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }
}

export const merchantController = new MerchantController();
