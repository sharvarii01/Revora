import { Router } from 'express';
import authRoutes from './auth.routes';
import merchantRoutes from './merchant.routes';
import customerRoutes from './customer.routes';
import paymentRoutes from './payment.routes';
import subscriptionRoutes from './subscription.routes';
import recoveryRoutes from './recovery.routes';
import webhookRoutes from './webhook.routes';
import analyticsRoutes from './analytics.routes';
import simulatorRoutes from './simulator.routes';
import aiRoutes from './ai.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/merchant', merchantRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/recoveries', recoveryRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/simulator', simulatorRoutes);
apiRouter.use('/ai', aiRoutes);

export default apiRouter;
