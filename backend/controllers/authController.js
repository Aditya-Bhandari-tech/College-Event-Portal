// controllers/authController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return JWT token
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, branch, role, year } = req.body;

    // Normalize role
    const normalizedRole = role ? role.toLowerCase().trim() : "student";

    // 1️⃣ Required fields check (Note: role is already checked/defaulted above but good to keep structure)
    if (!name || !email || !password || !branch) {
      return res.status(400).json({
        message: "Name, email, password, and branch are required",
      });
    }

    // students must provide a year
    if (normalizedRole === "student" && !year) {
      return res.status(400).json({
        message: "Year is required for student accounts",
      });
    }

    // Validate role
    if (!["student", "faculty"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // 3️⃣ Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      branch,
      role: normalizedRole,
      year: normalizedRole === "student" ? year : undefined,
    });

    // 4️⃣ Handle Response based on Role
    if (normalizedRole === "faculty") {
      // Faculty: No token, pending approval
      res.status(201).json({
        message: "Registration successful! Please wait for admin approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          branch: user.branch,
          year: user.year,
          isApproved: user.isApproved,
        },
      });
    } else {
      // Student: Auto-login with token
      const token = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          branch: user.branch,
          year: user.year,
          isApproved: user.isApproved,
        },
        token,
      });
    }

  } catch (error) {
    console.error("Register error:", error);

    // ✅ Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: messages.join(", "),
      });
    }

    // ✅ Duplicate key error (safety net)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // ❌ Genuine server error
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};




/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if email & password provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // 2️⃣ Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 🔒 Check isApproved
    if (!user.isApproved) {
      return res.status(403).json({
        message: "Account pending approval",
      });
    }

    // 3️⃣ Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Generate token
    const token = generateToken(user);

    // 5️⃣ Return user data + token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        branch: user.branch,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};
