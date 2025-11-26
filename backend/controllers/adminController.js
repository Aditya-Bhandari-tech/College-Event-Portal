// controllers/adminController.js
import User from "../models/User.js";

/** GET ALL USERS (ADMIN ONLY) */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET SINGLE USER BY ID (ADMIN ONLY) */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** UPDATE USER ROLE (ADMIN ONLY) */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // only allow valid roles
    const allowedRoles = ["student", "faculty", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE USER (ADMIN ONLY, OPTIONAL) */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found"
       });
    }

    res.status(200).json({
      message: "User deleted successfully",
      
        "name": user.name
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
