import express from "express";
import * as resumeController from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.post("/", protect, resumeController.createResume);
router.get("/", protect, resumeController.getResumes); // Get all resumes for logged-in user
router.get("/:id", protect, resumeController.getResumeById);
router.put("/:id", protect, resumeController.updateResume);
router.delete("/:id", protect, resumeController.deleteResume);

export default router;
