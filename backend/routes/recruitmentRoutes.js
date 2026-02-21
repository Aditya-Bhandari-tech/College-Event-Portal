import express from "express";
import {
  createRecruitment,
  getRecruitments,
  getRecruitmentById,
  applyForRecruitment,
  getApplicantsForRecruitment,
  updateRecruitment,
  deleteRecruitment,
  updateApplicantStatus,
  getMyApplications,
} from "../controllers/recruitmentController.js";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// STUDENT: get my applications (must be before /:id)
router.get(
  "/my-applications",
  authMiddleware,
  roleMiddleware("student"),
  getMyApplications
);

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

// FACULTY/ADMIN: update applicant status
router.patch(
  "/:id/applicants/:applicantId",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  updateApplicantStatus
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
  roleMiddleware("admin", "faculty"),
  deleteRecruitment
);

export default router;
