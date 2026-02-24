import express from "express";
import {
    uploadGeneralMedia,
    getGeneralMedia,
    deleteGeneralMedia,
} from "../controllers/galleryController.js";
import {
    authMiddleware,
    roleMiddleware,
} from "../middleware/authMiddleware.js";
import galleryUpload from "../middleware/galleryUpload.js";

const router = express.Router();

// Get all general media - Public
router.get("/", getGeneralMedia);

// Upload general media - Faculty/Admin
router.post(
    "/upload",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    galleryUpload.array("images", 10),
    uploadGeneralMedia
);

// Delete general media - Faculty/Admin/Uploader
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    deleteGeneralMedia
);

export default router;
