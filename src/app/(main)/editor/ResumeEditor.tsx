"use client";

import useUnloadWarning from "@/hooks/useUnloadWarning";
import { ResumeServerData } from "@/lib/types";
import { cn, mapToResumeValues } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { resumeApi } from "@/lib/api-client";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import ResumePreviewSection from "./ResumePreviewSection";
import { steps } from "./steps";
import useAutoSaveResume from "./useAutoSaveResume";

interface ResumeEditorProps {
  resumeToEdit: ResumeServerData | null;
}

export default function ResumeEditor({ resumeToEdit }: ResumeEditorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const originalResumeData = useRef<ResumeValues>(
    resumeToEdit ? mapToResumeValues(resumeToEdit) : {},
  );

  const [resumeData, setResumeData] = useState<ResumeValues>(
    originalResumeData.current,
  );

  const [showSmResumePreview, setShowSmResumePreview] = useState(false);

  const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);

  useUnloadWarning(hasUnsavedChanges);

  const currentStep = searchParams.get("step") || steps[0].key;

  function setStep(key: string) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", key);
    window.history.pushState(null, "", `?${newSearchParams.toString()}`);
  }

  async function handleCancel() {
    // If creating a new resume (not editing) and it was auto-saved, delete it
    if (!resumeToEdit) {
      // Check both resumeData.id and searchParams resumeId (auto-save might have updated URL)
      const resumeIdToDelete = resumeData.id || searchParams.get("resumeId");

      if (resumeIdToDelete) {
        try {
          await resumeApi.delete(resumeIdToDelete);
        } catch (error) {
          console.error("Error deleting resume:", error);
          // Still navigate even if delete fails
        }
      }
    }
    // Navigate to resumes page
    router.push("/resumes");
  }

  const FormComponent = steps.find(
    (step) => step.key === currentStep,
  )?.component;

  return (
    <div className="flex grow flex-col px-[20px] pb-50 pt-[180px]">
      <header className="space-y-1.5 border-b px-3 py-5 text-center">
        <h1 className="text-2xl font-bold">Design your resume</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below to create your resume. Your progress will be
          saved automatically.
        </p>
      </header>
      <main className="relative grow">
        <div className="absolute bottom-0 top-0 flex w-full">
          <div
            className={cn(
              "w-full space-y-6 overflow-y-auto p-3 md:block md:w-1/2",
              showSmResumePreview && "hidden",
            )}
          >
            <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} />
            {FormComponent && (
              <FormComponent
                resumeData={resumeData}
                setResumeData={setResumeData}
              />
            )}
          </div>
          <div className="grow md:border-r" />
          <ResumePreviewSection
            resumeData={resumeData}
            setResumeData={setResumeData}
            className={cn(showSmResumePreview && "flex")}
          />
        </div>
      </main>
      <Footer
        currentStep={currentStep}
        setCurrentStep={setStep}
        showSmResumePreview={showSmResumePreview}
        setShowSmResumePreview={setShowSmResumePreview}
        isSaving={isSaving}
        onCancel={handleCancel}
        showCancel={!resumeToEdit}
      />
    </div>
  );
}
