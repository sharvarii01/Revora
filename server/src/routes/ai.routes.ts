import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze-failure', (req, res, next) =>
  aiController.analyzeFailure(req, res, next)
);
router.get('/insights', (req, res, next) => aiController.getInsights(req, res, next));

export default router;
