// routes/eventRoutes.js
import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getEvents);
router.get("/:id", getEventById);

// PROTECTED ROUTES
router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteEvent
);

export default router;
