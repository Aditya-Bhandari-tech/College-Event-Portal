import mongoose from "mongoose";
import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// STUDENT: CREATE EVENT REQUEST
export const createEventRequest = async (req, res, next) => {
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

    // If branch not provided, use student's branch (if exists)
    const finalBranch = branch || req.user.branch || "all";

    const eventRequest = await EventRequest.create({
      title,
      description,
      date,
      venue,
      branch: finalBranch,
      requestedBy: req.user._id, // student
    });

    return sendSuccess(
      res,
      "Event request submitted successfully",
      eventRequest,
      201
    );
  } catch (error) {
    console.error("Create event request error:", error);
    return next(error);
  }
};


// STUDENT: GET MY EVENT REQUESTS
export const getMyEventRequests = async (req, res, next) => {
  try {
    const requests = await EventRequest.find({
      requestedBy: req.user._id,
    })
      .sort({ createdAt: -1 });

    if (requests.length === 0) {
      return sendSuccess(
        res,
        "You have not submitted any event requests yet",
        [],
        200
      );
    }

    return sendSuccess(
      res,
      "Your event requests fetched successfully",
      requests,
      200
    );
  } catch (error) {
    console.error("Get my event requests error:", error);
    return next(error);
  }
};

// FACULTY/ADMIN: GET ALL EVENT REQUESTS
export const getAllEventRequests = async (req, res, next) => {
  try {
    const { status } = req.query; // ?status=pending/approved/rejected/all

    const filter = {};

    // Filter by status if provided
    if (status && status !== "all") {
      filter.status = status;
    }

    // Branch-based filter: faculty only sees its branch
    if (req.user.role === "faculty") {
      if (req.user.branch) {
        filter.branch = req.user.branch;
      }
    }
    // If admin → no branch filter (can see all)

    const requests = await EventRequest.find(filter)
      .populate("requestedBy", "name email branch")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    if (requests.length === 0) {
      return sendSuccess(
        res,
        "No event requests found",
        [],
        200
      );
    }

    return sendSuccess(
      res,
      "Event requests fetched successfully",
      requests,
      200
    );
  } catch (error) {
    console.error("Get all event requests error:", error);
    return next(error);
  }
};


// FACULTY/ADMIN: GET SINGLE EVENT REQUEST BY ID
export const getEventRequestById = async (req, res, next) => {
  try {
    const request = await EventRequest.findById(req.params.id)
      .populate("requestedBy", "name email branch")
      .populate("reviewedBy", "name role")
      .populate("event", "title date venue");

    if (!request) {
      return sendError(res, "Event request not found", 404);
    }

    return sendSuccess(
      res,
      "Event request fetched successfully",
      request,
      200
    );
  } catch (error) {
    console.error("Get event request by id error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event request id", 400);
    }

    return next(error);
  }
};

// FACULTY/ADMIN: APPROVE EVENT REQUEST (and create Event)
export const approveEventRequest = async (req, res, next) => {
  try {
    const { reviewComment } = req.body || {};
    const requestId = req.params.id;

    const request = await EventRequest.findById(requestId);

    if (!request) {
      return sendError(res, "Event request not found", 404);
    }

    // Branch restriction for faculty
    if (req.user.role === "faculty") {
      if (req.user.branch && request.branch !== req.user.branch) {
        return sendError(
          res,
          "You can only approve requests for your own branch",
          403
        );
      }
    }

    if (request.status === "approved") {
      return sendError(res, "Request is already approved", 400);
    }

    if (request.status === "rejected") {
      return sendError(res, "Request is already rejected", 400);
    }

    // Create actual Event based on this request
    const event = await Event.create({
      title: request.title,
      description: request.description,
      date: request.date,
      venue: request.venue,
      branch: request.branch,        // ✅ keep same branch
      createdBy: req.user._id,       // faculty/admin who approves
    });

    request.status = "approved";
    request.reviewComment = reviewComment || "";
    request.reviewedBy = req.user._id;
    request.event = event._id;

    await request.save();

    const responseData = {
      request,
      createdEvent: event,
    };

    return sendSuccess(
      res,
      "Event request approved and event created",
      responseData,
      200
    );
  } catch (error) {
    console.error("Approve event request error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event request id", 400);
    }

    return next(error);
  }
};


// FACULTY/ADMIN: REJECT EVENT REQUEST
export const rejectEventRequest = async (req, res, next) => {
  try {
    const { reviewComment } = req.body || {};
    const requestId = req.params.id;

    const request = await EventRequest.findById(requestId);

    if (!request) {
      return sendError(res, "Event request not found", 404);
    }

    // Branch restriction for faculty
    if (req.user.role === "faculty") {
      if (req.user.branch && request.branch !== req.user.branch) {
        return sendError(
          res,
          "You can only reject requests for your own branch",
          403
        );
      }
    }

    if (request.status === "approved") {
      return sendError(
        res,
        "Request is already approved, cannot reject now",
        400
      );
    }

    if (request.status === "rejected") {
      return sendError(res, "Request is already rejected", 400);
    }

    request.status = "rejected";
    request.reviewComment = reviewComment || "";
    request.reviewedBy = req.user._id;

    await request.save();

    return sendSuccess(
      res,
      "Event request rejected successfully",
      request,
      200
    );
  } catch (error) {
    console.error("Reject event request error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid event request id", 400);
    }

    return next(error);
  }
};

