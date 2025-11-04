import { Router } from "express";
import { upload } from "../config/upload.js";
import { uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST /api/upload - Upload image (protected route)
router.post("/", protect, upload.single("image"), uploadImage);

export default router;
