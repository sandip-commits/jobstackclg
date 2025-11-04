import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ResumeServerData } from "./types";
import { ResumeValues } from "./validation";
import AOS from "aos/dist/aos.js";
import Swiper from "swiper/bundle";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
}

// Helper function to convert date to ISO string format
function formatDate(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined;
  if (typeof date === "string") {
    return date.split("T")[0];
  }
  return date.toISOString().split("T")[0];
}

export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    photo: data.photoUrl || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    jobTitle: data.jobTitle || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    template: data.template || undefined,
    workExperiences: data.workExperiences?.map((exp) => ({
      position: exp.position || undefined,
      company: exp.company || undefined,
      startDate: formatDate(exp.startDate),
      endDate: formatDate(exp.endDate),
      description: exp.description || undefined,
    })) || [],
    projects: data.projects?.map((project) => ({
      name: project.name || undefined,
      description: project.description || undefined,
      url: project.url || undefined,
      technologies: project.technologies || [],
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate),
    })) || [],
    educations: data.educations?.map((edu) => ({
      degree: edu.degree || undefined,
      school: edu.school || undefined,
      startDate: formatDate(edu.startDate),
      endDate: formatDate(edu.endDate),
    })) || [],
    skills: data.skills || [],
    borderStyle: data.borderStyle,
    colorHex: data.colorHex,
    summary: data.summary || undefined,
  };
}

export function initAos() {
  AOS.init({
    duration: 650,
    delay: 1,
    once: true,
    easing: "ease-in-out-sine",
  });
}

// src/utils/pdfjsLoader.ts
export async function loadPdfJs() {
  if (typeof window === "undefined") return null;

  await new Promise<void>((resolve, reject) => {
    if ((window as any).pdfjsLib) return resolve();

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.body.appendChild(script);
  });

  const pdfjs = (window as any).pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

  return pdfjs;
}

export default function testimonialSwiper() {
  new Swiper(".testimonial__swiper", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      type: "fraction",
      formatFractionCurrent: (number) => {
        return number < 10 ? `0${number}` : number;
      },
      formatFractionTotal: (number) => {
        return number < 10 ? `0${number}` : number;
      },
    },
  });
}
