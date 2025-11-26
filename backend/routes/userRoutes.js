// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users/me -> return logged-in user info
router.get("/me", authMiddleware, (req, res) => {
  // req.user is set by authMiddleware
  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user,
  });
});

export default router;
