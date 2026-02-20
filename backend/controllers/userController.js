// controllers/userController.js
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

// GET /api/users/me
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    return sendSuccess(res, "User profile fetched successfully", req.user, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/students (Faculty/Admin)
export const getStudentsByBranch = async (req, res, next) => {
  try {
    const { branch } = req.user;

    // If admin, maybe allow query param? But for now strictly follow "of that branch only" for Faculty.
    // If admin calls this, they have a branch too? Or undefined?
    // Let's assume this is primarily for Faculty.
    // If Admin uses it, they might want all students or filter by query.
    // The requirement says "Faculty Work list: Display student list of that branch only".

    let query = { role: "student" };

    if (req.user.role === "faculty") {
      if (!branch) {
        return sendError(res, "Faculty branch not found", 400);
      }
      query.branch = branch;
    }

    const students = await User.find(query)
      .select("-password")
      .sort({ name: 1 });

    if (students.length === 0) {
      return sendSuccess(res, "No students found in your branch", [], 200);
    }

    return sendSuccess(res, "Students fetched successfully", students, 200);

  } catch (error) {
    console.error("Get students error:", error);
    next(error);
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePic?.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }
    user.profilePic = {
      public_id: req.file.filename,
      url: req.file.path,
    };

    await user.save();

    res.json({
      success: true,
      message: "Profile picture uploaded",
      data: user.profilePic,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        return sendError(res, "Please provide both new password and confirm password", 400);
      }
      if (newPassword !== confirmPassword) {
        return sendError(res, "Passwords do not match", 400);
      }
      if (newPassword.length < 6) {
        return sendError(res, "Password must be at least 6 characters", 400);
      }
      user.password = newPassword; // pre-save hook will hash it
    }

    await user.save();

    return sendSuccess(res, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      profilePic: user.profilePic,
    }, 200);

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.profilePic?.public_id) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to delete",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profilePic.public_id);

    // Remove from database
    user.profilePic = { public_id: null, url: null };
    await user.save();

    res.json({
      success: true,
      message: "Profile picture deleted successfully",
      data: user.profilePic,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};