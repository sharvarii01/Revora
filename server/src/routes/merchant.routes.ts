import { Router } from 'express';
import { merchantController } from '../controllers/merchant.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateSettingsSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', (req, res, next) => merchantController.getProfile(req, res, next));
router.put('/settings', validate(updateSettingsSchema), (req, res, next) =>
  merchantController.updateSettings(req, res, next)
);
router.get('/statistics', (req, res, next) => merchantController.getStatistics(req, res, next));

export default router;
