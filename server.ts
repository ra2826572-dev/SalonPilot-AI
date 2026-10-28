import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { router } from './server/routes.ts';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json());

// Built-in cookie parser middleware
app.use((req: Request & { cookies?: Record<string, string> }, _res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookieStr) => {
      const [key, value] = cookieStr.trim().split('=');
      if (key && value) {
        try {
          req.cookies![key] = decodeURIComponent(value);
        } catch {
          req.cookies![key] = value;
        }
      }
    });
  }
  next();
});

// Trust proxy for secure cookies and rate limiting in cloud environments
app.set('trust proxy', 1);

// Mount API router
app.use('/api', router);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'SalonPilot AI',
    timestamp: new Date().toISOString(),
    databaseInitialized: true,
    salonsCount: db.getAllSalons().length
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev server middleware mounted');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('🚀 Serving production static bundle from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SalonPilot AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
