import express from "express";

const router = express.Router();

import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  addRating,
  getVendorsByCategory,
  getVendorStats,
  getVendorMenu,
  addMenuItem,
} from "../controllers/CanteenController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

// Public routes
router.get("/", getAllVendors);
router.get("/stats", getVendorStats);
router.get("/category/:category", getVendorsByCategory);
router.get("/:id", getVendorById);
router.get("/:id/menu", getVendorMenu);

// Protected routes
router.post("/", authMiddleware, createVendor);
router.put("/:id", authMiddleware, updateVendor);
router.delete("/:id", authMiddleware, deleteVendor);
router.post("/:id/rating", authMiddleware, addRating);
router.post("/:id/menu", authMiddleware, addMenuItem);

export default router;
