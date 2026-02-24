import Gallery from "../models/Gallery.js";
import cloudinary from "../config/cloudinary.js";

// Upload general media (not linked to an event)
export const uploadGeneralMedia = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const mediaItems = req.files.map((file) => ({
            public_id: file.filename,
            url: file.path,
            resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
            uploadedBy: req.user._id,
        }));

        const savedItems = await Gallery.insertMany(mediaItems);

        res.status(201).json({
            success: true,
            message: "Media uploaded to general gallery successfully",
            data: savedItems,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all general media
export const getGeneralMedia = async (req, res) => {
    try {
        const media = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: media,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete specific general media
export const deleteGeneralMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Gallery.findById(id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Media item not found",
            });
        }

        // Check authorization (only uploader or admin)
        if (
            media.uploadedBy.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this media",
            });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(media.public_id, {
            resource_type: media.resource_type,
        });

        // Delete from DB
        await Gallery.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Media deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
