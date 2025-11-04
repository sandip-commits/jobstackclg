"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DownloadButtonProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export default function DownloadButton({ contentRef }: DownloadButtonProps) {
  const handleDownload = async () => {
    if (!contentRef?.current) {
      alert(
        "Resume content not available. Please wait for the resume to load.",
      );
      return;
    }

    try {
      // Wait a moment to ensure content is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the actual content element
      const resumeContent = contentRef.current.querySelector(
        "#resumePreviewContent",
      );
      const targetElement = (resumeContent ||
        contentRef.current) as HTMLElement;

      if (!targetElement) {
        throw new Error("Resume content element not found. Please try again.");
      }

      // Force a reflow to ensure dimensions are calculated
      void targetElement.offsetHeight;

      // Wait for ResizeObserver to calculate dimensions if needed
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Wait for images to load if any
      const images = targetElement.querySelectorAll("img");
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

      // Check if content has dimensions
      if (targetElement.scrollHeight === 0 || targetElement.scrollWidth === 0) {
        throw new Error(
          "Resume content is not ready. Please wait and try again.",
        );
      }

      // Wait a bit more to ensure content is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: targetElement.scrollWidth || 794,
        height: targetElement.scrollHeight,
        allowTaint: false,
        windowWidth: targetElement.scrollWidth || 794,
        windowHeight: targetElement.scrollHeight,
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

      pdf.save("resume.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate PDF";
      alert(`Failed to generate PDF: ${errorMessage}`);
    }
  };

  return (
    <Button
      variant="outline"
      className="h-32 w-32"
      title="Download Resume PDF"
      onClick={handleDownload}
    >
      <Download className="size-5" />
    </Button>
  );
}
