import express from "express";
import * as menuItemsController from "../controllers/menuItemsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { vendorMiddleware } from "../middleware/vendorMiddleware.js";

const router = express.Router();

// GET routes - accessible to authenticated users (students can view)
router.get("/", menuItemsController.getAllMenuItems);
router.get("/:id", menuItemsController.getMenuItemById);

// POST route - only vendors can create
router.post(
  "/",
  authMiddleware,
  vendorMiddleware,
  menuItemsController.createMenuItem,
);

// PATCH route - only vendors can update
router.patch(
  "/:id",
  authMiddleware,
  vendorMiddleware,
  menuItemsController.updateMenuItem,
);

// DELETE route - only vendors can delete
router.delete(
  "/:id",
  authMiddleware,
  vendorMiddleware,
  menuItemsController.deleteMenuItem,
);

export default router;
