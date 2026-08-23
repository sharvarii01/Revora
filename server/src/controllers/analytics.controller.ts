import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { analyticsService } from '../services/analytics.service';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { sendSuccess, sendPaginated } from '../utils/responseHelper';

export class AnalyticsController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const summary = await analyticsService.getSummaryMetrics(merchantId);
      return sendSuccess(res, summary);
    } catch (err) {
      next(err);
    }
  }

  async getTimeseries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const timeseries = await analyticsService.getTimeseries(merchantId);
      return sendSuccess(res, timeseries);
    } catch (err) {
      next(err);
    }
  }

  async getFailureReasons(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const breakdown = await analyticsService.getFailureReasonBreakdown(merchantId);
      return sendSuccess(res, breakdown);
    } catch (err) {
      next(err);
    }
  }

  async getChannelEfficiency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const channels = await analyticsService.getChannelEfficiency(merchantId);
      return sendSuccess(res, channels);
    } catch (err) {
      next(err);
    }
  }

  async getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const { data, total } = await auditLogRepository.list(merchantId, limit, offset);
      return sendPaginated(res, data, total, limit, offset);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
