// routes/eventRoutes.js
import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventGallery,
  deleteGalleryImage,
  registerForEvent
} from "../controllers/eventController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

import galleryUpload from "../middleware/galleryUpload.js";

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
  roleMiddleware("admin", "faculty"),
  deleteEvent
);

router.post(
  "/:id/gallery",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  galleryUpload.array("images", 10),
  uploadEventGallery
);

router.delete(
  "/:eventId/gallery/:publicId",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  deleteGalleryImage
);

router.post(
  "/:id/register",
  authMiddleware,
  roleMiddleware("student"),
  registerForEvent
);

export default router;
