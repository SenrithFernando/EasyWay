import express from 'express';
import cors from 'cors';
import menuItemsRouter from './routes/menuItemsRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API Routes
app.use('/api/menu-items', menuItemsRouter);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
