import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { customerService } from '../services/customer.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseHelper';

export class CustomerController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;

      const { data, total } = await customerService.listCustomers(merchantId, limit, offset, search);
      return sendPaginated(res, data, total, limit, offset);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const customer = await customerService.getCustomerById(req.params.id, merchantId);
      return sendSuccess(res, customer);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const created = await customerService.createCustomer(merchantId, req.body);
      return sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const updated = await customerService.updateCustomer(req.params.id, merchantId, req.body);
      return sendSuccess(res, updated, 'Customer updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
