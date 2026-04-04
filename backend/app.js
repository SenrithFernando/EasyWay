
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from "./routes/UserRoute.js";
import reservationRoutes from "./routes/ReservationRoute.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount feedback API routes at /api
app.use('/api', apiRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
