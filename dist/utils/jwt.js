import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // Set a proper secret in .env
const EXPIRES_IN = "1d"; // Token expiry
export const generateToken = (userId) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: EXPIRES_IN });
};
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};
