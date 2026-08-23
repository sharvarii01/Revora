import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { simulatorService } from '../services/simulator.service';
import { sendSuccess } from '../utils/responseHelper';

export class SimulatorController {
  async triggerEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';
      const result = await simulatorService.triggerScenario({
        merchantId,
        ...req.body,
      });
      return sendSuccess(res, result, 'Simulator scenario executed successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const simulatorController = new SimulatorController();
