import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount feedback API routes at /api
app.use('/api', apiRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
