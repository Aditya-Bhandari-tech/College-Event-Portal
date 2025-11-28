// controllers/announcementController.js
import Announcement from "../models/Announcement.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// CREATE ANNOUNCEMENT (FACULTY / ADMIN)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, branch } = req.body || {};

    if (!title || !message) {
      return sendError(
        res,
        "Title and message are required",
        400,
        {
          title: !title,
          message: !message,
        }
      );
    }

    const announcement = await Announcement.create({
      title,
      message,
      branch, // if undefined, model default "all" will be used
      createdBy: req.user._id,
    });

    return sendSuccess(
      res,
      "Announcement created successfully",
      announcement,
      201
    );
  } catch (error) {
    console.error("Create announcement error:", error);
    return next(error);
  }
};

// GET ALL ANNOUNCEMENTS (PUBLIC)
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role");

    if (announcements.length === 0) {
      return sendSuccess(
        res,
        "No announcements right now",
        [],
        200
      );
    }

    return sendSuccess(
      res,
      "Announcements fetched successfully",
      announcements,
      200
    );
  } catch (error) {
    console.error("Get announcements error:", error);
    return next(error);
  }
};

// GET SINGLE ANNOUNCEMENT BY ID (PUBLIC)
export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "createdBy",
      "name role"
    );

    if (!announcement) {
      return sendError(res, "Announcement not found", 404);
    }

    return sendSuccess(
      res,
      "Announcement fetched successfully",
      announcement,
      200
    );
  } catch (error) {
    console.error("Get announcement by id error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid announcement id", 400);
    }

    return next(error);
  }
};

// UPDATE ANNOUNCEMENT (FACULTY / ADMIN)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!announcement) {
      return sendError(res, "Announcement not found", 404);
    }

    return sendSuccess(
      res,
      "Announcement updated successfully",
      announcement,
      200
    );
  } catch (error) {
    console.error("Update announcement error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid announcement id", 400);
    }

    return next(error);
  }
};

// DELETE ANNOUNCEMENT (ADMIN ONLY)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return sendError(res, "Announcement not found", 404);
    }

    return sendSuccess(
      res,
      "Announcement deleted successfully",
      null,
      200
    );
  } catch (error) {
    console.error("Delete announcement error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid announcement id", 400);
    }

    return next(error);
  }
};
