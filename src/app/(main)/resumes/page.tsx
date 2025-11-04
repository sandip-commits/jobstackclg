"use client";

import { Button } from "@/components/ui/button";
import {
  PlusSquare,
  Edit,
  Trash2,
  Download,
  FileSearch,
  Briefcase,
  FileText,
  MoreVertical,
  Printer,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resumeApi } from "@/lib/api-client";
import { ResumeServerData } from "@/lib/types";
import { mapToResumeValues } from "@/lib/utils";
import ResumePreview from "@/components/ResumePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Page() {
  const [resumes, setResumes] = useState<ResumeServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeServerData | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeApi.getAll();
      setResumes(data);
    } catch (error) {
      console.error("Error loading resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(id);
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resume: ResumeServerData) => {
    let tempDiv: HTMLDivElement | null = null;
    let root: any = null;

    try {
      const resumeValues = mapToResumeValues(resume);

      // Create a temporary container - position off-screen but visible for proper styling
      tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "794px";
      tempDiv.style.height = "1123px"; // A4 height in pixels at 96 DPI
      tempDiv.style.pointerEvents = "none";
      tempDiv.style.zIndex = "-1";
      tempDiv.style.overflow = "visible";
      document.body.appendChild(tempDiv);

      // Create preview container with explicit dimensions
      const previewContainer = document.createElement("div");
      previewContainer.style.width = "794px";
      previewContainer.style.height = "auto";
      previewContainer.style.minHeight = "1123px";
      previewContainer.style.background = "white";
      previewContainer.style.position = "relative";
      previewContainer.id = "temp-resume-preview";
      tempDiv.appendChild(previewContainer);

      // Render resume preview in the preview container
      const { createRoot } = await import("react-dom/client");
      root = createRoot(previewContainer);

      root.render(
        <ResumePreview resumeData={resumeValues} className="w-full" />,
      );

      // Wait for React to render and dimensions to be calculated
      // First wait for initial render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Wait for ResizeObserver to calculate dimensions
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force a reflow to ensure dimensions are calculated
      void previewContainer.offsetHeight;

      // Wait for images to load if any
      const images = previewContainer.querySelectorAll("img");
      if (images.length > 0) {
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve(); // Continue even if image fails
                  setTimeout(() => resolve(), 3000); // Timeout after 3s
                }
              }),
          ),
        );
      }

      // Get the actual content element from ResumePreview
      const resumeContent = previewContainer.querySelector(
        "#resumePreviewContent",
      );
      const targetElement = (resumeContent || previewContainer) as HTMLElement;

      if (!targetElement) {
        throw new Error("Resume content element not found. Please try again.");
      }

      // Wait a bit more to ensure content is fully rendered and zoom is calculated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Wait for ResizeObserver to calculate dimensions (for zoom property)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ensure fonts are loaded
      await document.fonts.ready;

      // Check if content has dimensions
      if (targetElement.scrollHeight === 0 || targetElement.scrollWidth === 0) {
        throw new Error(
          "Resume content is not ready. Please wait and try again.",
        );
      }

      // Force multiple reflows to ensure all styles are computed
      void targetElement.offsetHeight;
      void previewContainer.offsetHeight;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: targetElement.scrollWidth || 794,
        height: targetElement.scrollHeight,
        allowTaint: false,
        foreignObjectRendering: false,
        windowWidth: targetElement.scrollWidth || 794,
        windowHeight: targetElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure styles are preserved in cloned document
          const clonedElement = clonedDoc.querySelector(
            "#resumePreviewContent",
          ) as HTMLElement;
          if (clonedElement) {
            // Force layout recalculation to ensure zoom and styles are computed
            void clonedElement.offsetHeight;
            void clonedElement.offsetWidth;
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to capture resume preview. Please try again.");
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add proper margins (1cm = 10mm on each side)
      const margin = 10;
      const imgWidth = 210 - margin * 2; // A4 width minus margins
      const pageHeight = 297 - margin * 2; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // First page with margins
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages if content exceeds one page
      while (heightLeft >= 0) {
        pdf.addPage();
        const yPosition = margin - (imgHeight - pageHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resume.title || "resume"}_${Date.now()}.pdf`.trim();
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate PDF";
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      // Always cleanup
      try {
        if (root) {
          root.unmount();
        }
        if (tempDiv?.parentNode) {
          document.body.removeChild(tempDiv);
        }
      } catch (cleanupError) {
        console.warn("Cleanup error:", cleanupError);
      }
    }
  };

  const generateResumeText = (resume: ResumeServerData): string => {
    const parts: string[] = [];

    if (resume.firstName || resume.lastName) {
      parts.push(`Name: ${resume.firstName || ""} ${resume.lastName || ""}`);
    }
    if (resume.jobTitle) parts.push(`Job Title: ${resume.jobTitle}`);
    if (resume.email) parts.push(`Email: ${resume.email}`);
    if (resume.phone) parts.push(`Phone: ${resume.phone}`);
    if (resume.city || resume.country) {
      parts.push(`Location: ${resume.city || ""} ${resume.country || ""}`);
    }

    if (resume.summary) {
      parts.push(`\nSummary:\n${resume.summary}`);
    }

    if (resume.workExperiences && resume.workExperiences.length > 0) {
      parts.push("\nWork Experience:");
      resume.workExperiences.forEach((exp) => {
        if (exp.position) parts.push(`Position: ${exp.position}`);
        if (exp.company) parts.push(`Company: ${exp.company}`);
        if (exp.description) parts.push(`Description: ${exp.description}`);
        parts.push("");
      });
    }

    if (resume.projects && resume.projects.length > 0) {
      parts.push("\nProjects:");
      resume.projects.forEach((project) => {
        if (project.name) parts.push(`Project Name: ${project.name}`);
        if (project.url) parts.push(`URL: ${project.url}`);
        if (project.description)
          parts.push(`Description: ${project.description}`);
        if (project.technologies && project.technologies.length > 0) {
          parts.push(`Technologies: ${project.technologies.join(", ")}`);
        }
        parts.push("");
      });
    }

    if (resume.educations && resume.educations.length > 0) {
      parts.push("\nEducation:");
      resume.educations.forEach((edu) => {
        if (edu.degree) parts.push(`Degree: ${edu.degree}`);
        if (edu.school) parts.push(`School: ${edu.school}`);
        parts.push("");
      });
    }

    if (resume.skills && resume.skills.length > 0) {
      parts.push(`\nSkills: ${resume.skills.join(", ")}`);
    }

    return parts.join("\n");
  };

  const handleAnalyze = async (resume: ResumeServerData) => {
    const resumeText = generateResumeText(resume);

    // Store resume text in sessionStorage and navigate
    sessionStorage.setItem("resumeText", resumeText);
    sessionStorage.setItem(
      "resumeFileName",
      `${resume.firstName || "resume"}_${resume.lastName || ""}.pdf`,
    );
    router.push("/analyzer");
  };

  const handleRecommend = async (resume: ResumeServerData) => {
    const resumeText = generateResumeText(resume);

    // Store resume text in sessionStorage and navigate
    sessionStorage.setItem("resumeText", resumeText);
    sessionStorage.setItem(
      "resumeFileName",
      `${resume.firstName || "resume"}_${resume.lastName || ""}.pdf`,
    );
    router.push("/recommender");
  };

  const handlePrint = async (resume: ResumeServerData) => {
    let tempDiv: HTMLDivElement | null = null;
    let root: any = null;

    try {
      const resumeValues = mapToResumeValues(resume);

      // Create a temporary container - position off-screen but visible for proper styling
      tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "794px";
      tempDiv.style.height = "1123px";
      tempDiv.style.pointerEvents = "none";
      tempDiv.style.zIndex = "-1";
      tempDiv.style.overflow = "visible";
      document.body.appendChild(tempDiv);

      // Create preview container with explicit dimensions
      const previewContainer = document.createElement("div");
      previewContainer.style.width = "794px";
      previewContainer.style.minHeight = "1123px";
      previewContainer.style.background = "white";
      previewContainer.id = "temp-resume-preview-print";
      tempDiv.appendChild(previewContainer);

      // Render resume preview in the preview container
      const { createRoot } = await import("react-dom/client");
      root = createRoot(previewContainer);

      root.render(
        <ResumePreview resumeData={resumeValues} className="w-full" />,
      );

      // Wait for React to render and dimensions to be calculated
      await new Promise((resolve) => setTimeout(resolve, 500));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force a reflow to ensure dimensions are calculated
      void previewContainer.offsetHeight;

      // Wait for images to load if any
      const images = previewContainer.querySelectorAll("img");
      if (images.length > 0) {
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  setTimeout(() => resolve(), 3000);
                }
              }),
          ),
        );
      }

      // Get the actual content element from ResumePreview
      const resumeContent = previewContainer.querySelector(
        "#resumePreviewContent",
      );
      const targetElement = (resumeContent || previewContainer) as HTMLElement;

      if (!targetElement) {
        throw new Error("Resume content element not found. Please try again.");
      }

      // Wait a bit more to ensure content is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if content has dimensions
      if (targetElement.scrollHeight === 0 || targetElement.scrollWidth === 0) {
        throw new Error(
          "Resume content is not ready. Please wait and try again.",
        );
      }

      // Get all CSS from stylesheets and style tags
      const allStyles: string[] = [];

      // Extract from stylesheets
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
            // Skip cross-origin stylesheets
            return;
          }
          Array.from(sheet.cssRules || sheet.rules || []).forEach((rule) => {
            try {
              allStyles.push(rule.cssText);
            } catch (e) {
              // Some rules might not be accessible
            }
          });
        } catch (e) {
          // Cross-origin stylesheets will throw - skip them
        }
      });

      // Also include inline style tags from the document
      Array.from(document.querySelectorAll("style")).forEach((styleTag) => {
        if (styleTag.textContent) {
          allStyles.push(styleTag.textContent);
        }
      });

      // Create a print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print the resume");
        return;
      }

      // Write print styles and content structure with all CSS
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resume.title || "Resume"}</title>
            <style>
              ${allStyles.join("\n")}
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
                font-family: Inter, Arial, sans-serif;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                #resumePreviewContent {
                  zoom: 1 !important;
                  padding: 1.5cm !important;
                }
              }
            </style>
          </head>
          <body>
            ${targetElement.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Wait for the document to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Trigger print dialog
      printWindow.print();

      // Clean up after print dialog closes
      printWindow.addEventListener("afterprint", () => {
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 100);
      });
    } catch (error) {
      console.error("Error printing resume:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to print resume";
      alert(`Failed to print resume: ${errorMessage}`);
    } finally {
      // Always cleanup
      try {
        if (root) {
          root.unmount();
        }
        if (tempDiv?.parentNode) {
          document.body.removeChild(tempDiv);
        }
      } catch (cleanupError) {
        console.warn("Cleanup error:", cleanupError);
      }
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl items-center justify-center pb-50 pt-[180px]">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading resumes...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl pb-50 pt-[180px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Resumes</h1>
        <Button className="flex gap-2 bg-black p-3 text-white hover:bg-black/80">
          <Link href="/editor" className="flex items-center gap-2">
            <PlusSquare className="size-5" />
            New Resume
          </Link>
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="text-gray-400 mb-4 size-16" />
          <p className="text-gray-600 mb-4 text-lg">No resumes yet</p>
          <Button className="flex gap-2 bg-black p-3 text-white hover:bg-black/80">
            <Link href="/editor" className="flex items-center gap-2">
              <PlusSquare className="size-5" />
              Create Your First Resume
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-24 md:grid-cols-3 lg:grid-cols-5">
          {resumes.map((resume) => {
            const resumeValues = mapToResumeValues(resume);
            const resumeName = resume.title || "Untitled Resume";

            return (
              <div
                key={resume.id}
                className="group relative overflow-hidden rounded-lg border bg-white p-12 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="relative">
                  <div className="bg-gray-50 aspect-[210/297] h-48 overflow-hidden">
                    <ResumePreview
                      resumeData={resumeValues}
                      className="h-full w-full origin-top-left scale-75"
                    />
                  </div>
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 shadow-md hover:bg-white"
                        >
                          <MoreVertical className="h-4 w-4 dark:text-black" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewResume(resume)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/editor?resumeId=${resume.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(resume)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(resume)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAnalyze(resume)}>
                          <FileSearch className="mr-2 h-4 w-4" />
                          Analyze
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRecommend(resume)}
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          Find Jobs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(resume.id)}
                          disabled={deletingId === resume.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === resume.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="border-t bg-white p-4">
                  <h3 className="mb-1 truncate text-lg font-semibold dark:text-black">
                    {resumeName}
                  </h3>
                  <p className="text-gray-500 text-sm dark:text-black">
                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewResume} onOpenChange={(open) => !open && setPreviewResume(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewResume?.title || "Resume Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-gray-50 p-6">
            {previewResume && (
              <div className="w-[794px] bg-white shadow-lg">
                <ResumePreview
                  resumeData={mapToResumeValues(previewResume)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
