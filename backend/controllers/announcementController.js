import Announcement from "../models/Announcement.js";

/** CREATE ANNOUNCEMENT */
export const createAnnouncement = async (req, res) => {
  try {
    // ✅ Safe destructuring: if req.body is undefined, use {}
    const { title, message, branch } = req.body || {};

    // ✅ Validation
    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      branch, // if undefined, model default "all" will be used
      createdBy: req.user._id, // from authMiddleware
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET ALL ANNOUNCEMENTS */
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role"); // optional info about creator

    if (announcements.length === 0) {
      return res.status(200).json({
        message: "No announcements right now"
        
      });
    }

    res.status(200).json({
      message: "Announcements fetched successfully",
      announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET SINGLE ANNOUNCEMENT */
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "createdBy",
      "name role"
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      message: "Announcement fetched successfully",
      announcement,
    });
  } catch (error) {
    console.error("Get announcement by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** UPDATE ANNOUNCEMENT */
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE ANNOUNCEMENT */
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
