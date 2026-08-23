import { Router } from 'express';
import { simulatorController } from '../controllers/simulator.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { simulatorTriggerSchema } from '../validators/simulator.validator';

const router = Router();

router.use(authenticate);

router.post('/trigger-event', validate(simulatorTriggerSchema), (req, res, next) =>
  simulatorController.triggerEvent(req, res, next)
);

export default router;
