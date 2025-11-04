"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resumeApi } from "@/lib/api-client";
import { ResumeServerData } from "@/lib/types";
import ResumeEditor from "./ResumeEditor";

export default function Page() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const [resumeToEdit, setResumeToEdit] = useState<ResumeServerData | null>(null);
  const [loading, setLoading] = useState(!!resumeId);

  useEffect(() => {
    if (resumeId) {
      loadResume();
    }
  }, [resumeId]);

  const loadResume = async () => {
    if (!resumeId) return;

    try {
      const data = await resumeApi.getById(resumeId);
      setResumeToEdit(data);
    } catch (error) {
      console.error("Error loading resume:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading resume...</div>
        </div>
      </div>
    );
  }

  return <ResumeEditor resumeToEdit={resumeToEdit} />;
}
