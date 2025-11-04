import { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Cloudinary automatically provides the URL in req.file.path
    const fileUrl = (req.file as any).path; // Cloudinary URL
    const filename = (req.file as any).filename || req.file.originalname;

    res.status(200).json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
