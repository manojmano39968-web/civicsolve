import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { getDatabase } from './database/index.js';
import taxonomyRoutes from './routes/taxonomy.routes.js';
import authRoutes from './routes/auth.routes.js';
import providerRoutes from './routes/provider.routes.js';
import searchRoutes from './routes/search.routes.js';
import requestRoutes from './routes/request.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// Security Headers with strict Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration with same-origin and safe rejection support
app.use(
  cors((req: Request, callback: any) => {
    const origin = req.header('Origin');
    const host = req.header('Host');

    // Allow requests with no origin (curl, mobile native apps, same-origin without Origin header)
    if (!origin) {
      return callback(null, { origin: true, credentials: true });
    }

    // Always allow same-origin requests (browser subresource loading, e.g. <script crossorigin> and <link crossorigin>)
    const isSameOrigin = host && (
      origin === `https://${host}` ||
      origin === `http://${host}`
    );
    if (isSameOrigin) {
      return callback(null, { origin: true, credentials: true });
    }

    // Allow Render external URL if defined
    if (process.env.RENDER_EXTERNAL_URL && origin === process.env.RENDER_EXTERNAL_URL) {
      return callback(null, { origin: true, credentials: true });
    }

    // Allow explicitly configured origins or development mode
    if (config.env === 'development' || config.allowedOrigins.includes(origin)) {
      return callback(null, { origin: true, credentials: true });
    }

    // Safely disallow without throwing an Error (which would abort the request with 500 JSON error)
    return callback(null, { origin: false });
  })
);

// Body and cookie parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Request tracking correlation ID
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id']?.toString() || crypto.randomUUID();
  res.setHeader('x-request-id', requestId);
  req.headers['x-request-id'] = requestId;
  next();
});

// Health check endpoint (exempt from rate limits)
app.get('/api/v1/health', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = await db.query('SELECT 1 as alive');
    return res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'CivicSolve V2 API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        database: db.isPostgres() ? 'postgresql' : 'sqlite',
        dbConnected: result.rowCount > 0,
      },
      meta: {
        requestId: res.getHeader('x-request-id'),
      },
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
        details: config.env === 'development' ? error.message : undefined,
        requestId: res.getHeader('x-request-id'),
      },
    });
  }
});

// Stricter Authentication Rate Limiter (brute-force defense)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? (process.env.TEST_RATE_LIMIT ? 2 : 1000) : parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
      },
    });
  },
});

// Global API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? (process.env.TEST_RATE_LIMIT ? 3 : 5000) : parseInt(process.env.RATE_LIMIT_API_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
      },
    });
  },
});

// Mount Rate Limiters & Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1', apiLimiter);
app.use('/api/v1/taxonomy', taxonomyRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/admin', adminRoutes);

// Serve compiled Frontend SPA in production / staging if dist folder exists
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistCandidates = [
  path.resolve(process.cwd(), 'frontend', 'dist'),
  path.resolve(process.cwd(), '..', 'frontend', 'dist'),
  path.resolve(process.cwd(), 'dist', 'frontend'),
  path.resolve(currentDir, '../../frontend/dist'),
  path.resolve(currentDir, '../../../frontend/dist'),
];
const frontendDist = frontendDistCandidates.find(p => fs.existsSync(p));

if (frontendDist) {
  // 1. Serve static files with explicit index option
  app.use(express.static(frontendDist, {
    index: 'index.html',
    maxAge: '1d',
  }));

  // 2. Guard: Prevent SPA fallback from swallowing missing /assets/* requests
  app.get('/assets/*', (_req: Request, res: Response) => {
    res.status(404).type('text/plain').send('Asset not found');
  });

  // 3. SPA fallback for client-side navigation routes (e.g. /search, /login, /requests)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Centralized error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const requestId = res.getHeader('x-request-id') || 'unknown';
  console.error(`[Error ${requestId}]:`, err);

  const statusCode = err.statusCode || 500;
  const message = config.env === 'production' && statusCode === 500 
    ? 'An unexpected error occurred.' 
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      requestId,
    },
  });
});

// Start server if not in test mode
if (config.env !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 CivicSolve V2 Server running on http://localhost:${config.port}`);
    console.log(`📡 Environment: ${config.env}`);
    console.log(`🔐 CORS Allowed Origins: ${config.allowedOrigins.join(', ')}`);
  });
}

export default app;
