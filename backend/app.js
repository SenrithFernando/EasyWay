import express from "express";
import cors from "cors";

import userRoutes from "./routes/UserRoute.js";
import reservationRoutes from "./routes/ReservationRoute.js";
import blogRoutes from "./routes/BlogRoute.js";
import canteenRoutes from "./routes/CanteenRoute.js";

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
app.use("/api/blogs", blogRoutes);
app.use("/api/canteen", canteenRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;