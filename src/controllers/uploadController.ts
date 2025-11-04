import { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Construct the URL for the uploaded file using environment variable
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${backendUrl}/uploads/resume_photos/${req.file.filename}`;

    res.status(200).json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
