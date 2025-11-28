import express from "express";
import {
  createEventRequest,
  getMyEventRequests,
  getAllEventRequests,
  getEventRequestById,
  approveEventRequest,
  rejectEventRequest,
} from "../controllers/eventRequestController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

import { validateObjectId } from "../utils/validateObjectId.js";

const router = express.Router();

// STUDENT: create event request
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  createEventRequest
);

// STUDENT: view own requests
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyEventRequests
);

// FACULTY/ADMIN: view all requests
router.get(
  "/",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getAllEventRequests
);

// FACULTY/ADMIN: view single request
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  validateObjectId("id"),
  getEventRequestById
);

// FACULTY/ADMIN: approve request
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  validateObjectId("id"),
  approveEventRequest
);

// FACULTY/ADMIN: reject request
router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  validateObjectId("id"),
  rejectEventRequest
);

export default router;
