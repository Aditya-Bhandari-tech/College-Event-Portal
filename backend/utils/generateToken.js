// utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  // user = Mongoose document

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET, // secret key from .env
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export default generateToken;
