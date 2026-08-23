import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/customer.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => customerController.list(req, res, next));
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));
router.post('/', validate(createCustomerSchema), (req, res, next) =>
  customerController.create(req, res, next)
);
router.put('/:id', validate(updateCustomerSchema), (req, res, next) =>
  customerController.update(req, res, next)
);

export default router;
