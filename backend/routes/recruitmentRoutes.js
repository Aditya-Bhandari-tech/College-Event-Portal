import express from "express";
import {
  createRecruitment,
  getRecruitments,
  getRecruitmentById,
  applyForRecruitment,
  getApplicantsForRecruitment,
  updateRecruitment,
  deleteRecruitment,
} from "../controllers/recruitmentController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC: list & view recruitments
router.get("/", getRecruitments);
router.get("/:id", getRecruitmentById);

// STUDENT: apply for recruitment
router.post(
  "/:id/apply",
  authMiddleware,
  roleMiddleware("student"),
  applyForRecruitment
);

// FACULTY/ADMIN: view applicants
router.get(
  "/:id/applicants",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getApplicantsForRecruitment
);

// FACULTY/ADMIN: create/update
router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  createRecruitment
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  updateRecruitment
);

// ADMIN: delete
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteRecruitment
);

export default router;
