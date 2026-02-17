// middleware/galleryUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `college-portal/events/${req.params.id}`,
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const galleryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
});

export default galleryUpload;
