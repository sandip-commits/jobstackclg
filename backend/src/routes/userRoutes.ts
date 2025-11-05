import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// Auth routes (before :id routes to avoid conflicts)
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/verify", userController.verifyToken); // Token verification endpoint

// User CRUD routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
