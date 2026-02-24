// controllers/eventController.js
import Event from "../models/Event.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import cloudinary from "../config/cloudinary.js";
import { isValidObjectId } from "../utils/validateObjectId.js";

// CREATE EVENT (FACULTY / ADMIN)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue, branch } = req.body || {};

    if (!title || !description || !date || !venue) {
      return sendError(
        res,
        "title, description, date and venue are required",
        400,
        {
          title: !title,
          description: !description,
          date: !date,
          venue: !venue,
        }
      );
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      branch,
      createdBy: req.user._id, // from authMiddleware
    });

    return sendSuccess(res, "Event created successfully", event, 201);
  } catch (error) {
    console.error("Create Event Error:", error);
    return next(error);
  }
};

// GET ALL EVENTS (PUBLIC)
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("registrations", "name email branch year phone")
      .sort({ date: 1 });

    if (events.length === 0) {
      return sendSuccess(res, "No events right now", [], 200);
    }

    return sendSuccess(res, "Events fetched successfully", events, 200);
  } catch (error) {
    console.error("Get Events Error:", error);
    return next(error);
  }
};

// GET EVENT BY ID (PUBLIC)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    return sendSuccess(res, "Event fetched successfully", event, 200);
  } catch (error) {
    console.error("Get Event By Id Error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event id", 400);
    }

    return next(error);
  }
};

// UPDATE EVENT (FACULTY / ADMIN)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    return sendSuccess(
      res,
      "Event updated successfully",
      event,
      200
    );
  } catch (error) {
    console.error("Update Event Error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event id", 400);
    }

    return next(error);
  }
};

// DELETE EVENT (ADMIN OR FACULTY OWNER)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Check if user is admin OR the creator of the event
    if (
      req.user.role !== "admin" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, "You are not authorized to delete this event", 403);
    }

    await event.deleteOne();

    return sendSuccess(res, "Event deleted successfully", null, 200);
  } catch (error) {
    console.error("Delete Event Error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event id", 400);
    }

    return next(error);
  }
};
export const uploadEventGallery = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validate files uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }
    // Ownership validation (faculty restriction)
    if (
      req.user.role === "faculty" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this event",
      });
    }

    // Limit total gallery size
    if (event.images.length + req.files.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Gallery image limit exceeded (max 30)",
      });
    }

    const images = req.files.map(file => ({
      public_id: file.filename,
      url: file.path,
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image"
    }));

    event.images.push(...images);
    await event.save();

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: event.images,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { eventId, publicId } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ownership validation
    if (
      req.user.role === "faculty" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from DB
    event.images = event.images.filter(
      img => img.public_id !== publicId
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: event.images,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REGISTER FOR EVENT (STUDENT)
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return sendError(res, "Cannot register for past events", 400);
    }

    // Check if already registered
    if (event.registrations.includes(req.user._id)) {
      return sendError(res, "You are already registered for this event", 400);
    }

    event.registrations.push(req.user._id);
    await event.save();

    return sendSuccess(res, "Registered successfully", event, 200);
  } catch (error) {
    console.error("Register For Event Error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event id", 400);
    }

    return next(error);
  }
};

