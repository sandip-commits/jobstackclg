import { resumeSchema, ResumeValues } from "@/lib/validation";
import { resumeApi, uploadApi } from "@/lib/api-client";

export async function saveResume(values: ResumeValues) {
  const { id } = values;

  console.log("[actions.ts] saveResume - received values:", {
    id,
    hasWorkExperiences: !!values.workExperiences,
    workExperiencesCount: values.workExperiences?.length || 0,
    hasEducations: !!values.educations,
    educationsCount: values.educations?.length || 0,
    hasProjects: !!values.projects,
    projectsCount: values.projects?.length || 0,
    hasSkills: !!values.skills,
    skillsCount: values.skills?.length || 0,
    firstName: values.firstName,
    jobTitle: values.jobTitle,
  });

  const { photo, workExperiences, projects, educations, ...resumeValues } =
    resumeSchema.parse(values);

  console.log("[actions.ts] saveResume - after parse:", {
    hasWorkExperiences: !!workExperiences,
    workExperiencesCount: workExperiences?.length || 0,
    hasEducations: !!educations,
    educationsCount: educations?.length || 0,
    hasProjects: !!projects,
    projectsCount: projects?.length || 0,
  });

  let photoUrl: string | undefined | null = undefined;

  // Handle photo upload
  if (photo instanceof File) {
    try {
      const uploadResult = await uploadApi.uploadImage(photo);
      photoUrl = uploadResult.url;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw new Error("Failed to upload photo");
    }
  } else if (photo === null) {
    photoUrl = null;
  }

  // Prepare data for API
  const resumeData = {
    ...resumeValues,
    ...(photoUrl !== undefined && { photoUrl }),
    workExperiences: workExperiences
      ?.filter((exp) => exp.position || exp.company || exp.description)
      .map((exp) => ({
        position: exp.position || undefined,
        company: exp.company || undefined,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : undefined,
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : undefined,
        description: exp.description || undefined,
      })),
    projects: projects
      ?.filter(
        (project) =>
          project.name ||
          project.description ||
          project.url ||
          (project.technologies && project.technologies.length > 0),
      )
      .map((project) => ({
        name: project.name,
        description: project.description,
        url: project.url,
        technologies: project.technologies || [],
        startDate: project.startDate
          ? new Date(project.startDate).toISOString()
          : undefined,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : undefined,
      })),
    educations: educations
      ?.filter((edu) => edu.degree || edu.school)
      .map((edu) => ({
        degree: edu.degree || undefined,
        school: edu.school || undefined,
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : undefined,
        endDate: edu.endDate ? new Date(edu.endDate).toISOString() : undefined,
      })),
  };

  console.log("[actions.ts] saveResume - prepared data to send:", {
    id,
    hasWorkExperiences: !!resumeData.workExperiences,
    workExperiencesCount: resumeData.workExperiences?.length || 0,
    workExperiences: resumeData.workExperiences,
    hasEducations: !!resumeData.educations,
    educationsCount: resumeData.educations?.length || 0,
    educations: resumeData.educations,
    hasProjects: !!resumeData.projects,
    projectsCount: resumeData.projects?.length || 0,
    projects: resumeData.projects,
    firstName: resumeData.firstName,
    jobTitle: resumeData.jobTitle,
  });

  // Create or update resume
  if (id) {
    console.log("[actions.ts] Calling update API for id:", id);
    return resumeApi.update(id, resumeData);
  } else {
    console.log("[actions.ts] Calling create API");
    return resumeApi.create(resumeData);
  }
}
