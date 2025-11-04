"use client";

import ResumePreview from "@/components/ResumePreview";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useRef } from "react";
import BorderStyleButton from "./BorderStyleButton";
import ColorPicker from "./ColorPicker";
import TemplateSelector from "./TemplateSelector";

interface ResumePreviewSectionProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className,
}: ResumePreviewSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn("group relative hidden w-full md:flex md:w-1/2", className)}
    >
      <div className="pointer-events-none absolute left-1 top-1 z-10 flex flex-none flex-col gap-3 opacity-50 transition-opacity group-hover:opacity-100 lg:left-3 lg:top-3 xl:opacity-100">
        <div className="pointer-events-auto">
          <ColorPicker
            color={resumeData.colorHex}
            onChange={(color) =>
              setResumeData({ ...resumeData, colorHex: color.hex })
            }
          />
        </div>
        <div className="pointer-events-auto">
          <BorderStyleButton
            borderStyle={resumeData.borderStyle}
            onChange={(borderStyle) =>
              setResumeData({ ...resumeData, borderStyle })
            }
          />
        </div>
        <div className="pointer-events-auto">
          <TemplateSelector
            template={resumeData.template}
            onChange={(template) => setResumeData({ ...resumeData, template })}
          />
        </div>
      </div>
      <div className="flex w-full justify-center overflow-y-auto bg-secondary p-4 md:p-6">
        <ResumePreview
          resumeData={resumeData}
          contentRef={contentRef}
          className="max-w-2xl shadow-lg"
        />
      </div>
    </div>
  );
}
