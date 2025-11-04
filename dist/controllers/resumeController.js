import * as resumeService from "../services/resumeService.js";
// Create Resume (use logged-in userId)
export const createResume = async (req, res) => {
    console.log("[backend] createResume: Request received", {
        userId: req.userId,
        bodyKeys: Object.keys(req.body || {}),
        hasWorkExperiences: !!req.body.workExperiences,
        workExperiencesCount: req.body.workExperiences?.length || 0,
        hasEducations: !!req.body.educations,
        educationsCount: req.body.educations?.length || 0,
        hasSkills: Array.isArray(req.body.skills),
        skillsCount: req.body.skills?.length || 0,
        hasPhotoUrl: !!req.body.photoUrl,
    });
    try {
        const resumeData = {
            ...req.body,
            userId: req.userId, // get userId from JWT
        };
        console.log("[backend] createResume: Calling service with data:", {
            userId: resumeData.userId,
            title: resumeData.title,
            firstName: resumeData.firstName,
            lastName: resumeData.lastName,
            skills: resumeData.skills,
            workExperiencesCount: resumeData.workExperiences?.length || 0,
            educationsCount: resumeData.educations?.length || 0,
        });
        const resume = await resumeService.createResume(resumeData);
        console.log("[backend] createResume: Resume created successfully:", {
            id: resume.id,
            userId: resume.userId,
        });
        res.status(201).json(resume);
    }
    catch (error) {
        console.error("[backend] createResume: Error occurred:", {
            message: error?.message,
            name: error?.name,
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack,
        });
        // Provide more detailed error message
        const errorMessage = error?.message || "Error creating resume";
        res.status(500).json({
            message: errorMessage,
            error: error?.toString() || "Unknown error"
        });
    }
};
// Get all resumes for logged-in user
export const getResumes = async (req, res) => {
    try {
        const resumes = await resumeService.getResumesByUser(req.userId);
        res.json(resumes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching resumes" });
    }
};
// Get resume by ID (only owner can access)
export const getResumeById = async (req, res) => {
    try {
        const id = req.params.id;
        const resume = await resumeService.getResumeById(id, req.userId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        res.json(resume);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching resume" });
    }
};
// Update resume (only owner can update)
export const updateResume = async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await resumeService.updateResume(id, req.userId, req.body);
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Resume not found or access denied") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error updating resume" });
    }
};
// Delete resume (only owner can delete)
export const deleteResume = async (req, res) => {
    try {
        const id = req.params.id;
        await resumeService.deleteResume(id, req.userId);
        res.json({ message: "Resume deleted successfully" });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Resume not found or access denied") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error deleting resume" });
    }
};
