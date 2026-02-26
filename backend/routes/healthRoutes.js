import express from "express";

const router = express.Router();

// @desc    Health check
// @route   GET /api/health
// @access  Public
router.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
