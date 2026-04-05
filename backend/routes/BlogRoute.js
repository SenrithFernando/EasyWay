import express from "express";

const router = express.Router();

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getBlogsByCategory,
  getFeaturedBlogs,
} from "../controllers/BlogController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

// Public routes
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", authMiddleware, createBlog);
router.put("/:id", authMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);
router.post("/:id/like", authMiddleware, likeBlog);
router.post("/:id/comment", authMiddleware, addComment);

export default router;
