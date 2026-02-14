import express from "express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const router = express.Router();

// Load CommonJS controller correctly
const {
  googleAuth,
  checkGoogleUser,
} = require("../controllers/googleAuthController.cjs");

// Check if user exists
router.post("/google/check", checkGoogleUser);

// Google authentication (login/signup)
router.post("/google", googleAuth);

export default router;