import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { getDatabase } from './database/index.js';
import taxonomyRoutes from './routes/taxonomy.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

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
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.indexOf(origin) !== -1 || config.env === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Health check endpoint
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

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/taxonomy', taxonomyRoutes);

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
