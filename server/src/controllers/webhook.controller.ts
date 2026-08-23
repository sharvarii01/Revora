import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/webhook.service';
import { sendSuccess } from '../utils/responseHelper';

export class WebhookController {
  async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await webhookService.processWebhook(rawBody, signature, req.body);
      return sendSuccess(res, result, 'Webhook processed.');
    } catch (err) {
      next(err);
    }
  }
}

export const webhookController = new WebhookController();
