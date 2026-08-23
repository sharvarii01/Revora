import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => subscriptionController.list(req, res, next));
router.get('/:id', (req, res, next) => subscriptionController.getById(req, res, next));
router.post('/', (req, res, next) => subscriptionController.create(req, res, next));

export default router;
