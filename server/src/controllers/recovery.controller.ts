import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { recoveryService } from '../services/recovery.service';
import { sendSuccess, sendPaginated } from '../utils/responseHelper';

export class RecoveryController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;
      const type = req.query.type as string;
      const search = req.query.search as string;

      const { data, total } = await recoveryService.listRecoveries(
        merchantId,
        limit,
        offset,
        status,
        type,
        search
      );
      return sendPaginated(res, data, total, limit, offset);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const recovery = await recoveryService.getRecoveryById(req.params.id, merchantId);
      return sendSuccess(res, recovery);
    } catch (err) {
      next(err);
    }
  }

  async stop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const { reason, notes } = req.body;
      const stopped = await recoveryService.stopRecovery(req.params.id, merchantId, reason, notes);
      return sendSuccess(res, stopped, 'Recovery session stopped.');
    } catch (err) {
      next(err);
    }
  }
}

export const recoveryController = new RecoveryController();
