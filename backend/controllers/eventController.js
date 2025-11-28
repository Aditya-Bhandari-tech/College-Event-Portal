// controllers/eventController.js
import Event from "../models/Event.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

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
    const events = await Event.find().sort({ date: 1 });

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

// DELETE EVENT (ADMIN ONLY)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    return sendSuccess(
      res,
      "Event deleted successfully",
      null,
      200
    );
  } catch (error) {
    console.error("Delete Event Error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event id", 400);
    }

    return next(error);
  }
};
