import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { subscriptionService } from '../services/subscription.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseHelper';

export class SubscriptionController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      const { data, total } = await subscriptionService.listSubscriptions(merchantId, limit, offset, status);
      return sendPaginated(res, data, total, limit, offset);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const sub = await subscriptionService.getSubscriptionById(req.params.id, merchantId);
      return sendSuccess(res, sub);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const created = await subscriptionService.createSubscription(merchantId, req.body);
      return sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  }
}

export const subscriptionController = new SubscriptionController();
