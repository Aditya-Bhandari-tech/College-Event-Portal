import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);

// PROTECTED: only faculty/admin can manage announcements
router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  createAnnouncement
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  updateAnnouncement
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAnnouncement
);

export default router;
