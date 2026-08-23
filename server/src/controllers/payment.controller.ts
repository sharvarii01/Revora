import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { paymentService } from '../services/payment.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseHelper';

export class PaymentController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const { data, total } = await paymentService.listPayments(merchantId, limit, offset, status, search);
      return sendPaginated(res, data, total, limit, offset);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const payment = await paymentService.getPaymentById(req.params.id, merchantId);
      return sendSuccess(res, payment);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const result = await paymentService.createPayment(merchantId, req.body);
      return sendCreated(res, result, 'Payment created and recovery process initiated.');
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const updated = await paymentService.updatePayment(req.params.id, merchantId, req.body);
      return sendSuccess(res, updated, 'Payment updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const result = await paymentService.deletePayment(req.params.id, merchantId);
      return sendSuccess(res, result, 'Payment deleted successfully.');
    } catch (err) {
      next(err);
    }
  }

  async capture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const result = await paymentService.capturePayment(req.params.id, merchantId);
      return sendSuccess(res, result, 'Payment captured successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
