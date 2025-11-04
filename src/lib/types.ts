import { ResumeValues } from "./validation";

export interface EditorFormProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
}

// Type for resume data coming from the backend API
export type ResumeServerData = {
  id: string;
  userId: number;
  title: string | null;
  description: string | null;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  colorHex: string;
  borderStyle: string;
  summary: string | null;
  skills: string[];
  template?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  workExperiences: {
    id: string;
    resumeId: string;
    position: string | null;
    company: string | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    description: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }[];
  projects: {
    id: string;
    resumeId: string;
    name: string | null;
    description: string | null;
    url: string | null;
    technologies: string[];
    startDate: string | Date | null;
    endDate: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }[];
  educations: {
    id: string;
    resumeId: string;
    degree: string | null;
    school: string | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }[];
};
