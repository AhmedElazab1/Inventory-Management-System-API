// Node modules
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';

// Custom modules
import env from './config/env';
import limiter from './config/limiter';
import router from './routes/index';
import { notFound } from './common/middlewares/index';
import errorHandler from './common/errors/errorHandler';
import { swaggerSpec } from './config/swagger.config';

// Types
import './common/Interfaces/types';
import { CorsOptions } from 'cors';
import { Request, Response } from 'express';

const app = express();

const logStream = fs.createWriteStream(path.join(process.cwd(), 'logs', 'api.log'), {
  flags: 'a',
});

const corsOptions: CorsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(compression({ threshold: 1024 }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors(corsOptions));
app.use(limiter);

// Compatibility middleware for express-mongo-sanitize with Express 5
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach((prop) => {
    const value = (req as any)[prop];
    Object.defineProperty(req, prop, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  });
  next();
});

app.use(mongoSanitize());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny', { stream: logStream }));
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Simple hello world endpoint
 *     security: []
 *     responses:
 *       200:
 *         description: Hello World message
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
  }),
);

app.use('/api/v1', router);
app.use(notFound);
app.use(errorHandler);

export default app;
