"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import constants, {
  buildPresenceChecklist,
  METRIC_CONFIG,
} from "@/lib/constant";
import { loadPdfJs } from "@/lib/utils";
declare global {
  interface Window {
    puter?: {
      ai?: {
        chat?: any;
      };
    };
  }
}
// ----------------------
// Types
// ----------------------
type PDFJSLib = typeof import("pdfjs-dist");

type MetricScore = number;

export type PerformanceMetrics = {
  [key: string]: number | undefined;
  formatting: MetricScore;
  contentQuality: MetricScore;
  keywordUsage: MetricScore;
  atsCompatibility: MetricScore;
  quantifiableAchievements: MetricScore;
};

export type AnalysisReport = {
  overallScore: string;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  summary: string;
  performanceMetrics: PerformanceMetrics;
  actionItems: string[];
  proTips: string[];
  atsChecklist: string[];
  error?: string;
};

type PresenceChecklistItem = {
  label: string;
  present: boolean;
};

// ----------------------
// Component
// ----------------------
export default function AnalyzerPage() {
  const [aiReady, setAiReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [presenceChecklist, setPresenceChecklist] = useState<
    PresenceChecklistItem[]
  >([]);
  const [pdfjsLib, setPdfjsLib] = useState<PDFJSLib | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasStoredResume, setHasStoredResume] = useState<boolean>(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // ----------------------
  // Puter AI ready check
  // ----------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // ----------------------
  // Load PDF.js dynamically
  // ----------------------
  useEffect(() => {
    (async () => {
      const lib = await loadPdfJs();
      if (lib) setPdfjsLib(lib);
      console.log("✅ PDF.js Loaded:", lib?.version);
    })();
  }, []);

  // ----------------------
  // Check for resume text from resumes page
  // ----------------------
  useEffect(() => {
    const storedText = sessionStorage.getItem("resumeText");
    const storedFileName = sessionStorage.getItem("resumeFileName");
    if (storedText) {
      setHasStoredResume(true);
      if (storedFileName) {
        setResumeFileName(storedFileName);
      }
      if (aiReady && !isLoading && !analysis) {
        // Auto-process the resume text
        setResumeText(storedText);
        setPresenceChecklist(buildPresenceChecklist(storedText));
        setIsLoading(true);

        // Trigger analysis asynchronously
        (async () => {
          try {
            if (!window.puter?.ai?.chat) {
              throw new Error(
                "AI service is not ready. Please wait a moment and try again.",
              );
            }

            if (!storedText || storedText.trim().length < 50) {
              throw new Error(
                "Resume text is too short or empty. Please ensure your resume has sufficient content.",
              );
            }

            // Validate if it's a proper resume
            await validateResume(storedText);

            const prompt = constants.ANALYZE_RESUME_PROMPT.replace(
              "{{DOCUMENT_TEXT}}",
              storedText.substring(0, 10000), // Limit text length to prevent token limits
            );

            const response = await window.puter.ai.chat(
              [
                {
                  role: "system",
                  content:
                    "You are an expert resume reviewer and career advisor with extensive experience in ATS systems and resume optimization.",
                },
                { role: "user", content: prompt },
              ],
              {
                model: "gpt-4o",
                temperature: 0.3, // Lower temperature for more consistent results
              },
            );

            if (!response) {
              throw new Error("No response received from AI service.");
            }

            const responseContent =
              typeof response === "string"
                ? response
                : response.message?.content || "";

            if (!responseContent || responseContent.trim().length === 0) {
              throw new Error(
                "Empty response from AI service. Please try again.",
              );
            }

            const result = parseJsonResponse(responseContent);

            if (result.error) {
              throw new Error(result.error);
            }

            // Validate required fields
            if (!result.overallScore || !result.performanceMetrics) {
              throw new Error("Incomplete analysis result. Please try again.");
            }

            setAnalysis(result);
            setErrorMessage(null);

            // Clean up sessionStorage
            sessionStorage.removeItem("resumeText");
            sessionStorage.removeItem("resumeFileName");
            setHasStoredResume(false);
          } catch (err: any) {
            console.error("Analysis error:", err);
            const errorMessage =
              err instanceof Error
                ? err.message
                : "An unexpected error occurred during analysis. Please try again.";
            setErrorMessage(errorMessage);
            sessionStorage.removeItem("resumeText");
            sessionStorage.removeItem("resumeFileName");
            setHasStoredResume(false);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    }
  }, [aiReady, isLoading, analysis]);

  const reset = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setResumeText("");
    setPresenceChecklist([]);
    setIsLoading(false);
    setHasStoredResume(false);
    setResumeFileName(null);
    sessionStorage.removeItem("resumeText");
    sessionStorage.removeItem("resumeFileName");
  };
  // ----------------------
  // Extract text from PDF
  // ----------------------
  const extractPDFText = async (file: File): Promise<string> => {
    if (!pdfjsLib) throw new Error("PDF.js not loaded yet");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const texts = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        return content.items.map((item: any) => item.str).join(" ");
      }),
    );
    return texts.join("\n").trim();
  };

  // ----------------------
  // Validate if PDF is a proper resume
  // ----------------------
  const validateResume = async (text: string): Promise<void> => {
    if (!window.puter?.ai?.chat) {
      throw new Error(
        "AI service is not ready. Please wait a moment and try again.",
      );
    }

    if (!text || text.trim().length < 50) {
      throw new Error(
        "Resume text is too short or empty. Please ensure your resume has sufficient content.",
      );
    }

    // Quick validation check for resume-like content
    const resumeKeywords = [
      "experience",
      "education",
      "skills",
      "summary",
      "work",
      "employment",
      "position",
      "company",
      "degree",
      "university",
      "college",
      "email",
      "phone",
      "contact",
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = resumeKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    );

    if (foundKeywords.length < 3) {
      throw new Error(
        "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections.",
      );
    }

    // Use AI to validate more thoroughly
    const validationPrompt = `Analyze this document and determine if it is a resume/CV. Look for:
- Professional experience, work history, or employment information
- Education background, degrees, or academic information
- Skills, qualifications, or professional competencies
- Contact information and personal details

Respond with ONLY a JSON object in this format:
{
  "isResume": true or false,
  "reason": "brief explanation"
}

Document text:
"""${text.substring(0, 2000)}"""`;

    try {
      const response = await window.puter.ai.chat(
        [{ role: "user", content: validationPrompt }],
        { model: "gpt-4o-mini" },
      );

      const responseContent =
        typeof response === "string"
          ? response
          : response.message?.content || "";

      const jsonMatch = responseContent.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const validation = JSON.parse(jsonMatch[0]);
        if (!validation.isResume) {
          throw new Error(
            validation.reason ||
              "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections.",
          );
        }
      }
    } catch (err: any) {
      // If it's an error about not being a resume, throw it
      if (err.message && err.message.includes("not appear to be a resume")) {
        throw err;
      }
      // For other validation errors, log warning but allow to proceed
      // The full analysis will catch non-resume documents anyway
      console.warn("Resume validation warning:", err);
    }
  };

  // ----------------------
  // Parse AI JSON response
  // ----------------------
  const parseJsonResponse = (reply: string): AnalysisReport => {
    try {
      if (!reply || reply.trim().length === 0) {
        throw new Error("Empty response from AI service");
      }

      // Try to find JSON object in the response
      const jsonMatch = reply.match(/{[\s\S]*}/);

      if (!jsonMatch || jsonMatch.length === 0) {
        throw new Error("No valid JSON found in AI response");
      }

      const parsed: AnalysisReport = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.overallScore && !parsed.error) {
        throw new Error("Invalid AI response: missing overallScore");
      }

      // Ensure arrays exist
      parsed.strengths = parsed.strengths || [];
      parsed.improvements = parsed.improvements || [];
      parsed.keywords = parsed.keywords || [];
      parsed.actionItems = parsed.actionItems || [];
      parsed.proTips = parsed.proTips || [];
      parsed.atsChecklist = parsed.atsChecklist || [];
      parsed.performanceMetrics = parsed.performanceMetrics || {
        formatting: 5,
        contentQuality: 5,
        keywordUsage: 5,
        atsCompatibility: 5,
        quantifiableAchievements: 5,
      };

      console.log("Parsed analysis:", parsed);
      return parsed;
    } catch (err: any) {
      console.error("JSON parsing error:", err);
      if (err instanceof SyntaxError) {
        throw new Error(
          "Failed to parse AI response: Invalid JSON format. Please try again.",
        );
      }
      throw new Error(
        `Failed to parse AI response: ${err.message || "Unknown error"}`,
      );
    }
  };

  // ----------------------
  // Call Puter AI to analyze resume
  // ----------------------
  const analyzeResume = async (text: string): Promise<AnalysisReport> => {
    try {
      if (!window.puter?.ai?.chat) {
        throw new Error(
          "AI service is not ready. Please wait a moment and try again.",
        );
      }

      if (!text || text.trim().length < 50) {
        throw new Error(
          "Resume text is too short. Please upload a complete resume with sufficient content.",
        );
      }

      const prompt = constants.ANALYZE_RESUME_PROMPT.replace(
        "{{DOCUMENT_TEXT}}",
        text.substring(0, 10000), // Limit text length to prevent token limits
      );

      const response = await window.puter.ai.chat(
        [
          {
            role: "system",
            content:
              "You are an expert resume reviewer and career advisor with extensive experience in ATS systems and resume optimization. Provide detailed, actionable feedback.",
          },
          { role: "user", content: prompt },
        ],
        {
          model: "gpt-4o",
          temperature: 0.3, // Lower temperature for more consistent results
        },
      );

      if (!response) {
        throw new Error(
          "No response received from AI service. Please try again.",
        );
      }

      const responseContent =
        typeof response === "string"
          ? response
          : response.message?.content || "";

      if (!responseContent || responseContent.trim().length === 0) {
        throw new Error("Empty response from AI service. Please try again.");
      }

      const result = parseJsonResponse(responseContent);

      if (result.error) {
        throw new Error(result.error);
      }

      // Validate required fields
      if (!result.overallScore || !result.performanceMetrics) {
        throw new Error("Incomplete analysis result. Please try again.");
      }

      return result;
    } catch (err: any) {
      console.error("Analysis error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during analysis. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // ----------------------
  // Handle file upload
  // ----------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    setUploadedFile(file);
    setIsLoading(true);
    setAnalysis(null);
    setResumeText("");
    setPresenceChecklist([]);
    setErrorMessage(null);

    try {
      const text = await extractPDFText(file);

      // Validate if it's a proper resume
      await validateResume(text);

      setResumeText(text);
      setPresenceChecklist(buildPresenceChecklist(text));

      // Run AI analysis
      const aiResult = await analyzeResume(text);
      setAnalysis(aiResult);
      setErrorMessage(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      <div className="dark:bg-main-gradient flex min-h-screen items-center justify-center pb-50 pt-[180px]">
        <div className="container max-w-5xl">
          <div className="mb-6 text-center">
            <h1 className="mb-2 bg-gradient-to-r from-cyan-400 via-teal-500 to-sky-500 bg-clip-text text-3xl font-light text-transparent sm:text-6xl lg:text-7xl">
              Resume Analyzer
            </h1>
            <p className="text-sm text-slate-800 dark:text-slate-300 sm:text-base">
              Upload your pdf resume and get instant feedback
            </p>
          </div>
          {!uploadedFile && !hasStoredResume && !isLoading && !analysis && (
            <div className="upload-area text-center">
              <h3 className="mb-2 text-xl text-slate-700 dark:text-slate-200">
                Upload your resume
              </h3>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={!aiReady}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`btn-primary inline-block ${!aiReady ? "cursor-not-allowed opacity-50" : ""}`}
              >
                Choose PDF File
              </label>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg text-slate-200">Analyzing your resume...</p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded border border-red-500 bg-red-600/20 p-4 text-red-800">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
          {analysis && (uploadedFile || resumeText) && (
            <div className="space-y-16 p-4 sm:px-8 lg:px-16">
              <div className="file-info-card">
                <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-12">
                    <div className="icon-container-xl to cyan-500/20 border-blue-500/30 bg-gradient-to-br from-blue-500/20">
                      <span className="text-2xl">&#128196;</span>
                    </div>
                    <div className="">
                      <h3 className="mb-1 text-xl font-bold text-green-500">
                        Analysis Complete
                      </h3>
                      <p className="break-all text-sm text-slate-300">
                        {uploadedFile?.name ||
                          resumeFileName ||
                          "Resume Analysis"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={reset}
                      className="cursor-pointer rounded-xl border border-red-500/30 bg-red-500 px-24 py-12 text-lg text-red-100 transition hover:bg-red-500/30 dark:bg-red-500/20 dark:text-red-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="score-card">
                <div className="mb-16 text-center">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <span className="text-2xl">&#127942;</span>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                      Overall Score
                    </h2>
                  </div>
                  <div className="relative">
                    <p className="drop-show-lg mb-16 text-6xl font-extrabold text-cyan-400 sm:text-8xl">
                      {analysis.overallScore || "7"}
                    </p>
                  </div>
                  <div
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 ${parseInt(analysis.overallScore) >= 8 ? "score-status-excellent" : parseInt(analysis.overallScore) >= 6 ? "score-status-good" : "score-status-improvement"}`}
                  >
                    <span className="text-lg">
                      {parseInt(analysis.overallScore) >= 8
                        ? "✨"
                        : parseInt(analysis.overallScore) >= 6
                          ? "⭐"
                          : "📈"}
                    </span>
                    <span className="text-lg font-semibold">
                      {parseInt(analysis.overallScore) >= 8
                        ? "Excellent"
                        : parseInt(analysis.overallScore) >= 6
                          ? "Good"
                          : "Needs improvement"}
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out ${
                      parseInt(analysis.overallScore) >= 8
                        ? "progress-excellent"
                        : parseInt(analysis.overallScore) >= 6
                          ? "progress-good"
                          : "progress-improvement"
                    } `}
                    style={{
                      width: `${(parseInt(analysis.overallScore) / 10) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-3 text-center text-sm font-medium text-slate-800 dark:text-slate-400">
                  Score based on content quality , formatting, and keyword usage
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="feature-card-green group">
                  <div className="icon-container-lg mx-auto mb-3 bg-green-500/20 transition-colors group-hover:bg-green-400/30">
                    <span className="text-xl text-green-300">&#10003;</span>
                  </div>
                  <h4 className="mb-16 text-sm font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                    Top Strengths
                  </h4>
                  <div className="space-y-12 text-left">
                    {analysis.strengths.slice(0, 3).map((strength, index) => (
                      <div key={index} className="list-item-green">
                        <span className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-200">
                          {strength}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="feature-card-orange group">
                  <div className="icon-container-lg mx-auto mb-3 bg-orange-500/20 transition-colors group-hover:bg-orange-400/30">
                    <span className="text-xl text-orange-300">&#9889;</span>
                  </div>
                  <h4 className="mb-16 text-sm font-semibold uppercase tracking-wide text-orange-500 dark:text-orange-300">
                    Main improvements
                  </h4>
                  <div className="space-y-12 text-left">
                    {analysis.improvements
                      .slice(0, 3)
                      .map((improvement, index) => (
                        <div key={index} className="list-item-orange">
                          <span className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-200">
                            {improvement}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="section-card group">
                <div className="mb-4 flex items-center gap-3">
                  <div className="icon-container bg-purple-500/20">
                    <span className="text-lg text-purple-300">&#128218;</span>
                  </div>
                  <h4 className="text-white">Executive summary</h4>
                </div>
                <div className="summary-box">
                  <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
                    {analysis.summary}
                  </p>
                </div>
              </div>
              <div className="section-card group">
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container bg-cyan-500/20">
                    <span className="text-lg text-cyan-300">&#128202;</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    Performance metrics
                  </h4>
                </div>
                <div className="space-y-4">
                  {METRIC_CONFIG.map((cfg, i) => {
                    const value =
                      analysis.performanceMetrics?.[cfg.key] ??
                      cfg.defaultValue;
                    return (
                      <div key={i} className="group/item">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cfg.icon}</span>
                            <p className="font-medium text-slate-200">
                              {cfg.label}
                            </p>
                          </div>
                          <span className="font-bold text-slate-300">
                            {value}/10
                          </span>
                        </div>
                        <div className="progress-bar-small">
                          <div
                            className={`h-full bg-gradient-to-r ${cfg.colorClass} rounded transition-all duration-1000 ease-out group-hover/item:shadow-lg ${cfg.shadowClass}`}
                            style={{ width: `${(value / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-card group">
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container bg-purple-500/20">
                    <span className="text-lg text-purple-300">&#128270;</span>
                  </div>
                  <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Resume Insights
                  </h2>
                </div>
                <div className="grid gap-4">
                  <div className="info-box-cyan group/item">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-lg text-cyan-400">&#127919;</span>
                      <h3 className="font-semibold text-cyan-300">
                        Action items
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {(
                        analysis.actionItems || [
                          "Optimize keyword placement for better ATS scoring",
                          "Enhance content with quatifiable achievements",
                          "Consider industry-specific terminology",
                        ]
                      ).map((item, index) => (
                        <div className="list-item-cyan" key={index}>
                          <span className="text-cyan-400">.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="info-box-emerald group/item">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-lg">&#128161;</span>
                      <h3 className="font-semibold text-emerald-300">
                        Pro Tips
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {(
                        analysis.proTips || [
                          "Use action verbs to start bullet points",
                          "Keep descriptions concise and impactful",
                          "Tailor keywords to specific job descriptions",
                        ]
                      ).map((tip, index) => (
                        <div key={index} className="list-item-emerald">
                          <span className="text-emerald-400">.</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-card group">
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container dark:bg-violet-500/20">
                    <span className="text-lg">&#129302;</span>
                  </div>
                  <h2 className="text-xl font-bold text-violet-600 dark:text-violet-400">
                    ATS Optimization
                  </h2>
                </div>
                <div className="info-box-violet">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="">
                      <h3 className="mb-2 font-semibold text-violet-600 dark:text-violet-300">
                        Understanding ATS (Applicant Tracking Systems)
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-200">
                        <strong className="text-violet-600 dark:text-violet-300">
                          Applicant Tracking Systems (ATS)
                        </strong>{" "}
                        are specialized software platforms used by over 98% of Fortune 500 companies and 75% of all employers to automatically filter, parse, and rank resumes before human review. These systems employ sophisticated algorithms to:
                      </p>
                      <ul className="mt-2 ml-4 space-y-1 text-sm text-slate-200">
                        <li>• Extract and categorize information from your resume</li>
                        <li>• Match keywords from job descriptions to candidate profiles</li>
                        <li>• Score and rank candidates based on qualification criteria</li>
                        <li>• Filter out resumes that don't meet minimum requirements</li>
                      </ul>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        <strong className="text-amber-400">Critical fact:</strong> Studies show that up to 75% of qualified candidates are rejected by ATS before their resume reaches a human recruiter, often due to formatting issues rather than lack of qualifications.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="info-box-violet">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-lg text-violet-600 dark:text-violet-400">
                      &#9989;
                    </span>
                    <h3 className="text-lg font-semibold text-violet-600 dark:text-violet-300">
                      Your Resume's ATS Compatibility Status
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(presenceChecklist || []).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3 text-slate-200 transition hover:bg-slate-800/50"
                      >
                        <span
                          className={`mt-0.5 text-xl ${item.present ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {item.present ? "✅" : "❌"}
                        </span>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.atsChecklist && analysis.atsChecklist.length > 0 && (
                  <div className="info-box-violet">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-lg text-amber-400">
                        &#128161;
                      </span>
                      <h3 className="text-lg font-semibold text-violet-600 dark:text-violet-300">
                        Expert ATS Recommendations
                      </h3>
                    </div>
                    <p className="mb-3 text-sm text-slate-300">
                      Based on professional ATS analysis, here are specific actions to improve your resume's compatibility:
                    </p>
                    <div className="space-y-3">
                      {analysis.atsChecklist.map((item, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-amber-500 bg-slate-800/40 p-3 text-slate-200"
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                              {index + 1}
                            </span>
                            <p className="flex-1 text-sm leading-relaxed">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="section-card group">
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container bg-blue-500/20">
                    <span className="text-lg">&#128273;</span>
                  </div>
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Recommended keywords
                  </h2>
                </div>
                <div className="mb-4 flex flex-wrap gap-3">
                  {analysis.keywords.map((k, i) => (
                    <span key={i} className="keyword-tag group/item">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="info-box-blue">
                  <p className="items-start-start flex gap-2 text-sm leading-relaxed text-slate-300">
                    <span className="mt-0.5 text-lg">&#128161;</span>
                    Consider incorporating these keywords naturally into your
                    resume to improve ATS compatibility and increase your
                    chances of getting noticed by recruiters.
                  </p>
                </div>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
