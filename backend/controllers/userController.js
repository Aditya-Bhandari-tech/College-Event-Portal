// controllers/userController.js

import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

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
