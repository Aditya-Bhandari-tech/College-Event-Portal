// controllers/userController.js
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

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
