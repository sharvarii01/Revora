import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/refresh-token', validate(refreshTokenSchema), (req, res, next) =>
  authController.refreshToken(req, res, next)
);

router.post('/logout', (req, res, next) => authController.logout(req, res, next));

router.post('/forgot-password', authRateLimiter, (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

export default router;
