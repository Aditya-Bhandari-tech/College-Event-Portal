// middleware/galleryUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: req.params.id ? `college-portal/events/${req.params.id}` : `college-portal/general`,
    resource_type: "auto", // Automatically detect if it's an image or video
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "avi", "mkv"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const galleryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per uplaod
});

export default galleryUpload;
