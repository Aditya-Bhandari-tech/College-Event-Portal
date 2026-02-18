// controllers/userController.js
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import cloudinary from "../config/cloudinary.js";

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