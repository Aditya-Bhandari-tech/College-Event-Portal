// controllers/adminController.js
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import Event from "../models/Event.js";
import EventRequest from "../models/EventRequest.js";
import Recruitment from "../models/Recruitment.js";
import Announcement from "../models/Announcement.js";

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      return sendSuccess(
        res,
        "No users found",
        [],
        200
      );
    }

    return sendSuccess(
      res,
      "Users fetched successfully",
      users,
      200
    );
  } catch (error) {
    console.error("Get all users error:", error);
    return next(error);
  }
};

// GET SINGLE USER BY ID (ADMIN ONLY)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(
      res,
      "User fetched successfully",
      user,
      200
    );
  } catch (error) {
    console.error("Get user by id error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid user id", 400);
    }

    return next(error);
  }
};

// UPDATE USER ROLE (ADMIN ONLY)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body || {};
    const allowedRoles = ["student", "faculty", "admin"];

    if (!role) {
      return sendError(res, "Role is required", 400, { role: true });
    }

    if (!allowedRoles.includes(role)) {
      return sendError(res, "Invalid role value", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(
      res,
      "User role updated successfully",
      user,
      200
    );
  } catch (error) {
    console.error("Update user role error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid user id", 400);
    }

    return next(error);
  }
};

// APPROVE USER (ADMIN ONLY)
export const approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(
      res,
      "User approved successfully",
      user,
      200
    );
  } catch (error) {
    console.error("Approve user error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid user id", 400);
    }

    return next(error);
  }
};

// DELETE USER (ADMIN ONLY)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(
      res,
      "User deleted successfully",
      null,
      200
    );
  } catch (error) {
    console.error("Delete user error:", error);

    if (error.name === "CastError") {
      return sendError(res, "Invalid user id", 400);
    }

    return next(error);
  }
};
// GET DASHBOARD SUMMARY (ADMIN ONLY)
export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      pendingFaculty,
      pendingRequests,
      openRecruitments,
      totalAnnouncements,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      User.countDocuments({ role: "faculty", isApproved: false }),
      EventRequest.countDocuments({ status: "pending" }),
      Recruitment.countDocuments({ status: "open" }),
      Announcement.countDocuments(),
    ]);

    return sendSuccess(
      res,
      "Dashboard summary fetched successfully",
      {
        totalUsers,
        totalEvents,
        pendingFaculty,
        pendingRequests,
        openRecruitments,
        totalAnnouncements,
      },
      200
    );
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return next(error);
  }
};
