import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import apiRouter from './routes/index.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { NotFoundError } from './utils/errors';
import { sendSuccess } from './utils/responseHelper';
import { env } from './config/env';

export function createServer(): Application {
  const app: Application = express();

  // Security Headers & CORS
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline scripts
    })
  );

  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, 'http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
    })
  );

  // Body parser with raw body buffer for Webhook signature verification
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        (req as any).rawBody = buf.toString('utf8');
      },
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Request Logging & Rate Limiting
  app.use(requestLogger);
  app.use('/api', globalRateLimiter);

  // Root Welcome & Navigation Handler for Browser / API Clients
  app.get('/', (req: Request, res: Response) => {
    // If request accepts HTML (like a browser visit), render a clean status landing page
    if (req.accepts('html')) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Revora API Server – Port 5000</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
            .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; max-width: 600px; width: 100%; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid rgba(16, 185, 129, 0.3); }
            .dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; display: inline-block; }
            h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
            p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
            .links { display: flex; flex-direction: column; gap: 10px; }
            .link-btn { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #27272a; border: 1px solid #3f3f46; border-radius: 10px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
            .link-btn:hover { background: #3f3f46; border-color: #6366f1; }
            .link-btn.primary { background: #4f46e5; border-color: #6366f1; }
            .link-btn.primary:hover { background: #4338ca; }
            .tag { font-size: 11px; color: #a1a1aa; font-family: monospace; }
            .footer { margin-top: 24px; pt: 16px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge"><span class="dot"></span> Revora Backend API Live</div>
            <h1>Revora – AI Revenue Recovery Platform</h1>
            <p>You are viewing the Express backend server on <strong>Port 5000</strong>. Access the frontend dashboard and API docs using the links below:</p>
            <div class="links">
              <a href="http://localhost:3005" class="link-btn primary">
                <span>🖥️ Open Frontend Dashboard (Port 3005)</span>
                <span class="tag">http://localhost:3005</span>
              </a>
              <a href="/api/docs" class="link-btn">
                <span>📚 Interactive Swagger API Docs</span>
                <span class="tag">/api/docs</span>
              </a>
              <a href="/health" class="link-btn">
                <span>🩺 System Health Check</span>
                <span class="tag">/health</span>
              </a>
            </div>
            <div class="footer">
              AI Decision Engine (Groq + Gemini) • Razorpay Webhooks • NPCI AutoPay OC-136
            </div>
          </div>
        </body>
        </html>
      `);
    }

    return sendSuccess(res, {
      service: 'revora-backend-api',
      status: 'online',
      message: 'Revora AI Revenue Recovery Platform Backend Server is running.',
      frontendDashboardUrl: 'http://localhost:3005',
      swaggerDocs: '/api/docs',
      healthCheck: '/health',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    return sendSuccess(res, {
      status: 'healthy',
      service: 'revora-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });

  // Swagger Documentation UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Mount API Sub-routers
  app.use('/api', apiRouter);

  // 404 Route Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found.`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createServer;
