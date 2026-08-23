import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', (req, res, next) => analyticsController.getSummary(req, res, next));
router.get('/timeseries', (req, res, next) => analyticsController.getTimeseries(req, res, next));
router.get('/failure-reasons', (req, res, next) =>
  analyticsController.getFailureReasons(req, res, next)
);
router.get('/channels', (req, res, next) =>
  analyticsController.getChannelEfficiency(req, res, next)
);
router.get('/activity-logs', (req, res, next) =>
  analyticsController.getActivityLogs(req, res, next)
);

export default router;
