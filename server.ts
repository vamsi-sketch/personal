import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { corsMiddleware } from './backend/middleware/cors.js';
import { errorHandler } from './backend/middleware/errorHandler.js';
import apiRoutes from './backend/routes/index.js';
import { initDatabase } from './backend/database/initDatabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Run automatic database initialization on startup
  console.log('[Startup] Initializing database...');
  try {
    await initDatabase();
  } catch (err) {
    console.error('[Startup] Database initialization warning:', err);
  }

  // 2. Middlewares
  app.use(corsMiddleware);
  app.use(express.json());

  // 3. Mount Backend REST API
  app.use('/api', apiRoutes);

  // 4. Mount Frontend (Vite middleware in dev, static files in production)
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // 5. Global error handling
  app.use(errorHandler);

  // 6. Listen
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} (dev mode: ${!isProduction})`);
  });
}

startServer().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
