// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadProfilePic } from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get("/me", authMiddleware, (req, res) => {
  const user = req.user.toObject();

  // Extra safety layer (even though password is excluded in middleware)
  delete user.password;

  res.status(200).json({
    success: true,
    data: user,
  });
});

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

export default router;
