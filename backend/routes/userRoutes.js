// routes/userRoutes.js
import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { getMe, getStudentsByBranch } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/me -> return logged-in user info
router.get("/me", authMiddleware, getMe);

// GET /api/users/students -> return students (Faculty restricted to their branch)
router.get(
  "/students",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getStudentsByBranch
);

export default router;
