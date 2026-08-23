import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => paymentController.list(req, res, next));
router.post('/', (req, res, next) => paymentController.create(req, res, next));
router.get('/:id', (req, res, next) => paymentController.getById(req, res, next));
router.patch('/:id', (req, res, next) => paymentController.update(req, res, next));
router.delete('/:id', (req, res, next) => paymentController.delete(req, res, next));
router.post('/:id/capture', (req, res, next) => paymentController.capture(req, res, next));

export default router;
