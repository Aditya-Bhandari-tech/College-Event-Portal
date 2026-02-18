// routes/userRoutes.js
import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { getMe, getStudentsByBranch, uploadProfilePic, deleteProfilePic } from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get("/me", authMiddleware, getMe);

/**
 * @route   GET /api/users/students
 * @desc    Get students (Faculty restricted to their branch)
 * @access  Private (faculty, admin)
 */
router.get(
  "/students",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getStudentsByBranch
);

/**
 * @route   PUT /api/users/profile-pic
 * @desc    Upload or update profile picture
 * @access  Private
 */
router.put(
  "/profile-pic",
  authMiddleware,
  upload.single("image"),
  uploadProfilePic
);

/**
 * @route   DELETE /api/users/profile-pic
 * @desc    Delete profile picture
 * @access  Private
 */
router.delete(
  "/profile-pic",
  authMiddleware,
  deleteProfilePic
);

export default router;
