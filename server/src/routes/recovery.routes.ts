import { Router } from 'express';
import { recoveryController } from '../controllers/recovery.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  stopRecoverySchema,
  recoveryQuerySchema,
} from '../validators/recovery.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(recoveryQuerySchema), (req, res, next) =>
  recoveryController.list(req, res, next)
);

router.get('/:id', (req, res, next) => recoveryController.getById(req, res, next));

router.post('/:id/stop', validate(stopRecoverySchema), (req, res, next) =>
  recoveryController.stop(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  recoveryController.delete(req, res, next)
);

export default router;
