import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { Templates } from "@/app/(main)/editor/TemplateSelector";
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function ResumePreview({
  resumeData,
  contentRef,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { width } = useDimensions(containerRef);
  const template = resumeData.template || Templates.MODERN;

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-10", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef as React.RefObject<HTMLDivElement>}
        id="resumePreviewContent"
      >
        {template === Templates.MODERN && (
          <ModernTemplate resumeData={resumeData} />
        )}
        {template === Templates.CLASSIC && (
          <ClassicTemplate resumeData={resumeData} />
        )}
        {template === Templates.MINIMAL && (
          <MinimalTemplate resumeData={resumeData} />
        )}
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  resumeData: ResumeValues;
}

// ============================================
// MODERN TEMPLATE - Contemporary Design
// ============================================
function ModernTemplate({ resumeData }: ResumeSectionProps) {
  return (
    <div className="space-y-5">
      <PersonalInfoHeaderModern resumeData={resumeData} />
      <SummarySectionModern resumeData={resumeData} />
      <WorkExperienceSectionModern resumeData={resumeData} />
      <ProjectsSectionModern resumeData={resumeData} />
      <EducationSectionModern resumeData={resumeData} />
      <SkillsSectionModern resumeData={resumeData} />
    </div>
  );
}

function PersonalInfoHeaderModern({ resumeData }: ResumeSectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex = "#2563eb",
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="resume-modern-header">
      <div className="flex items-start gap-5">
        {photoSrc && (
          <div className="flex-shrink-0">
            <Image
              src={photoSrc}
              width={110}
              height={110}
              alt="Profile photo"
              className="aspect-square object-cover ring-2 ring-offset-2"
              style={{
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                      ? "9999px"
                      : "12px",
                border: `2px solid ${colorHex}`,
              }}
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div>
            <h1
              className="mb-1.5 text-5xl font-bold leading-tight"
              style={{ color: colorHex }}
            >
              {firstName} {lastName}
            </h1>
            <p className="text-gray-700 text-lg font-semibold">{jobTitle}</p>
          </div>
          <div className="text-gray-600 flex flex-wrap gap-3 text-sm">
            {(city || country) && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {city}
                {city && country && ", "}
                {country}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {phone}
              </span>
            )}
            {email && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummarySectionModern({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex = "#2563eb" } = resumeData;

  if (!summary) return null;

  return (
    <div className="break-inside-avoid space-y-3">
      <div className="resume-modern-section-title" style={{ color: colorHex }}>
        Professional Summary
      </div>
      <div className="text-gray-700 whitespace-pre-line text-base leading-relaxed">
        {summary}
      </div>
    </div>
  );
}

function WorkExperienceSectionModern({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex = "#2563eb" } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div className="resume-modern-section-title" style={{ color: colorHex }}>
        Work Experience
      </div>
      <div className="space-y-4">
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="resume-modern-card break-inside-avoid">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className="mb-1.5 text-base font-bold"
                  style={{ color: colorHex }}
                >
                  {exp.position}
                </h3>
                <p className="text-gray-700 text-sm font-semibold">
                  {exp.company}
                </p>
              </div>
              {exp.startDate && (
                <span className="text-gray-500 ml-4 whitespace-nowrap text-sm font-medium">
                  {formatDate(exp.startDate, "MMM yyyy")} -{" "}
                  {exp.endDate
                    ? formatDate(exp.endDate, "MMM yyyy")
                    : "Present"}
                </span>
              )}
            </div>
            {exp.description && (
              <div className="text-gray-600 mt-2.5 whitespace-pre-line text-sm leading-relaxed">
                {exp.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSectionModern({ resumeData }: ResumeSectionProps) {
  const { projects, colorHex = "#2563eb" } = resumeData;

  const projectsNotEmpty = projects?.filter(
    (project) => Object.values(project).filter(Boolean).length > 0,
  );

  if (!projectsNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div className="resume-modern-section-title" style={{ color: colorHex }}>
        Projects
      </div>
      <div className="space-y-4">
        {projectsNotEmpty.map((project, index) => (
          <div key={index} className="resume-modern-card break-inside-avoid">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className="mb-1.5 text-base font-bold"
                  style={{ color: colorHex }}
                >
                  {project.name}
                </h3>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {project.url.length > 40
                      ? `${project.url.substring(0, 40)}...`
                      : project.url}
                  </a>
                )}
              </div>
              {project.startDate && (
                <span className="text-gray-500 ml-4 whitespace-nowrap text-sm font-medium">
                  {formatDate(project.startDate, "MMM yyyy")} -{" "}
                  {project.endDate
                    ? formatDate(project.endDate, "MMM yyyy")
                    : "Present"}
                </span>
              )}
            </div>
            {project.description && (
              <div className="text-gray-600 mt-2.5 whitespace-pre-line text-sm leading-relaxed">
                {project.description}
              </div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="text-gray-500 bg-gray-100 rounded px-2 py-0.5 text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSectionModern({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex = "#2563eb" } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div className="resume-modern-section-title" style={{ color: colorHex }}>
        Education
      </div>
      <div className="space-y-3">
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="resume-modern-card break-inside-avoid">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className="mb-1.5 text-base font-bold"
                  style={{ color: colorHex }}
                >
                  {edu.degree}
                </h3>
                <p className="text-gray-700 text-sm font-semibold">
                  {edu.school}
                </p>
              </div>
              {edu.startDate && (
                <span className="text-gray-500 ml-4 whitespace-nowrap text-sm font-medium">
                  {formatDate(edu.startDate, "MMM yyyy")}
                  {edu.endDate
                    ? ` - ${formatDate(edu.endDate, "MMM yyyy")}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSectionModern({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex = "#2563eb", borderStyle } = resumeData;

  if (!skills?.length) return null;

  return (
    <div className="break-inside-avoid space-y-3">
      <div className="resume-modern-section-title" style={{ color: colorHex }}>
        Skills
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            className="resume-modern-badge px-4 py-1.5 text-sm font-medium text-white"
            style={{
              backgroundColor: colorHex,
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0px"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "8px",
            }}
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CLASSIC TEMPLATE - Elegant Two-Column
// ============================================
function ClassicTemplate({ resumeData }: ResumeSectionProps) {
  return (
    <div className="flex gap-5">
      <div className="resume-classic-sidebar w-[35%] space-y-5">
        <PersonalInfoHeaderClassic resumeData={resumeData} />
        <SkillsSectionClassic resumeData={resumeData} />
      </div>
      <div className="resume-classic-content flex-1 space-y-5">
        <SummarySectionClassic resumeData={resumeData} />
        <WorkExperienceSectionClassic resumeData={resumeData} />
        <ProjectsSectionClassic resumeData={resumeData} />
        <EducationSectionClassic resumeData={resumeData} />
      </div>
    </div>
  );
}

function PersonalInfoHeaderClassic({ resumeData }: ResumeSectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex = "#ffffff",
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="space-y-4">
      {photoSrc && (
        <div className="flex justify-center">
          <Image
            src={photoSrc}
            width={130}
            height={130}
            alt="Profile photo"
            className="aspect-square object-cover ring-4 ring-white/20"
            style={{
              borderRadius:
                borderStyle === BorderStyles.SQUARE
                  ? "0px"
                  : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "8px",
            }}
          />
        </div>
      )}
      <div className="space-y-3 text-center">
        <div>
          <h1 className="mb-1.5 text-3xl font-bold text-white">
            {firstName} {lastName}
          </h1>
          <p className="text-gray-200 text-base font-medium">{jobTitle}</p>
        </div>
        <div className="text-gray-200 space-y-2 text-sm">
          {(city || country) && (
            <p className="flex items-center justify-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {city}
              {city && country && ", "}
              {country}
            </p>
          )}
          {phone && (
            <p className="flex items-center justify-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {phone}
            </p>
          )}
          {email && (
            <p className="flex items-center justify-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySectionClassic({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex = "#1e293b" } = resumeData;

  if (!summary) return null;

  return (
    <div className="break-inside-avoid space-y-3">
      <div
        className="resume-classic-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Professional Summary
      </div>
      <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
        {summary}
      </div>
    </div>
  );
}

function WorkExperienceSectionClassic({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex = "#1e293b" } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div
        className="resume-classic-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Work Experience
      </div>
      <div className="space-y-3">
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="resume-classic-item break-inside-avoid">
            <div
              className="resume-classic-item-title"
              style={{ color: colorHex }}
            >
              {exp.position}
            </div>
            <div className="resume-classic-item-subtitle">
              {exp.company}
              {exp.startDate && (
                <span className="ml-2">
                  • {formatDate(exp.startDate, "MMM yyyy")} -{" "}
                  {exp.endDate
                    ? formatDate(exp.endDate, "MMM yyyy")
                    : "Present"}
                </span>
              )}
            </div>
            {exp.description && (
              <div className="resume-classic-item-description whitespace-pre-line">
                {exp.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSectionClassic({ resumeData }: ResumeSectionProps) {
  const { projects, colorHex = "#1e293b" } = resumeData;

  const projectsNotEmpty = projects?.filter(
    (project) => Object.values(project).filter(Boolean).length > 0,
  );

  if (!projectsNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div
        className="resume-classic-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Projects
      </div>
      <div className="space-y-3">
        {projectsNotEmpty.map((project, index) => (
          <div key={index} className="resume-classic-item break-inside-avoid">
            <div
              className="resume-classic-item-title"
              style={{ color: colorHex }}
            >
              {project.name}
            </div>
            <div className="resume-classic-item-subtitle">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {project.url.length > 50
                    ? `${project.url.substring(0, 50)}...`
                    : project.url}
                </a>
              )}
              {project.startDate && (
                <span className="ml-2">
                  • {formatDate(project.startDate, "MMM yyyy")} -{" "}
                  {project.endDate
                    ? formatDate(project.endDate, "MMM yyyy")
                    : "Present"}
                </span>
              )}
            </div>
            {project.description && (
              <div className="resume-classic-item-description whitespace-pre-line">
                {project.description}
              </div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="resume-classic-skill-tag bg-gray-100 text-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationSectionClassic({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex = "#1e293b" } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <div className="space-y-3">
      <div
        className="resume-classic-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Education
      </div>
      <div className="space-y-3">
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="resume-classic-item break-inside-avoid">
            <div
              className="resume-classic-item-title"
              style={{ color: colorHex }}
            >
              {edu.degree}
            </div>
            <div className="resume-classic-item-subtitle">
              {edu.school}
              {edu.startDate && (
                <span className="ml-2">
                  • {formatDate(edu.startDate, "MMM yyyy")}
                  {edu.endDate
                    ? ` - ${formatDate(edu.endDate, "MMM yyyy")}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSectionClassic({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex = "#ffffff" } = resumeData;

  if (!skills?.length) return null;

  return (
    <div className="break-inside-avoid space-y-3">
      <div
        className="resume-classic-section-title border-white/30 text-white"
        style={{ borderColor: "rgba(255,255,255,0.3)" }}
      >
        Skills
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="resume-classic-skill-tag border border-white/30 bg-white/20 text-white"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MINIMAL TEMPLATE - Ultra Clean Design
// ============================================
function MinimalTemplate({ resumeData }: ResumeSectionProps) {
  return (
    <div className="resume-minimal-container space-y-5">
      <PersonalInfoHeaderMinimal resumeData={resumeData} />
      <SummarySectionMinimal resumeData={resumeData} />
      <WorkExperienceSectionMinimal resumeData={resumeData} />
      <ProjectsSectionMinimal resumeData={resumeData} />
      <EducationSectionMinimal resumeData={resumeData} />
      <SkillsSectionMinimal resumeData={resumeData} />
    </div>
  );
}

function PersonalInfoHeaderMinimal({ resumeData }: ResumeSectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex = "#000000",
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="resume-minimal-header">
      {photoSrc && (
        <div className="mb-4 flex justify-center">
          <Image
            src={photoSrc}
            width={90}
            height={90}
            alt="Profile photo"
            className="aspect-square rounded-full border-2 object-cover"
            style={{ borderColor: colorHex }}
          />
        </div>
      )}
      <h1 className="resume-minimal-name" style={{ color: colorHex }}>
        {firstName} {lastName}
      </h1>
      {jobTitle && <p className="resume-minimal-title">{jobTitle}</p>}
      <div className="text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
        {(city || country) && (
          <span>
            {city}
            {city && country && ", "}
            {country}
          </span>
        )}
        {phone && <span>{phone}</span>}
        {email && <span>{email}</span>}
      </div>
    </div>
  );
}

function SummarySectionMinimal({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex = "#000000" } = resumeData;

  if (!summary) return null;

  return (
    <div className="resume-minimal-section break-inside-avoid">
      <div
        className="resume-minimal-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Summary
      </div>
      <div className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
        {summary}
      </div>
    </div>
  );
}

function WorkExperienceSectionMinimal({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex = "#000000" } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <div className="resume-minimal-section space-y-4">
      <div
        className="resume-minimal-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Work Experience
      </div>
      {workExperiencesNotEmpty.map((exp, index) => (
        <div key={index} className="resume-minimal-item break-inside-avoid">
          <div className="resume-minimal-item-header">
            <div className="flex-1">
              <div
                className="resume-minimal-item-title"
                style={{ color: colorHex }}
              >
                {exp.position}
              </div>
              <div className="resume-minimal-item-company">{exp.company}</div>
            </div>
            {exp.startDate && (
              <span className="resume-minimal-item-date">
                {formatDate(exp.startDate, "MMM yyyy")} -{" "}
                {exp.endDate ? formatDate(exp.endDate, "MMM yyyy") : "Present"}
              </span>
            )}
          </div>
          {exp.description && (
            <div className="resume-minimal-item-description whitespace-pre-line">
              {exp.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectsSectionMinimal({ resumeData }: ResumeSectionProps) {
  const { projects, colorHex = "#000000" } = resumeData;

  const projectsNotEmpty = projects?.filter(
    (project) => Object.values(project).filter(Boolean).length > 0,
  );

  if (!projectsNotEmpty?.length) return null;

  return (
    <div className="resume-minimal-section space-y-4">
      <div
        className="resume-minimal-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Projects
      </div>
      {projectsNotEmpty.map((project, index) => (
        <div key={index} className="resume-minimal-item break-inside-avoid">
          <div className="resume-minimal-item-header">
            <div className="flex-1">
              <div
                className="resume-minimal-item-title"
                style={{ color: colorHex }}
              >
                {project.name}
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-minimal-item-company text-blue-600 hover:underline"
                >
                  {project.url.length > 50
                    ? `${project.url.substring(0, 50)}...`
                    : project.url}
                </a>
              )}
            </div>
            {project.startDate && (
              <span className="resume-minimal-item-date">
                {formatDate(project.startDate, "MMM yyyy")} -{" "}
                {project.endDate
                  ? formatDate(project.endDate, "MMM yyyy")
                  : "Present"}
              </span>
            )}
          </div>
          {project.description && (
            <div className="resume-minimal-item-description whitespace-pre-line">
              {project.description}
            </div>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {project.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="resume-minimal-skill"
                  style={{ borderColor: colorHex, color: colorHex }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationSectionMinimal({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex = "#000000" } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <div className="resume-minimal-section space-y-4">
      <div
        className="resume-minimal-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Education
      </div>
      {educationsNotEmpty.map((edu, index) => (
        <div key={index} className="resume-minimal-item break-inside-avoid">
          <div className="resume-minimal-item-header">
            <div className="flex-1">
              <div
                className="resume-minimal-item-title"
                style={{ color: colorHex }}
              >
                {edu.degree}
              </div>
              <div className="resume-minimal-item-company">{edu.school}</div>
            </div>
            {edu.startDate && (
              <span className="resume-minimal-item-date">
                {formatDate(edu.startDate, "MMM yyyy")}
                {edu.endDate ? ` - ${formatDate(edu.endDate, "MMM yyyy")}` : ""}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsSectionMinimal({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex = "#000000" } = resumeData;

  if (!skills?.length) return null;

  return (
    <div className="resume-minimal-section break-inside-avoid">
      <div
        className="resume-minimal-section-title"
        style={{ borderColor: colorHex, color: colorHex }}
      >
        Skills
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="resume-minimal-skill"
            style={{ borderColor: colorHex, color: colorHex }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
