import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { initDatabase } from './database/initDatabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsMiddleware);
app.use(express.json());

// API health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Personal Consistency Tracker API' });
});

// Mount /api endpoints
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  initDatabase().catch(err => {
    console.warn('[Backend] Database initialization warning:', err.message);
  });
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
