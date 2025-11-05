import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ResumeInput {
  userId: number;
  title?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  colorHex?: string;
  borderStyle?: string;
  summary?: string;
  skills?: string[];
  workExperiences?: {
    position?: string;
    company?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    description?: string;
  }[];
  educations?: {
    degree?: string;
    school?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }[];
  projects?: {
    name?: string;
    description?: string;
    url?: string;
    technologies?: string[];
    startDate?: Date | string;
    endDate?: Date | string;
  }[];
}

export const createResume = async (data: ResumeInput) => {
  console.log("[backend] resumeService.createResume: Starting", {
    userId: data.userId,
    hasSkills: Array.isArray(data.skills),
    skillsLength: data.skills?.length || 0,
    skillsValue: data.skills,
    workExperiencesCount: data.workExperiences?.length || 0,
    educationsCount: data.educations?.length || 0,
    projectsCount: data.projects?.length || 0,
  });

  const { workExperiences, educations, projects, ...resumeData } = data;
  
  // Ensure we're not passing fullName to Prisma (it doesn't exist in schema)
  // Remove it explicitly if it somehow got through
  delete (resumeData as any).fullName;

  // Ensure skills is an array
  if (!Array.isArray(resumeData.skills)) {
    console.warn("[backend] resumeService.createResume: skills is not an array, defaulting to []", {
      skillsType: typeof resumeData.skills,
      skillsValue: resumeData.skills,
    });
    resumeData.skills = [];
  }

  console.log("[backend] resumeService.createResume: Prepared data for Prisma:", {
    userId: resumeData.userId,
    skills: resumeData.skills,
    skillsLength: resumeData.skills.length,
    workExperiencesCount: workExperiences?.length || 0,
    educationsCount: educations?.length || 0,
    projectsCount: projects?.length || 0,
  });

  try {
    const result = await prisma.resume.create({
      data: {
        ...resumeData,
        workExperiences: workExperiences
          ? {
              create: workExperiences.map((exp) => ({
                position: exp.position,
                company: exp.company,
                startDate: exp.startDate ? new Date(exp.startDate) : undefined,
                endDate: exp.endDate ? new Date(exp.endDate) : undefined,
                description: exp.description,
              })),
            }
          : undefined,
        educations: educations
          ? {
              create: educations.map((edu) => ({
                degree: edu.degree,
                school: edu.school,
                startDate: edu.startDate ? new Date(edu.startDate) : undefined,
                endDate: edu.endDate ? new Date(edu.endDate) : undefined,
              })),
            }
          : undefined,
        projects: projects
          ? {
              create: projects.map((proj) => ({
                name: proj.name,
                description: proj.description,
                url: proj.url,
                technologies: proj.technologies || [],
                startDate: proj.startDate ? new Date(proj.startDate) : undefined,
                endDate: proj.endDate ? new Date(proj.endDate) : undefined,
              })),
            }
          : undefined,
      },
      include: {
        workExperiences: true,
        educations: true,
        projects: true,
      },
    });

    console.log("[backend] resumeService.createResume: Success!", {
      id: result.id,
      userId: result.userId,
    });

    return result;
  } catch (error: any) {
    console.error("[backend] resumeService.createResume: Prisma error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      name: error?.name,
      stack: error?.stack,
      // Log Prisma-specific error details
      cause: error?.cause,
      clientVersion: error?.clientVersion,
    });
    
    // Provide more detailed error message
    let detailedMessage = error?.message || "Database error";
    if (error?.code) {
      detailedMessage = `[${error.code}] ${detailedMessage}`;
    }
    if (error?.meta) {
      detailedMessage += ` - ${JSON.stringify(error.meta)}`;
    }
    
    const enhancedError = new Error(detailedMessage);
    (enhancedError as any).code = error?.code;
    (enhancedError as any).meta = error?.meta;
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

export const getResumesByUser = async (userId: number) => {
  return await prisma.resume.findMany({
    where: { userId },
    include: {
      workExperiences: true,
      educations: true,
      projects: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getResumeById = async (id: string, userId?: number) => {
  return await prisma.resume.findFirst({
    where: {
      id,
      ...(userId && { userId }),
    },
    include: {
      workExperiences: true,
      educations: true,
      projects: true,
    },
  });
};

export const updateResume = async (
  id: string,
  userId: number,
  data: Partial<ResumeInput>,
) => {
  const { workExperiences, educations, projects, ...resumeData } = data;

  // First verify the resume belongs to the user
  const existingResume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!existingResume) {
    throw new Error("Resume not found or access denied");
  }

  // Ensure skills is an array if provided
  if (resumeData.skills !== undefined && !Array.isArray(resumeData.skills)) {
    resumeData.skills = [];
  }

  return await prisma.resume.update({
    where: { id },
    data: {
      ...resumeData,
      workExperiences: workExperiences
        ? {
            deleteMany: {}, // Delete existing work experiences
            create: workExperiences.map((exp) => ({
              position: exp.position,
              company: exp.company,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
              description: exp.description,
            })),
          }
        : undefined,
      educations: educations
        ? {
            deleteMany: {}, // Delete existing educations
            create: educations.map((edu) => ({
              degree: edu.degree,
              school: edu.school,
              startDate: edu.startDate ? new Date(edu.startDate) : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            })),
          }
        : undefined,
      projects: projects
        ? {
            deleteMany: {}, // Delete existing projects
            create: projects.map((proj) => ({
              name: proj.name,
              description: proj.description,
              url: proj.url,
              technologies: proj.technologies || [],
              startDate: proj.startDate ? new Date(proj.startDate) : undefined,
              endDate: proj.endDate ? new Date(proj.endDate) : undefined,
            })),
          }
        : undefined,
    },
    include: {
      workExperiences: true,
      educations: true,
      projects: true,
    },
  });
};

export const deleteResume = async (id: string, userId: number) => {
  // First verify the resume belongs to the user
  const existingResume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!existingResume) {
    throw new Error("Resume not found or access denied");
  }

  return await prisma.resume.delete({
    where: { id },
  });
};
