import express from "express";

const router = express.Router();

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateUserRole,
  updateNoShowCount,
  updatePenaltyStatus,
  getAllUsers,
} from "../controllers/UserController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Admin-only role update
router.patch("/role/:id", authMiddleware, adminMiddleware, updateUserRole);

// Admin-only no-show / penalty updates
router.patch("/no-show/:id", authMiddleware, adminMiddleware, updateNoShowCount);
router.patch("/penalty/:id", authMiddleware, adminMiddleware, updatePenaltyStatus);

// Get all users
router.get("/all", getAllUsers);

export default router;