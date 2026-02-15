import express from "express";
import { getDashboardSummary } from "../controllers/adminController.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  approveUser,
} from "../controllers/adminController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here require admin
router.use(authMiddleware, roleMiddleware("admin"));

// GET /api/admin/users -> list all users
router.get("/users", getAllUsers);

// GET /api/admin/users/:id -> get single user
router.get("/users/:id", getUserById);

// PATCH /api/admin/users/:id/role -> update role
router.patch("/users/:id/role", updateUserRole);

// PUT /api/admin/users/:id/approve -> approve user
router.put("/users/:id/approve", approveUser);

// DELETE /api/admin/users/:id -> delete user
router.delete("/users/:id", deleteUser);

router.get("/dashboard-summary", getDashboardSummary);

export default router;
