import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
dotenv.config();
const app = express();
// Allowed origins
const allowedOrigins = [
    "http://localhost:3000", // local frontend
];
// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (e.g., Postman)
        if (!origin)
            return callback(null, true);
        // Allow all Vercel deployments
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/analysis", analysisRoutes);
// app.use("/api/recommendations", recommendationRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
