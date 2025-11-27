import mongoose from "mongoose";
import Recruitment from "../models/Recruitment.js";
import Event from "../models/Event.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// CREATE RECRUITMENT POST (FACULTY / ADMIN)
export const createRecruitment = async (req, res, next) => {
  try {
    const { title, roleType, description, branch, eventId } = req.body || {};

    // 1️⃣ Field validation
    if (!title || !description || !eventId) {
      return sendError(
        res,
        "title, description and eventId are required",
        400,
        {
          title: !title,
          description: !description,
          eventId: !eventId,
        }
      );
    }

    // 2️⃣ ID format validation
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return sendError(res, "Invalid eventId format", 400);
    }

    // 3️⃣ Check if Event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    // 4️⃣ Create recruitment
    const recruitment = await Recruitment.create({
      title,
      roleType,
      description,
      branch,
      event: eventId,
      createdBy: req.user._id, // faculty/admin
    });

    return sendSuccess(
      res,
      "Recruitment created successfully",
      recruitment,
      201
    );
  } catch (error) {
    console.error("Create recruitment error:", error);
    return next(error); // handled by global error handler
  }
};

// GET ALL RECRUITMENTS (PUBLIC: STUDENTS CAN SEE)
export const getRecruitments = async (req, res, next) => {
  try {
    const { status } = req.query; // ?status=all or default open

    const filter = {};
    if (status === "all") {
      // show all (open + closed)
    } else {
      filter.status = "open"; // default: only open
    }

    const recruitments = await Recruitment.find(filter)
      .populate("event", "title date venue")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    if (recruitments.length === 0) {
      return sendSuccess(
        res,
        "No recruitment posts right now",
        [],
        200
      );
    }

    return sendSuccess(
      res,
      "Recruitments fetched successfully",
      recruitments,
      200
    );
  } catch (error) {
    console.error("Get recruitments error:", error);
    return next(error);
  }
};

// GET ONE RECRUITMENT BY ID (PUBLIC)
export const getRecruitmentById = async (req, res, next) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id)
      .populate("event", "title date venue")
      .populate("createdBy", "name role");

    if (!recruitment) {
      return sendError(res, "Recruitment not found", 404);
    }

    return sendSuccess(
      res,
      "Recruitment fetched successfully",
      recruitment,
      200
    );
  } catch (error) {
    console.error("Get recruitment by id error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid recruitment id", 400);
    }

    return next(error);
  }
};

// STUDENT APPLY FOR RECRUITMENT
export const applyForRecruitment = async (req, res, next) => {
  try {
    const { note } = req.body || {};
    const recruitmentId = req.params.id;

    const recruitment = await Recruitment.findById(recruitmentId);

    if (!recruitment) {
      return sendError(res, "Recruitment not found", 404);
    }

    if (recruitment.status !== "open") {
      return sendError(res, "Recruitment is closed", 400);
    }

    // Check if student already applied
    const alreadyApplied = recruitment.applicants.some(
      (app) => app.student.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return sendError(res, "You have already applied", 400);
    }

    recruitment.applicants.push({
      student: req.user._id,
      note,
    });

    await recruitment.save();

    return sendSuccess(
      res,
      "Applied successfully",
      recruitment,
      200
    );
  } catch (error) {
    console.error("Apply for recruitment error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid recruitment id", 400);
    }

    return next(error);
  }
};

// GET APPLICANTS FOR A RECRUITMENT (FACULTY / ADMIN)
export const getApplicantsForRecruitment = async (req, res, next) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id)
      .populate("event", "title")
      .populate("applicants.student", "name email branch");

    if (!recruitment) {
      return sendError(res, "Recruitment not found", 404);
    }

    const responseData = {
      recruitment: {
        id: recruitment._id,
        title: recruitment.title,
        roleType: recruitment.roleType,
        status: recruitment.status,
      },
      applicants: recruitment.applicants,
    };

    return sendSuccess(
      res,
      "Applicants fetched successfully",
      responseData,
      200
    );
  } catch (error) {
    console.error("Get applicants error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid recruitment id", 400);
    }

    return next(error);
  }
};

// UPDATE RECRUITMENT (FACULTY / ADMIN)
export const updateRecruitment = async (req, res, next) => {
  try {
    const recruitment = await Recruitment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!recruitment) {
      return sendError(res, "Recruitment not found", 404);
    }

    return sendSuccess(
      res,
      "Recruitment updated successfully",
      recruitment,
      200
    );
  } catch (error) {
    console.error("Update recruitment error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid recruitment id", 400);
    }

    return next(error);
  }
};

// DELETE RECRUITMENT (ADMIN ONLY)
export const deleteRecruitment = async (req, res, next) => {
  try {
    const recruitment = await Recruitment.findByIdAndDelete(req.params.id);

    if (!recruitment) {
      return sendError(res, "Recruitment not found", 404);
    }

    return sendSuccess(
      res,
      "Recruitment deleted successfully",
      null,
      200
    );
  } catch (error) {
    console.error("Delete recruitment error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid recruitment id", 400);
    }

    return next(error);
  }
};
