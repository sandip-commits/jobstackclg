import * as userService from "../services/userService.js";
import { generateToken } from "../utils/jwt.js";
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        // Generate token for auto-login
        const token = generateToken(user.id);
        // Return in format expected by frontend
        res.status(201).json({
            token,
            user: {
                id: user.id.toString(), // Convert to string for consistency
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        console.error(err);
        // Handle duplicate email error
        if (err.code === "P2002" && err.meta?.target?.includes("email")) {
            return res.status(409).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: err.message || "Error creating user" });
    }
};
export const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId) || !req.params.id) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user" });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching users" });
    }
};
export const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId) || !req.params.id) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await userService.updateUser(userId, req.body);
        res.status(200).json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user" });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId) || !req.params.id) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        await userService.deleteUser(userId);
        res.status(200).json({ message: "User deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting user" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.loginUser(email, password);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user.id);
        // Return in format expected by frontend
        res.status(200).json({
            token,
            user: {
                id: user.id.toString(), // Convert to string for consistency
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Error logging in" });
    }
};
export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const { verifyToken: verifyJwtToken } = await import("../utils/jwt.js");
        const decoded = verifyJwtToken(token);
        // Validate decoded userId
        if (!decoded.userId || isNaN(decoded.userId)) {
            console.error("[verifyToken] Invalid userId in token:", decoded);
            return res.status(401).json({ message: "Invalid token payload" });
        }
        // Get user to return user info
        const user = await userService.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        res.status(200).json({
            userId: decoded.userId.toString(),
            id: decoded.userId.toString(), // Support both formats
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        console.error("[verifyToken] Error:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
