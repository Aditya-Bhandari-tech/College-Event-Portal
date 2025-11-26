// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 🔐 authMiddleware
 * Checks if JWT token is provided and valid.
 * If yes, attaches user to req.user
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Header should be like: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1]; // get <token> part

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id: user._id, role: user.role, iat, exp }
    const user = await User.findById(decoded.id).select("-password"); // remove password

    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    // Attach user to request object
    req.user = user;

    next(); // move to next middleware / controller
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



/**
 * 🧾 roleMiddleware
 * Allows only users with certain roles to access the route.
 * Usage: roleMiddleware("admin"), roleMiddleware("faculty", "admin")
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware must have run before this
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};


