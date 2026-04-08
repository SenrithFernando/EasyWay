import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/UserRoute.js';
import reservationRoutes from './routes/ReservationRoute.js';
import menuItemsRouter from './routes/menuItemsRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import blogRoutes from "./routes/BlogRoute.js";
import canteenRoutes from "./routes/CanteenRoute.js";

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/menu-items', menuItemsRouter);
app.use('/api/orders', orderRouter);
app.use('/api/chat', chatRouter);
app.use("/api/blogs", blogRoutes);
app.use("/api/canteen", canteenRoutes);

// Mount feedback API routes at /api
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
