import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/razorpay', (req, res, next) =>
  webhookController.handleRazorpayWebhook(req, res, next)
);

export default router;
