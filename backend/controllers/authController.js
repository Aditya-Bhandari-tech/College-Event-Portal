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
    const { name, email, password, role, phone, branch } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // 3️⃣ Create new user
    // ⚠️ Password is plain here, but our User model's pre-save hook will hash it
    const user = await User.create({
      name,
      email,
      password,
      role,   // optional, default = "student" if not sent
      phone,
      branch,
    });

    // 4️⃣ Generate JWT token
    const token = generateToken(user);

    // 5️⃣ Send response (never send password back)
    res.status(201).json({
      message: "User registered successfully",
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
    console.error("Register error:", error);
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
