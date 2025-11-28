// controllers/adminController.js
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

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
